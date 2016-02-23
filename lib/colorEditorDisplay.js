//display functions for the Color Palette Editor. Depends on the global variable state
//also depends on knowing the names of the div's defined in the main module.

function displayColors() {
	
	d3.select('#plots').selectAll("svg").remove();
	d3.select("#pSpace").selectAll("div").remove()
	d3.select("#tooltip").selectAll("div").remove()
	//create the tooltip
	var tooltip = d3.select("body")
	.append("div")
	.attr("id", "tooltip")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden")
	.style("background-color",'white')
	.style("margin","2px")
	.text("a simple tooltip")
	//now we need to either plot the color space, or an overview of all the palettes
	if ($('#all-palettes').prop('checked')==true) {
		displayAllPalettes()
	}
	else {
		displayColorspace()
	}
	displayExamples()
}
hex2tip = function(hex) {
	var c = chroma(hex)
	var lch = c.lch()
	var tip = formatTriple(lch,3)+" "+hex
	return tip
}

function displayColorspace() {
	//For point plotting, various constants 
	var abSize = 385;
	var lWidth = 100;
	
	var pSize = 8;
	var pW = pSize*3
	var pH = pSize/3
	
	var xOrg = abSize/2
	var yOrg = abSize/2
	
	
//create the svg frames. Will eventually add axes, etc. here
	var svg_ab = d3.select("#abPlot")
		.append("svg")
		.attr("width", abSize).attr("height",abSize)
		.style("border", "1px solid lightgray")
	var svg_L = d3.select("#LPlot")
		.append("svg")
		.attr("width", lWidth).attr("height",abSize)
		.style("border", "1px solid lightgray")
	
	svg_ab.append("line").attr("x1", 0).attr("y1", yOrg)
		.attr("x2",abSize).attr("y2",yOrg)
		.style({stroke: "lightgray", "stroke-width": "1px"})
	svg_ab.append("line").attr("x1", xOrg).attr("y1",0)
		.attr("x2",xOrg).attr("y2",abSize)
		.style({stroke: "lightgray", "stroke-width": "1px"})
	svg_ab.append("text").text("CIELAB a*,b*").attr("y",20).attr("x",5)
	svg_L.append("text").text("CIELAB L*").attr("y",20).attr("x",8)
//loop over the colors
	for (i = 0; i<state.colors.length; i++) {
		var d = state.colors[i]
		var lab = d.color.lab()
		var hex = d.color.hex()
		var tip = hex2tip(hex)
		var scale = 1.0
		if (d.selected) {scale = 1.5}
//a,b points
		var svgPt = svg_ab.append("circle")
		.attr("r", pSize*scale)
		.attr("cx", xOrg+Math.round((abSize/230)*lab[1]))
		.attr("cy", yOrg-Math.round((abSize/230)*lab[2]))
		.attr("fill",hex)
		.attr("tip",tip)
		.attr('cIndex',i)
		addActions(svgPt)
		addTooltip(svgPt)
		
//L* points
		var lW = 2*pW
		svgPt = svg_L.append("rect")
		.attr("width",lW*scale)
		.attr("height", pH)
		.attr("x", (lWidth-lW*scale)/2)
		.attr("y", abSize-5-Math.round((abSize/105)*lab[0]))
		.attr("fill",hex)
		.attr("tip",tip)
		.attr('cIndex',i)
		addActions(svgPt)
		addTooltip(svgPt)
	}
}
function displayAllPalettes() {
	var pHeight = 32;
	var pGap = 8;
	var pW = 24
	var pH = 32
	var mGap = 5
	var xStep = pW+mGap
	
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
		var pID	= "p"+i.toString()
		var cGroup = d3.select('#pSpace').append('div').attr('class','control-group')
		cGroup.append('div').attr('class','pLable').text(p.pName)
			.style("width","80px")
			.style('margin-top', '12px')
			.attr('pIndex',i)
			.on('click',onLabelClick)
		
		if (p==state.palette) {
			cGroup.style("color",'black')
		} else {
			cGroup.style('color','gray')
		}
		var pBox = cGroup.append('div').append('svg')
			.attr("width",21*xStep)
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

function displayExamples() {  
	//create some examples. Use flex boxes for layout	
	var pSize = 32
	var gap = 10
	var arrayBox
	//cleanup the previous display
	d3.select("#pExamples").selectAll("div").remove()
	
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
		$("#pExamples").append("<div class='vContainer' id='rightCol'></div>")
		//now some bands of colors
		if ($('#show-bars').prop('checked')==true) {
			var bW = 200
			var bH = 40
			arrayBox = d3.select('#rightCol').append('div').append("svg")
				.attr("width",bW+10) //for the selection bump right
				.attr("height", 50*state.colors.length)
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
		}
	}
	
}
function createRectMark(svg,hex,x,y,w,h,isSelected,gap) {
	var bColor = hex
	var offsetY = 0
	var offsetX = 0
	if (isSelected==true) {
		if (gap>w) {offsetY = w/3}	//small squares, big gap
		if (gap==0) {offsetX = 10}  //the hBars
		else {offsetY = gap/2}  //big squares
	}
	return svg.append("rect")
		.attr("width",w)
		.attr("height", h)
		.attr("x", x+offsetX)
		.attr("y", y+offsetY)
		.attr("fill",hex)
}
function createCircleMark(svg,hex,x,y,w,h,isSelected) {
	var r = w/2
	var offset = 0
	if (isSelected==true){offset = w/3}
	return svg.append("circle")
		.attr("r",r)
		.attr("height", h)
		.attr("cx", x+w/2)
		.attr("cy", y+h/2+offset)
		.attr("fill",'white')
		.attr("stroke-width",2)
		.style("stroke",hex)
}
function createTextMark(svg,hex,x,y,w,h,isSelected,gap) {
	var offset = 0
	if (isSelected==true){offset = gap/2}
	return svg.append("text")
		.attr("x", x)
		.attr("y", y+h/2+offset)
		.text(hex)
		.attr("fill",hex)
}
//createMark is a function(svg,x,y,w,h,isSelected), returns svg point (rect, circle, text)
drawArray = function(svg, pW,pH, gap, createMark) {  
	var stepX = pW+gap
	var stepY = pH+gap
	var rowLen = Math.floor(svg.attr("width")/stepX)
	var colLen = Math.floor(svg.attr("height")/stepY)
	for (i = 0; i<state.colors.length; i++) {
		var d = state.colors[i]
		var lab = d.color.lab()
		var hex = d.color.hex()
		var bColor = hex
		var y = stepY*(i%colLen)+gap/2
		var x = stepX*Math.floor(i/colLen)+gap/2
		svgPt = createMark(svg,hex,x,y,pW,pH,d.selected,gap)
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
		displayColors()
	} 
	else { 
		clearSelection()
		state.selectedPt = c;	//select a new one
		state.selectedPt.selected = true;
		state.pColor = state.selectedPt.color;
		updateColorPatch("point") 	//will also redisplay the colors
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

