//javascript color palette utilities
//needs colorEditorData.js, chroma.js

function colorItem(color, selected, palette, name, notes) {
	this.color = color
	this.selected = selected
	this.palette = palette
	this.name = color.hex()
	this.notes = notes
 }
function paletteItem(pName,pType, original, edited, visible) {
	this.pName = pName
	this.pType = pType	//regular, sequential, diverging, 3xformatting
	this.oColors = original
	this.eColors = edited
	this.gColors = []	//generated colors for sequentials
	if (visible !=undefined){this.visible = visible}
	else {this.visible = true}
}

function initPalettes(state) {
	state.palettes = []
	var selName = ''
	for (var i=0;i<allPalettes.length;i++) {
		var pVals =parseXML(allPalettes[i])[0]
		state.palettes[i] = createPalette(pVals.hex,pVals.pName,pVals.pType, true)
	}
	applyPFilters()	 
}

function createPalette(hex,pName,pType,visible) {
	var colors = []
	for (var i=0; i< hex.length; i++) {
		colors[i] = new colorItem(chroma(hex[i]),false,pName,hex)
	}
	var p =  new paletteItem(pName, pType, colors, copyColors(colors,pName),visible)
	return p
}
function applyPFilters() {
	for (var p=0; p<state.palettes.length; p++) {
		state.palettes[p].visible = pTypeToVisible(state.palettes[p].pType)	
	}
	var pName = null
	for (var p=0; p<state.palettes.length; p++) {
		if(state.palettes[p].visible) {
			pName = state.palettes[p].pName; break}
	}
	setPalette(state, pName)
	
}
// translate between pType and the state.visibleTypes filters
function pTypeToVisible(pType){
	var visible = false
	if (pType.includes('formatting')){pType = 'formatting'}
	switch (pType) {
		case "regular": 
			visible = state.visibleTypes.regular; break;
		case "ordered-sequential": 
			visible = state.visibleTypes.sequential; break;
		case "ordered-diverging": 
			visible = state.visibleTypes.diverging; break;
		case "formatting": 
			visible = state.visibleTypes.formatting; break;
		case 'none':
			visible = true; break;	//can't filter out the "new palette"
		default: 
			visible = false;
	}
	return visible			
}

function findPalette(palettes,pName) {
	for(var i=0;i<palettes.length;i++) {
		if (palettes[i].pName == pName) {return i}  //we're going to use pointers
	}
	return -1;
}
function addToPalette(palette, hex, selected) {
	var index = palette.eColors.length
	var color = new colorItem(chroma(hex),selected,palette.pName,hex)
	//if the color is a duplicate of the current selection
	//insert it after the current selection
	for (var i=0; i<index; i++) {
		if (hex==palette.eColors[i].color.hex()) {index = i; break}
	} 
	palette.eColors.splice(index,0,color)
	return palette.eColors[index]
}
function deleteFromPalette(palette,point) {
	if (point !=null) {
		for (var index=0; index<palette.length; index ++) {
			if (palette[index] == point) {
				palette.splice(index,1)
			}
		}
	}
}

function setPalette(state,pName) {
	var pIndex = findPalette(state.palettes, pName)
	if (pIndex >=0) {
		state.palette = state.palettes[pIndex]
		state.colors = state.palette.eColors
	}
	else {
		state.palette = null
		state.colors = []
	}
	state.pOrder = []
	state.gColors = []	//generated by interpolation
}
//our colors are array[colorItem]. This makes an array[chroma.color]
//needed for the chroma interpolation functions
function colorsToChroma(colors) {
	var cColors = []
	for (var i=0; i<colors.length; i++) {
		cColors[i]=colors[i].color
	}
	return cColors
}
function chromaToColors(cColors,pName) {  //cColors are hex values
	var colors = []
	for (var i=0; i<cColors.length; i++) {
		colors[i]=new colorItem(chroma(cColors[i]),false,pName)
	}
	return colors
}
function sortColors(colors,sType) {
	switch(sType) {
			case "L": 
				colors.sort(function(c1,c2){return byLCH(c1,c2,0)})
				break;
			case "C":
				colors.sort(function(c1,c2){return byLCH(c1,c2,2)})
				break;
			case "H":
				colors.sort(function(c1,c2){return byLCH(c1,c2,1)})
				break;
		}
		return colors
}

	
function byLCH(cItem1,cItem2, i1) { //colorItems
	var c1 = cItem1.color.lch()
	var c2 = cItem2.color.lch()
	if (c1[i1] > c2[i1]) {
		return 1
	}
	if (c1[i1] < c2[i1]) {
		return -1
	}
	// c1[i1] must be equal to c2[i1]
	return 0;
}

function makeClusters(nClusters,colors) {//list of colorItems
	var lch = []
	for (var i=0;i<colors.length;i++){
		lch[i] = colors[i].color.lch()
	}
	state.clusterMaker.data(lch)
	state.clusterMaker.k(nClusters)
	var clusters = state.clusterMaker.clusters()
	//now we have an array of {centroid, points}
	
}

function parseList(lString, isInt){
	var items = lString.trim().split(',')  //find some number of values
	var vals = []
	for (var i = 0; i<items.length; i++){
		if (isInt == true) {parseInt(items[i].trim())}
		else {vals[i] = parseFloat(items[i].trim())}
	}
	return vals
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
		pVals[pVals.length] = {pName: name, hex: hexValues}
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
	var numStrings =['first','second','third','fourth','fifth', 'sixth', 'seventh', 'eighth', 'ninth']
	var code = ""
	var codeHead = ''
	var cLen = 3
	var nCols = 2
	var sCol = 0
	switch (pType) {
		case "light": {
			codeHead = '{ TS("swatch.light.'
			code = '// ------- Preset lights \n'
			nCols = 9
			cLen = 6
			sCol = 2
			break
		}
		case "dark": {
			codeHead = '{ TS("swatch.dark.'
			code = '// ------- Preset darks \n'
			nCols = 8
			cLen = 6
			sCol = 2
			break;
		}
		case 'gray': {
			sCol = 0
			nCols = 2
			cLen = 5
			code = '// ------- Preset Black And White\n'
			code = code+'{ TS("swatch.firstcol.firstrow"), PE(TS("#000000")) },\n'
			code = code+'{ TS("swatch.secondcol.firstrow"), PE(TS("#FFFFFF")) },\n\n'
			code = code+'// ------- Preset Grays\n'
			codeHead = '{ TS("swatch.' //gray doesn't include a type
			break;	
		}
	}
	//now we fill in the rows and columns
	var cIndex = 0	//for the colors
	for (var col =0; col< nCols; col++){
		var gHack = 0;
		if (pType=='gray') {gHack = 1}	//force black and white to be at top
		var cHead = codeHead+numStrings[sCol]+'col.'
		sCol = sCol+1
		for (var row=0; row < cLen; row++){
			if (cIndex>=colors.length){return code}  
			code = code+cHead+numStrings[row+gHack]+'row"), PE(TS('
			code = code+'\"'+colors[cIndex].color.hex().toUpperCase()+'\")) },\n'
			cIndex = cIndex+1
			if (cIndex>colors.length){return code}  //ick, but two breaks is ick also
		}
	}				
	return code
}

function paletteToFormattingXML(colors, pType) {
	//pType = light, dark, gray
	var numStrings =['first','second','third','fourth','fifth', 'sixth', 'seventh', 'eighth', 'ninth']
	var xml = ""
	var xmlHead = ''
	var cLen = 3
	var nCols = 2
	var sCol = 0
	switch (pType) {
		case "light": {
			xmlHead = "<preference name=\'swatch.light."
			nCols = 9
			cLen = 6
			sCol = 2
			break
		}
		case "dark": {
			xmlHead = "<preference name=\'swatch.dark."
			nCols = 8
			cLen = 6
			sCol = 2
			break;
		}
		case 'gray': {
			sCol = 0
			nCols = 2
			cLen = 5
			xml = "<preference name='swatch.firstcol.firstrow' value='#000000' />\n"
			xml = xml+"<preference name='swatch.secondcol.firstrow' value='#ffffff' />\n"
			xmlHead = "<preference name='swatch."  //gray doesn't include a type
			break;	
		}
	}
	//now we fill in the rows and columns
	var cIndex = 0	//for the colors
	for (var col =0; col< nCols; col++){
		var gHack = 0;
		if (pType=='gray') {gHack = 1}	//force black and white to be at top
		var cHead = xmlHead+numStrings[sCol]+'col.'
		sCol = sCol+1
		for (var row=0; row < cLen; row++){
			if (cIndex>=colors.length){return xml}  
			xml = xml+cHead+numStrings[row+gHack]+"row'"
			xml = xml+ " value=\'"+colors[cIndex].color.hex()+"\' />\n"
			cIndex = cIndex+1
			if (cIndex>colors.length){return xml}  //ick, but two breaks is ick also
		}
	}				
	return xml
}

function copyColors(cArray, pName) { //deep copy of an array of color items
	var colors = []
	for (var i=0; i<cArray.length; i++) {
		var c = cArray[i]
		colors[i] = new colorItem(chroma(c.color.hex()), c.selected, c.palette, c.name)
	}
	return colors
}

function copyPalette(palette,newName) {
	//we need to create new color elements for the new palette
	var colors = copyColors(palette.eColors,newName)
	var p =  new paletteItem(newName, palette.pType, colors, copyColors(colors,newName))
	return p
}


labToHex = function(labVals) {
	var hexVals = []
	var v =[]
	for (var i=0; i<labVals.length; i++) {
		v = labVals[i]
		hexVals[i] = chroma.lab(v[0],v[1],v[2]).hex()
	}
	return hexVals
}
function computeStats(colors){
	var stats = {dE:[], minE: 0, maxE:0, aveE:0, totalE: 0}
	var prev = colors[0]
	var total = 0
	for (var i=1; i<colors.length; i++) {
		stats.dE[i-1] = deltaE(prev.color,colors[i].color)
		total = total+stats.dE[i-1]
		prev = colors[i]
		stats.dE[i-1] = Math.round(stats.dE[i-1])
	}
	stats.minE = Math.min(...stats.dE)
	stats.maxE = Math.max(...stats.dE)
	stats.aveE = Math.round(total/stats.dE.length)
	stats.totalE = Math.round(total)
	return stats
}
//color differences between chroma.js colors
//the basic one.
function deltaE(c1,c2){
	var lab1 = c1.lab()
	var lab2 = c2.lab()
	var dL = lab1[0]-lab2[0]
	var da= lab1[1]-lab2[1]
	var db= lab1[2]-lab2[2]
	var dE = Math.sqrt(dL*dL+da*da+db*db)
	return dE
}

//A somewhat better one.
//But, note this is an asymmetric function, deltaE94(c1,c2) != deltaE94(c2,c1)
function deltaE94(c1,c2){  
	var lab1 = c1.lab()  //.lch() returns the wrong h
	var lab2 = c2.lab()
	var C1 = Math.sqrt(lab1[1]*lab1[1]+lab1[2]*lab1[2]) //sqrt(a*a+b*b)
	var C2 = Math.sqrt(lab2[1]*lab2[1]+lab2[2]*lab2[2]) //sqrt(a*a+b*b)
	var da= lab1[1]-lab2[1]
	var db= lab1[2]-lab2[2]
	
	//various weights. There are also kL, kC, kH, but they are all 1.0
	var K1 = 0.045
	var K2 = 0.015
	var SL = 1
	var SC = 1+K1*C1  //note the dependency on C1 only
	var SH = 1+K2*C1
	//these factors are dV/SV, will distance them below
	var fdL = (lab1[0]-lab2[0])/SL
	var fdC = (C1-C2)/SC
	var fdH = Math.sqrt(da*da+db*db-(dC*dC))/SH
	var dE94 = Math.sqrt(fdL*fdL + fdC*fdC + fdH*fdH)
	return dE94
	
}