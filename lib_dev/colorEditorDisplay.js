//display functions for the Color Palette Editor. Depends on the global variable state
//also depends on knowing the names of the div's defined in the main module.
updatePlots = function() {
	//cleanup the previous display
	d3.select("#pExamples").selectAll("div").remove()	//the examples
	d3.select('#plots').selectAll("svg").remove(); //the LAB Plots
	d3.select("#pSpace").selectAll("div").remove()	//all Palettes
	d3.select("#statSpace").selectAll("div").remove()	//stats
	var stats = computeStats(state.colors,$('input:radio[name=stats-type]:checked').val())
	if ($('#all-palettes').prop('checked')==true) {		
		displayAllPalettes()	//uses the eColor from each palette. uses global state
	} else {
		displayColorspace()	//maybe should be an option rather than an either/or
	}
	if (stats !=null) {displayStats(stats)}
	displayExamples(stats)	//has its own logic for deciding what examples to show.
}


hex2tip = function(hex) {
	var c = chroma(hex)
	var lch = c.lch()
	var tip = formatTriple(lch,3)+" "+hex
	return tip
}
//controls the size, shape and extent of the LAB plots

var plotSpec = {aMin: -100, aMax: 100, bMin:-100, bMax: 100, lMin: 0, lMax: 100, abSize: 385, lWidth: 100, lTop: 23, pSize: 8, selScale: 1.5}
function setPlotSpec(aVals,bVals,lVals) {
	//aVals and bVals might be pairs, or they might be single value
	if (aVals.length == 2) {plotSpec.aMin = aVals[0]; plotSpec.aMax = aVals[1]}
	else {plotSpec.aMin = -aVals[0], plotSpec.aMax = aVals[0]}
	if (bVals.length == 2) {plotSpec.bMin = bVals[0]; plotSpec.bMax = bVals[1]}
	else {plotSpec.bMin = -bVals[0]; plotSpec.bMax = bVals[0]}
	plotSpec.lMin = lVals[0]
	plotSpec.lMax = lVals[1]
}

function displayStats(stats){
	var cGroup = d3.select('#statSpace')
		.append('div')
		.attr('class','statString')

	myString ='range dE: '+stats.minE.toString()
		+'-'+stats.maxE.toString()
		+', '+(stats.maxE-stats.minE).toString()
		+'   ave dE: '+stats.aveE.toString()
		+'   ave totalE: '+stats.totalE.toString()
		
	cGroup = d3.select('#statSpace').append('div').attr('class','statString').append('text').text(myString)
}
function displayColorspace() {
	var abSize = plotSpec.abSize
	var lWidth = plotSpec.lWidth
	
	var aRange = plotSpec.aMax-plotSpec.aMin
	var bRange = plotSpec.bMax-plotSpec.bMin
	var lRange = plotSpec.lMax-plotSpec.lMin
	var lScale = (plotSpec.abSize-plotSpec.lTop)/lRange
	var aScale = plotSpec.abSize/aRange
	var bScale = plotSpec.abSize/bRange
	var aCenter = aScale*Math.abs(plotSpec.aMin)
	var bCenter = bScale*Math.abs(plotSpec.bMin)
	
	function toPixels (lab) {
		var cL = [0,0]	//center for L, in pixel coordinates
		var cAB = [0,0]	//center for AB
		var lHeight = plotSpec.abSize - plotSpec.lTop //space for the label, bottom
		cL[0] = plotSpec.lWidth/2.0
		cL[1] = (plotSpec.lTop+lHeight-lScale*(lab[0]-plotSpec.lMin))
		cAB[0] = aCenter + aScale*lab[1]
		cAB[1] = (abSize-bCenter) - bScale*lab[2]	//stupid upside down Y
		return {cL: cL, cAB: cAB}
	}
	
	
//create the svg frames. Will eventually add axes, etc. here
	var svg_ab = d3.select("#abPlot")
		.append("svg")
		.attr("width", abSize).attr("height",abSize)
		.style("border", "1px solid lightgray")
	var svg_L = d3.select("#LPlot")
		.append("svg")
		.attr("width", lWidth).attr("height",abSize)
		.style("border", "1px solid lightgray")
	
	svg_ab.append("line").attr("x1", 0).attr("y1", abSize-bCenter)
		.attr("x2",abSize).attr("y2",abSize-bCenter)
		.style({stroke: "lightgray", "stroke-width": "1px"})
	svg_ab.append("line").attr("x1", aCenter).attr("y1",0)
		.attr("x2", aCenter).attr("y2",abSize)
		.style({stroke: "lightgray", "stroke-width": "1px"})
	svg_ab.append("text").text("CIELAB a*,b*").attr("y",20).attr("x",5)
	svg_L.append("text").text("CIELAB L*").attr("y",20).attr("x",8)
//loop over the colors
	for (i = 0; i<state.colors.length; i++) {
		var d = state.colors[i]
		var lab = d.color.lab()
		var hex = d.color.hex()
		var tip = hex2tip(hex)
		var pos = toPixels(lab)	//[cx,cy] for L and ab plots
		
		var pSize = plotSpec.pSize
		if (d.selected){pSize = pSize*plotSpec.selScale}
//a,b points
		var svgPt = svg_ab.append("circle")
		.attr("r", pSize)
		.attr("cx", pos.cAB[0])
		.attr("cy", pos.cAB[1])
		.attr("fill",hex)
		.attr("tip",tip)
		.attr('cIndex',i)
		addActions(svgPt)
		addTooltip(svgPt)
		
//L* points
		var lW = lWidth/2
		var lH = 2
		if (d.selected){lW = lW*plotSpec.selScale}
		svgPt = svg_L.append("rect")
		.attr("width",lW)
		.attr("height", lH)
		.attr("x", pos.cL[0]-lW/2)
		.attr("y", pos.cL[1]-lH/2)
		.attr("fill",hex)
		.attr("tip",tip)
		.attr('cIndex',i)
		addActions(svgPt)
		addTooltip(svgPt)
	}
}
function displayAllPalettes() {
	var stats_type = $('input:radio[name=stats-type]:checked').val()
	
	var pHeight = 32;
	var pGap = 8;
	var pW = 24
	var pH = 32
	var mGap = 5
	var xStep = pW+mGap
	
	//depend on the global variable state
	onPatchClick = function(){ 
		var svgPt = d3.select(this)
		var pIndex = parseInt(svgPt.attr('pIndex'))
		var palette = state.palettes[pIndex]
		if (palette != state.palette) {
			$("#select-palette").val(state.palettes[pIndex].pName)
			$( "#select-palette" ).selectmenu( "refresh" )
			changePalette()
		}
		myOnClick(svgPt) //it's a graphic
	}
	onLabelClick = function(){ 
		var svgPt = d3.select(this)
		var pIndex = parseInt(svgPt.attr('pIndex'))
		var palette = state.palettes[pIndex]
		if (palette != state.palette) {
			$("#select-palette").val(state.palettes[pIndex].pName)
			$( "#select-palette" ).selectmenu( "refresh" )
			changePalette()
		}

	}
	
	for (var i =0; i<state.palettes.length; i++) {
		var p = state.palettes[i]
		if (p.visible == false){continue}
		var pID	= "p"+i.toString()
		var cGroup = d3.select('#pSpace').append('div').attr('class','control-group')
		cGroup.append('div').attr('class','pLable').text(p.pName.replace('_',' '))
			.style("width","95px")
			.style('margin-top', '12px')
			.attr('pIndex',i)
			.on('click',onLabelClick)
		
		if (p==state.palette) {
			cGroup.style("color",'black')
		} else {
			cGroup.style('color','gray')
		}
		var stats = computeStats(p.eColors,stats_type)
		if (stats != null) {
			cGroup.append('div').attr('class','pLable')
				.text(stats.totalE.toString())
				.style("width","20px")
				.style('margin-top', '12px')
				.style('margin-left', '5px')
		}
		var pBox = cGroup.append('div').append('svg')
			.attr("width",23*xStep)
			.attr("height",pHeight+pGap)
		
		for (var c =0;c<p.eColors.length;c++) {
			var color = p.eColors[c]
			var offset = 0
			if (color == state.selectedPt) {offset = pGap/2}
			var hex = color.color.hex()
			var patch = pBox.append("rect")
				.attr("width",pW)
				.attr("height", pH)
				.attr("x", 10+c*xStep)
				.attr("y", pGap/2+offset)
				.attr("fill",hex)
				.attr('cIndex',c)
				.attr('pIndex',i)
				.attr("tip",hex2tip(hex))
			patch.on('click',onPatchClick)
			addTooltip(patch)
		}
	}
}

function displayExamples(stats) {  
	//create some examples. Use flex boxes for layout	
	var pSize = 32
	var gap = 10
	var arrayBox
	
	
	if (state.colors.length > 28) {
		arrayBox = d3.select('#pExamples').append('div').append('svg')
			.attr("width",480)
			.attr("height",500)
			.attr("x", 10)
			.attr("y", 10)
		drawArray(arrayBox, 24, 24,4, createRectMark)
	}
	else {
		var step = pSize+gap
		var boxH = step*4
		var boxW= step*5
        if ($('#show-marks').prop('checked')==true) {
				$("#pExamples").append("<div class='vContainer' id='leftCol'></div>")
			arrayBox = d3.select("#leftCol").append("div").append("svg")
				.attr("width",boxW)
				.attr("height",boxH)
				.attr("x", 10)
				.attr("y", 10)
				drawArray(arrayBox,pSize,pSize,gap, createRectMark)
			arrayBox = d3.select('#leftCol').append('div').append('svg')
				.attr("width",boxW)
				.attr("height", boxH)
				.attr("x", 10)
				.attr("y", 10)
				drawArray(arrayBox,14, 14, step-14, createRectMark)
			arrayBox = d3.select('#leftCol').append('div').append('svg')
				.attr("width",boxW)
				.attr("height", boxH)
				.attr("x", 10)
				.attr("y", 10)
				drawArray(arrayBox,11, 11, step-11, createCircleMark)
			boxW = 170
			if (state.colors.length>12){boxW = 280}
			arrayBox = d3.select('#leftCol').append('div').append('svg')
				.attr("width",boxW)
				.attr("height", 120)
				.attr("x", 10)
				.attr("y", 10)
				drawArray(arrayBox, 45, 20, 10 ,createTextMark)	
        }
		$("#pExamples").append("<div class='hContainer' id='rightCol'></div>")
		//now some bands of colors
		 {
			var bW = 200
			var bH = 40
			
			arrayBox = d3.select('#rightCol').append('div').append("svg")
				.attr("width",bW+10) //for the selection bump right
				.attr("height", bH*state.colors.length)
				.attr("x", 10)
				.attr("y", 10)
				drawArray(arrayBox,bW,bH,0, createRectMark)
						//now overlay text
			if ($('#show-text').prop('checked')==true) {
				var tString = $('#text-alpha').val()
				var opacity = parseInt(tString)/100.0
				if (opacity != 0) {
					for (i = 0; i<state.colors.length; i++) {
						arrayBox.append('text').text("$12345678.90")
						.attr('x',10)
						.attr('y',i*bH+bH/2)
						.attr('width',bW/2)
						.attr('height',bH)
						.attr('fill','black')
						.attr('opacity',opacity)
						arrayBox.append('text').text("$12345678.90")
						.attr('x',10+bW/2)
						.attr('y',i*bH+bH/2)
						.attr('width',bW/2)
						.attr('height',bH)
						.attr('fill','white')
						.attr('opacity',opacity)
					
					}
				}
			}
			if (stats != null) {
				arrayBox = d3.select('#rightCol').append('div').append("svg")
					.attr("height", bH*state.colors.length)
					.attr('width', 35)
					.attr('fill','gray')
			
				for (i = 0; i<stats.dE.length; i++) {
					arrayBox.append('text').text(stats.dE[i].toString())
					.attr('x',0)
					.attr('y',(i+1)*bH+5)  //delta is between the two blocks
				}
				arrayBox.append('text').text(stats.totalE.toString())
					.attr('x',0)
					.attr('y',bH*state.colors.length)
			}

		}
	}
	
}
function markSpec(hex,cx,cy,w,h,isSelected) {
	this.hex = hex
	this.cx = cx
	this.cy = cy
	this.w = w
	this.h = h
	this.isSelected = isSelected
 }
function createRectMark(svg,mSpec,gap) {
	var offsetY = 0
	var offsetX = 0
	var x = mSpec.cx-mSpec.w/2
	var y = mSpec.cy-mSpec.h/2
	if (mSpec.isSelected==true) {
		if (gap>mSpec.w) {offsetY = mSpec.w/3}	//small squares, big gap
		else if (gap==0) {offsetX = 10}  //the hBars
		else {offsetY = gap/2}  //big squares
	}
	return svg.append("rect")
		.attr("width",mSpec.w)
		.attr("height", mSpec.h)
		.attr("x", x+offsetX)
		.attr("y", y+offsetY)
		.attr("fill",mSpec.hex)
}
function createCircleMark(svg,mSpec) {
	var r = mSpec.w/2
	var offset = 0
	if (mSpec.isSelected==true){offset = mSpec.w/3}
	return svg.append("circle")
		.attr("r",r)
		.attr("height", mSpec.h)
		.attr("cx", mSpec.cx)
		.attr("cy", mSpec.cy+offset)
		.attr("fill",'white')
		.attr("stroke-width",2)
		.style("stroke",mSpec.hex)
}
function createTextMark(svg,mSpec,gap) {
	var offset = 0
	if (mSpec.isSelected==true){offset = gap/2}
	return svg.append("text")
		.attr("x", mSpec.cx-mSpec.w/2)
		.attr("y", mSpec.cy+offset)
		.text(mSpec.hex)
		.attr("fill",mSpec.hex)
}
//createMark is a function(svg,x,y,w,h,isSelected), returns svg point (rect, circle, text)
drawArray = function(svg, pW,pH, gap, createMark) {  
	var stepX = pW+gap
	var stepY = pH+gap
	var rowLen = Math.floor(svg.attr("width")/stepX)
	var colLen = Math.floor(svg.attr("height")/stepY)
	for (i = 0; i<state.colors.length; i++) {
		var d = state.colors[i]
		var hex = d.color.hex()
		var cy = pH/2+stepY*(i%colLen)+gap/2
		var cx = pW/2+stepX*Math.floor(i/colLen)+gap/2
		var mSpec = new markSpec(hex,cx,cy,pW,pH,d.selected)
		svgPt = createMark(svg,mSpec,gap)
			.attr('cIndex',i)
			.attr("tip",hex2tip(hex))

		addActions(svgPt)
		addTooltip(svgPt)
	}
}


addActions = function(svgPt) {
	svgPt.on('click', function() { 
		var pt = d3.select(this)
		myOnClick(pt)	//called out separate for debugging
	})
}
//state.selected is a pointer to a colorItem
myOnClick = function(svgPt) {
	var cIndex = parseInt(svgPt.attr('cIndex'))
	var c = state.colors[cIndex]
	if (c == state.selectedPt) { //just deselect the point
		clearSelection()
		updatePlots()
	} 
	else { 
		clearSelection()
		state.selectedPt = c;	//select a new one
		state.selectedPt.selected = true;
		state.pColor = state.selectedPt.color;
		updateColorPatch() 	//will also redisplay the colors
	}
}
clearSelection = function() {
	if (state.selectedPt != null) {
	state.selectedPt.selected = false
	state.selectedPt = null
	}
}
		
function addTooltip(item) {
	var tooltip = d3.select('#tooltip')
	item.on("mouseover", function(){
		tooltip.text(d3.select(this).attr("tip"))
		return tooltip.style("visibility", "visible")})
	.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px")})
	.on("mouseout", function(){return tooltip.style("visibility", "hidden")})	
}

