//javascript color plotting routines, using D3
//class, needs a chroma color to initialize
var tableau10= ['#1F77B4','#FF7F0E','#2CA02C','#D62728','#9467BD','#8C564B','#E377C2','#7F7F7F','#BCBD22','#17BECF']

var tableauLight= ['#AEC7E8','#FFBB78','#98DF8A','#FF9896','#C5B0D5','#C49C94','#F7B6D2','#C7C7C7','#DBDB8D','#9EDAE5']

var tableauMedium= ['#729ECE','#FF9E4A','#67BF5C','#ED665D','#AD8BC9','#A8786E','#ED97CA','#A2A2A2','#CDCC5D','#6DCCDA']

var tableau20= ['#1F77B4','#AEC7E8','#FF7F0E','#FFBB78','#2CA02C','#98DF8A','#D62728','#FF9896','#9467BD','#C5B0D5', '#8C564B','#C49C94','#E377C2','#F7B6D2','#7F7F7F','#C7C7C7','#BCBD22','#DBDB8D','#17BECF','#9EDAE5']

var gray5= ['#60636a','#a5acaf','#414451','#8f8782','#cfcfcf']

var colorblind= ['#006ba4','#ff800e','#ababab','#595959','#5f9ed1','#c85200','#898989','#a2c8ec','#ffbc79','#cfcfcf']

var vizable= ['#E75727', '#006AA4', '#7BC44E', '#893883', '#2EB9CD', '#FCB025', '#3C8D7D', '#CD4C8D']

var T10Mod2 = ['#3185b9', '#fcb025', '#679445', '#c9b42f', '#b23945', '#e6949e', '#00a2a5', '#c7c7c7', '#8c6882', '#b6926b']

var cristy_all =['#BB4E4E', '#F05A5B', '#D96565', '#CF423B', '#9E332D', '#E56259', '#ED837A', '#D96358', '#F1685B', '#F3786C', '#EF7B6B', '#EC5F49', '#F26D5A', '#F15C42', '#F69883', '#AF3F25', '#CD6249', '#CE4828', '#F37952', '#F05822', '#E1835C', '#F47C4A', '#F4804C', '#EA6428', '#F0AD8D', '#F58851', '#CC6B31', '#F69353', '#F37420', '#F79654', '#F79552', '#F1AD71', '#EEA35E', '#F68F1E', '#F9A03A', '#FAA949', '#F29D34', '#FBAF3C', '#E3A43E', '#FFD285', '#FEC862', '#F1B84F', '#FFDC94', '#F9E2B3', '#F2C057', '#A39986', '#FBCA5F', '#FEE6AC', '#F5D176', '#FFD361', '#F1D990', '#EFC94C', '#EEC519', '#E1D289', '#FDE777', '#D8CA83', '#FCEDA6', '#F1E4A1', '#F1E293', '#F1EABE', '#F1E4A1', '#F1E293', '#F1EABE', '#FEE010', '#ECDB5F', '#F6E866', '#C2B93C', '#E1E1B9', '#E0E21B', '#878963', '#BFC954', '#A6B44F', '#E4ECB6', '#BDD63B', '#CFE081', '#59632B', '#B7D445', '#8CA13B', '#B1D247', '#BFD970', '#D0DDAF', '#A9D047', '#808F5D', '#A8CE54', '#D5E7B2', '#84A53D', '#D9E9BC', '#B8D987', '#A2C76F', '#76984C', '#567334', '#A9C788', '#A5C77E', '#7EA551', '#A0CC72', '#314222', '#8DBF66', '#A4C78F', '#9DBF8E', '#578F3F', '#75A65F', '#899984', '#264020', '#B0D9A8', '#9ACB92', '#A4BAA2', '#A9D6A5', '#B1DAAF', '#C8E4C6', '#576157', '#4D694E', '#A6D6A9', '#CFE8D0', '#A6C8AD', '#80AB8A', '#6DAF7E', '#4FAB69', '#698070', '#ABC8B5', '#6EC28C', '#85CA9E', '#356245', '#427356', '#A7C1B2', '#6B937F', '#83BFA3', '#42826C', '#259976', '#77A99A', '#A9D9CB', '#63C3A9', '#216F5A', '#67BFA7', '#7CB3A4', '#588B7E', '#3D9981', '#1F8A70', '#8CBEB2', '#76C9B4', '#227864', '#5DC2AC', '#43A08E', '#499E8D', '#008C71', '#56B2A2', '#1A9481', '#54C2B5', '#007369', '#00766C', '#7DC9C3', '#2BA29B', '#2B9993', '#298782', '#00736D', '#569391', '#03605D', '#00BAB4', '#6FC9C7', '#427676', '#5CA6A5', '#4CA9AA', '#15A3A4', '#068587', '#00A2A5', '#00383B', '#117175', '#3C7073', '#02474C', '#105156', '#22757C', '#2C858D', '#205860', '#1F5860', '#0E5561', '#0E4F5A', '#1E4147', '#3D6066', '#235B66', '#385D66', '#025770', '#376D7C', '#27596A', '#BCE5F2', '#004056', '#1C4F63', '#81C1DC', '#142C37', '#3488AD', '#102129', '#5B8DA2', '#3F687B', '#00557C', '#186D94', '#00283D', '#274351', '#153241', '#3A5A68', '#033D5C', '#00476F', '#56626B', '#427299', '#ABC7E1', '#485F73', '#375D81', '#41505E', '#C4D7EC', '#364E6B', '#173051', '#AEB7C4', '#343F4F', '#5B6470', '#CFD7E2', '#8C93A0', '#BBBFC7', '#3A3F49', '#E1E5F3', '#48406A', '#272332', '#6D5879', '#534557', '#3C233C', '#412335', '#7E566B', '#54213B', '#9E637E', '#8F4F6A', '#B31E5A', '#4C1B2E', '#5C4B51', '#AD5472', '#6C0024', '#F3AAC1', '#8D0029', '#A73E5C', '#7A1631', '#644D52', '#C74663', '#DD254C', '#7C172B', '#BB4059', '#A7213A', '#EF778B', '#BC1F37', '#F16D7E', '#EF4B53', '#C42C2F', '#632E2F', '#8C4646', '#1F2227', '#322431', '#494D4B']
var affect =  ['#1C642B','#3E6385','#6B6F5D','#8BA552','#61A7A5','#66BEC6','#87ACEC','#93A87A','#303F32','#415A27','#477E17','#554CBC','#629F5A','#658A21','#793AA2','#836B1F','#890E01','#0879B2','#4881BC','#5693EF','#7385B9','#7655CE','#17487A','#59562C','#013600','#213848','#353028','#713713','#919468','#A29CBB','#A133B1','#A857AA','#A9713C','#A86392','#AD9042','#B52E38','#BDA983','#C7B3C1','#C67036','#DDB590','#F46829','#FC1F05']

function colorItem(color, selected, palette, name, notes) {
	this.color = color
	this.selected = selected
	this.palette = palette
	this.name = name
	this.notes = notes
 }
function paletteItem(pName,pType, original, edited) {
	this.pName = pName
	this.pType = pType	//regular, sequential, formatting
	this.oColors = original
	this.eColors = edited
	this.gColors = []	//generated colors for sequentials
	this.version = 0
}
function hexFromName(name) {
	var hex
	switch(name) {
		case "Tableau 10": hex=tableau10; break;
		case "Tableau 20": hex=tableau20; break;
		case "Colorblind": hex=colorblind; break;
		case "Tableau Light": hex=tableauLight; break;
		case "Gray 5": hex=gray5; break;
		case "Affect": hex=affect; break;
		case "Cristy All": hex=cristy_all; break;
		case "New Palette": hex = []; break;
		case "Vizable": hex = vizable; break;
		case "T10 Mod2": hex=T10Mod2; break;
		default: hex = [];
	}
	return hex
}
function initPalettes(state) {
	var pNames = ["New Palette","Tableau 10","Tableau 20","Tableau Light", "T10 Mod2"]
	state.palettes = []
	for (var i=0;i<pNames.length;i++) {
		var hex = hexFromName(pNames[i])
		state.palettes[i] = createPalette(hex, pNames[i])
	}
	setPalette(state,pNames[1])	 
}
function findPalette(palettes,pName) {
	for(var i=0;i<palettes.length;i++) {
		if (palettes[i].pName == pName) {return i}  //we're going to use pointers
	}
}
function addToPalette(palette, hex, selected) {
	var index = palette.eColors.length
	palette.eColors[index] = new colorItem(chroma(hex),selected,palette.pName,'regular')
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
	state.palette = state.palettes[findPalette(state.palettes, pName)]
	state.colors = state.palette.eColors
	state.pOrder = []
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
function createPalette(hex,pName,pType) {
	var colors = []
	for (var i=0; i< hex.length; i++) {
		colors[i] = new colorItem(chroma(hex[i]),false,pName,'regular')
	}
	var p =  new paletteItem(pName, pType, colors, copyColors(colors,pName))
	return p
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