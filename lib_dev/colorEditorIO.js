
function parseList(lString, isInt){
	var items = lString.trim().split(',')  //find some number of values
	var vals = []
	for (var i = 0; i<items.length; i++){
		if (isInt == true) {parseInt(items[i].trim())}
		else {vals[i] = parseFloat(items[i].trim())}
	}
	return vals
}
function inputPalettes(hString) {
	hString = hString.trim()
	if (hString[0] == '<') {return parseXML(hString)}
	else {return parseHexString(hString)}
}
function parseHexString(hString) {
	var palettes = hString.trim().split("/")
	if (palettes[palettes.length-1]=="") {palettes = palettes.slice(0,-1)}	//dangling /
	var pVals = []
	for (var p = 0; p<palettes.length; p++) {
		hString = palettes[p]
		var hexValues = hString.trim().split(",") //clean up surrounding white space, then find commas
		if (hexValues[hexValues.length-1]=="") {hexValues = hexValues.slice(0,-1)}	//dangling ,
		for (var i = 0; i<hexValues.length; i++) { //now tidy each item
			hexValues[i] = hexValues[i].replace(/['"]+/g, '')  //remove quotes
			hexValues[i] = hexValues[i].trim()
		}
		var name =null
		//look for a name
		if (hexValues[0][0] != '#') { //assume it's a name plus the first hex value
			var front = hexValues[0].split('#')
			if (front.length != 2) {
				console.log("hex string error")
				console.log(hString)
				return {name: null, hex: null}
			} else { 
				hexValues[0] = "#"+front[1]	//put the # back on
				name = front[0].trim()  
				name =name.replace(/['"]+/g, '')  //remove quotes
			}
		}
		pVals[pVals.length] = {pName: name, hex: hexValues, pType: null}
	}
	return pVals
}
function createHexString(colors, pName) {
	if (colors.length==0){return pName}
	var hexString
	if (pName !=null) {hexString = pName + '  '}
	hexString = hexString + colors[0].color.hex()
	for (var i = 1; i<colors.length; i++) {
		hexString = hexString+', '+colors[i].color.hex()
	}
	return hexString
}
function paletteToCSV(colors, pName,header){
	if (colors.length==0){return ''}
	var csvString = ""
	if (header==true) {csvString =	"index,name,hex,L,C,H,a,b\n"}
	for (var i = 0; i<colors.length; i++) {
		var hex=colors[i].color.hex()
		var lab=colors[i].color.lab()
		var lch=colors[i].color.lch()
		var row = i.toString()+','+pName+','+hex+','
			+lch[0].toString()+','+lch[1].toString()+','+lch[2].toString()+','
			+lab[1].toString()+','+lab[2].toString()+'\n'
		csvString = csvString+row
	}
	return csvString
}
function parseXML(xmlString) {
	var doc = jQuery.parseXML('<all>'+xmlString+'</all>')	//would be nice to catch an error here
	var pVals = []
	var palettes = $(doc).find("color-palette")
	$(palettes).each(function () {
			var pName = $(this).attr("name")  //no problem if this is null
			var pType = $(this).attr("type")
			var colors = $(this).find("color")	//array of <color>#vvvvvv</color>
			hexValues = []
			$(colors).each(function () {
				var c = $(this).text().trim()
				hexValues[hexValues.length] = c
			})
			pVals[pVals.length] = {pName: pName, pType: pType, hex: hexValues}
		})
	return pVals
}
function paletteToXML(colors, pName, pType) {
	var ptp = pType.split('.')	//picks a basic type
	var xml = ''
	if (ptp[0]=='formatting'){xml = paletteToFormattingXML(colors,ptp[1])}
	else {
		xml = '<color-palette name='+'\"'+pName+'\"'+' type = \"' + ptp[1] +'\">\n'
		for (var i=0;i<colors.length;i++) {
			xml = xml+'<color>'+colors[i].color.hex()+'</color>\n'
		}
		xml = xml+'</color-palette>\n'
	}
	return xml
}
//assume the interpolation is done. Now we need to write out the 10 palettes, each with nSteps of colors
//call from the command line
function writeMultiOrdinal(nSteps) { 
	colors = state.colors
	code = ''
	cNames = ['blue','orange','green','gold','teal','red','gray','pink','purple','brown']
	pNames = []
	for (var i =0; i<10; i++){
		var palette = colors.slice(i*nSteps,(i+1)*nSteps)
		pNames.push('multiordinal_'+cNames[i]+'_10_0')
		code=code+paletteToCode(palette,pNames[i],'multi')
	}
	for (var i =0; i<10; i++){
		code = code+'ColorPaletteID(\"'+pNames[i]+'\"),\n'
	}
	$('#io-text').val(code)
}
function paletteToCode(colors,pName,pType) {
	var ptp = pType.split('.')	//picks a basic type
	var code = ''
	if (ptp[0]=='formatting'){
		code = paletteToFormattingCode(colors,ptp[1])
	}
	//pal = make_unique<TableauColorPalette>(ColorPaletteID(TS("tableau-color-blind")), PaletteRegular, IDS_PALETTE_COLORBLIND);
	else {
		var id = pNameToCodeID(pName)
		code = '\/\/ '+pName+'\n'
		code = code+ 'pal = make_unique<TableauColorPalette>(ColorPaletteID(TS('+'\"'+pName+'\"'+')), ' + xmlToCodeType(ptp[0]) +', '+id+');\n'
		code = code+'pal->SetColors({\n'
		for (var i=0;i<colors.length;i++) {
			code = code +'    ColorObjectFromRGB('+colorToCodeHex(colors[i]) +'),\n'
		}
		code = code +'});\n'
		if (pType =='multi') {
			code = code + 'pal->SetFlags(multiDimensionFlags);\n'
			code = code + 's_tableauPalettes.emplace_back(std::move(pal));\n\n'
		} else {
			code = code + 's_tableauPalettes.emplace_back(std::move(pal));\n'
			code = code + pNameToCode(pName)+'\n'
		}
		
	}
	return code
	
}
function pNameToCode(pName){
	var id = pNameToCodeID(pName)
	var code = '[ '
	code = code +id+',    '+'\"'+pName+'\"  ]'
	return code
}

function pNameToCodeID(pName){
	return'IDS_PALETTE_'+pName.toUpperCase()
}
function xmlToCodeType (xmlType){
	var codeType = "PaletteRegular"
	switch(xmlType) {
		case "ordered-sequential": codeType = "PaletteOrderedSequential"; break;
		case "ordered-diverging":  codeType = "PaletteOrderedDiverging"; break;
		case 'multi': codeType = "PaletteOrderedSequential"; break;
	}
	return codeType
}
function colorToCodeHex(color){
	var hex = color.color.hex().substring(1).toUpperCase()	//split off the #
	return '0x'+hex
}

function paletteToFormattingCode(colors, pType) {
	//pType = light, dark, gray
	var code = ""
	var codeHead = ''
	var cLen = 3
	var nCols = 2
	var sCol = 0
	var preview = ''
	switch (pType) {
		case "light": {
			codeHead = '{ TS("swatch.light'
			code = '// ------- Preset lights \n'
			nCols = 8
			cLen = 6
			sCol = 2
			break
		}
		case "lightPreview": {
			codeHead = '{ TS("swatch.light'
			code = '// ------- Preset lights \n'
			nCols = 8
			cLen = 6
			sCol = 3
			preview = '.preview'
			break
		}
		case "dark": {
			codeHead = '{ TS("swatch.dark'
			code = '// ------- Preset darks \n'
			nCols = 7
			cLen = 6
			sCol = 3
			break;
		}
		case 'gray': {
			sCol = 1
			nCols = 2
			cLen = 5
			code = '// ------- Preset Black And White\n'
			code = code+'{ TS("swatch.col1.row1"), PE(TS("#000000")) },\n'
			code = code+'{ TS("swatch.col2.row1"), PE(TS("#FFFFFF")) },\n\n'
			code = code+'// ------- Preset Grays\n'
			codeHead = '{ TS("swatch.' //gray doesn't include a type
			break;	
		}
	}
	//now we fill in the rows and columns
	var cIndex = 0	//for the colors
	for (var col =1; col<= nCols; col++){
		var gHack = 0;
		if (pType=='gray') {gHack = 1}	//force black and white to be at top
		var cHead = codeHead+'.col'+sCol.toString()
		sCol = sCol+1
		for (var row=1; row <= cLen; row++){
			if (cIndex>=colors.length){return code}  
			code = code+cHead+'.row'+ row.toString()+preview
			code = code+'), PE(TS('
			code = code+'\"'+colors[cIndex].color.hex().toUpperCase()+'\")) },\n'
			cIndex = cIndex+1
			if (cIndex>colors.length){return code}  //ick, but two breaks is ick also
		}
	}				
	return code
}

function paletteToFormattingXML(colors, pType) {
	//pType = light, light_prev, dark, gray
	var xml = ""
	var xmlHead = ''
	var isPreview =''
	var cLen = 3
	var nCols = 2
	var sCol = 1
	switch (pType) {
		case "light": {
			xmlHead = "<preference name=\'swatch.light"
			nCols = 8
			cLen = 6
			sCol = 3
			break
		}
		case "lightPreview": {
			xmlHead = "<preference name=\'swatch.light"
			nCols = 8
			cLen = 6
			sCol = 3
			isPreview = '.preview'
			break
		}
		case "dark": {
			xmlHead = "<preference name=\'swatch.dark"
			nCols = 8
			cLen = 6
			sCol = 3
			break;
		}
		case 'gray': {
			sCol = 1
			nCols = 2
			cLen = 5
			xml = "<preference name='swatch.col1.row1' value='#000000' />\n"
			xml = xml+"<preference name='swatch.col2.row1' value='#FFFFFF' />\n"
			xmlHead = "<preference name=\'swatch"  //gray doesn't include a type
			break;	
		}
	}
	//now we fill in the rows and columns
	var cIndex = 0	//for the colors
	for (var col =1; col<= nCols; col++){
		var gHack = 0;
		if (pType=='gray') {gHack = 1}	//force black and white to be at top
		var cHead = xmlHead+".col"+sCol.toString()
		sCol = sCol+1
		for (var row=1; row <= cLen; row++){
			if (cIndex>=colors.length){return xml} 
			var rowNum = row+gHack
			xml = xml+cHead+".row"+rowNum.toString()+isPreview+"\'"
			xml = xml+ " value=\'"+colors[cIndex].color.hex().toUpperCase()+"\' />\n"
			cIndex = cIndex+1
			if (cIndex>colors.length){return xml}  //ick, but two breaks is ick also
		}
	}				
	return xml
}
function shuffle(colors,gSize) {
	//this is primarily for formatting. Takes hue order, shuffles
	var nArray = []
	var offset = Math.floor(colors.length/2)	//need an int
	for (var i=0; i<offset; i = i+gSize){
		for (var g=0; g<gSize; g++){
			nArray.push(colors[i+g])
		}
		for (var g=0; g<gSize; g++){
			nArray.push(colors[i+g+offset])
		}	
	}
	return nArray
	
}