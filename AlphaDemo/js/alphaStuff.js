//javascript routines to do drawing and other computations for the Alpha demo
//for now, to keep the code easier to edit, debug
var origGrays= ["#F7F7F7", "#F0F0F0", "#ACACAC", "#D7D7D7", "#DBDBDB", "#999999", "#7F7F7F", "#555555", "#B0B0B0", "#F2F2F2", "#E2E2E2"]

alphaFromGray = function (gray) { //assume it's gray
	rgb = chroma(gray).rgb()
	return(1-rgb[0]/255.0)
}

grayFromAlpha = function(alpha) {//assume black on white
	p = Math.round(255*(1-alpha))
	return chroma.rgb([p,p,p])
}


alphaToRGBColor = function (alpha, bg, fg) { //bg and fg are rgb arrays 
	r = alpha*fg[0] + (1-alpha)*bg[0];
	g = alpha*fg[1] + (1-alpha)*bg[1];
	b = alpha*fg[2] + (1-alpha)*bg[2];
	return [r,g,b]
}
alphaToRGBColorGC = function(alpha,bg,fg) {
	var fg_gc = [toLum(fg[0]),toLum(fg[1]),toLum(fg[2])]
	var bg_gc = [toLum(bg[0]),toLum(bg[1]),toLum(bg[2])]
	var c = alphaToRGBColor(alpha,bg_gc,fg_gc)
	return [fromLum(c[0]),fromLum(c[1]),fromLum(c[2])]
}
var gamma = 2.2
toLum = function(v) {
	return Math.pow(v/255.0,gamma)
}
fromLum = function(v) {
	return Math.round(Math.pow(v,1/gamma)*255)
}	
		

initColorData = function(state) {
	state.alphaV[0] = origGrays.map(alphaFromGray)
	state.alphaV[0].sort()
	//the 0th values are the originals on white. Set them once.
	state.grayV = state.alphaV[0].map(grayFromAlpha)
	state.colorV[0] = state.grayV.slice()
	state.lumV[0] = state.colorV[0].map(function(v) {return v.luminance()})
	var temp = state.bColor   //hack to make the contrast ratio with white work
	state.bColor = chroma("white")								
	state.crV[0] = state.lumV[0].map(weberContrast)  //white bkgnd
	state.bColor = temp
	//init some arrays
	updateColorData(state)
}

updateColorData = function(state) {
	var bg = state.bColor.rgb() // the background color
	var fg = state.fColor.rgb() //the foreground color
	//just apply alpha to the new background
	state.alphaV[1] = state.alphaV[0].slice()
	for (var i=0; i< state.alphaV[1].length; i++) {
		state.colorV[1][i] = chroma.rgb(alphaToRGBColor(state.alphaV[1][i],bg,fg))
	}
	//gamma correct before applying alpha
	for (var i=0; i< state.alphaV[0].length; i++) {
		state.alphaV[2][i] = state.alphaV[0][i]
		state.colorV[2][i] = chroma.rgb(alphaToRGBColorGC(state.alphaV[2][i],bg,fg))
	}
	for (var i = 1; i<3; i++){
		state.lumV[i] = state.colorV[i].map(function(v) {return v.luminance()})
		state.crV[i] = state.lumV[i].map(weberContrast)
	}
	
}
	

weberContrast = function(fg,bg) {
	var bg = state.bColor.luminance()
	if (bg==0) {return -1}
	else {return (bg-fg)/bg}
}


ratioContrast = function(fLum) {
	var bLum = state.bColor.luminance()
	if ((fLum==0) || (bLum == 0)) { return -1}
	else if (bLum > fLum) {return bLum/fLum}
	else {return fLum/bLum}
}
