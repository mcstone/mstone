// Methods for drawing each stimulus type

// Drawing constants
var COLORTYPE = {
	HSV: 	{value: 0, mins: [0, 0, 0, 0], 	maxs:[360, 100, 100, 1], name: "HSV", step: 1},
	Lab: 	{value: 1, mins: [0, -128, -128, 0], 	maxs: [100, 128, 128, 1], name: "Lab", step: 1},
	LCh: 	{value: 2, mins: [0, 0, 0, 0], 	maxs: [100, 100, 360, 1], name: "LCh", step: 1},
	Alpha: 	{value: 3, mins: [0, 0, 0, 0], 	maxs: [1, 0, 0, 0], name: "Alpha", step: 0.01}
};

var SIZE_IDX = 0
var CLR_IDX = 1;
var DX = 2;
var DY = 3;
var MAX_ITERS = 10;
var PAD = 1.5;
var IND_W = 5;
var POS = 4;

var GRID_PAD = 50;

// Data parameters
var adjustedStart = 1;
var tooltip = null;
var center = 0;

var gridPositions = []; // Bounding boxes for the grids as x, y, w, h, i arrays

// Convert from a visual angle to pixel values to compute sizes
var visualAngleToPixels = function(angleDegrees, inchesToDisplay, approxDpi) {
	var angleRadians = angleDegrees * Math.PI / 180.0;
	return 2 * inchesToDisplay * Math.tan(angleRadians / 2.0) * approxDpi;
};

// Convert from a pixel size to a visual angle in degrees
var pixelsToVisualAngle = function(pixels, inchesToDisplay, approxDpi) {
	var sizeInches = 2 * pixels / approxDpi; 		// 2 is to account for pixels being a radius
	return 2 * Math.atan2(sizeInches, (2 * inchesToDisplay)) * (180 / Math.PI);
};

var render = function (proximity) {
    // Remove any existing SVG on the page
    d3.select("svg").remove();
    //console.log("max Size:",  maxSize);
    
    var svg = d3.select("body").select("div #stimuli")
				.append("svg")
				.attr("width", function () { 
				    //console.log((2 * proximity + 2 * GRID_PAD + 4 * maxSize));
				    return (layoutType == "grid") ? (2 * proximity + 2 * GRID_PAD + 8 * maxSize) : 2 * (proximity + 2 * maxSize);

				})
				.attr("height", function () {
				    return (layoutType == "grid") ? (2 * GRID_PAD + 4 * maxSize) : 2 * (proximity + 2 * maxSize);
				    //return (layoutType == "grid") ? (2*proximity + 2 * GRID_PAD + 4 * maxSize) : 2 * (proximity + 2 * maxSize);
				});


    center = 1.5 * proximity;
    generateData(proximity);

    renderSingleMark(svg);
};

var renderSingleMark = function(svg) {
	// Render the background shapes if appropriate. VS: Commented this out as it wasn't being used.
	/*if (layoutType == "grid") {
		svg.selectAll(".gridCell")
			.data(gridPositions)
			.enter()
			.append("rect")
			.attr("class", "gridCell")
			.attr("x", function(d) {
				
				return d[0];
			})
			.attr("y", function(d) {
				return d[1];
			})
			.attr("width", function(d) {
				return d[2];
			})
			.attr("height", function(d) {
				return d[3];
			})
			.attr("fill", background);
	}*/
	
	// Render the SVG -- not been implemented for this
	if (shapeType == "circle"){
		// Render the actual stimuli
		var shapes = svg.selectAll("circle")
						.data(positions)
						.enter()
						.append("circle");
		shapes.attr("cx", function(d) {
						return d[DX];
					})
				.attr("cy", function(d) {
						return d[DY];
					})
				.attr("r", function(d) {
					return d[0];
				})
				.attr("fill", function(d) {
					var c = convertFrom(d[1], colorType);
					return toHtml(c);
				});
	} else {
		// Render the actual stimuli
		var size = positions[0][0];
		
		var shapes = svg.selectAll("svg")
						.data(positions)
						.enter()
						.append("rect");
		shapes.attr("x", function(d) {
						console.log("size:" + String(positions[0][0]));
						
						if (size < 10) {
							
							return d[DX] + 32;
						}
						
						else if (size > 100) {
							
							return d[DX] - 78;
						}
						else if (size > 70 && size <= 100) {
							
							return d[DX] - 45;
						}
						else
							return d[DX];
					})
				.attr("y", function(d) {
						return d[DY];
					})
				.attr("height", function(d) {
					return 2*d[0]; // Double this since sizes are operating as circle radii
				})
				.attr("width", function(d) {
					return 2*d[0]; // Double this since sizes are operating as circle radii
				})
				.attr("fill", function(d) {
					// Converting from Lab to RGB
					var c = convertFrom(d[1], colorType);
					
					// Format as "rgba()" -- writeData.js
					return toHtml(c);
				});
	}
};
/*
var responseSubmitted = function(d, i){
	if (layoutType == "grid") {
		responseGrid(d);
	} else {
		d3.selectAll("line").remove();
		
		// Don't select the stimulus color
		if (i == 0) {
			activeColor = {'position': -1, 'color': []};
			return;
		}
		
		// Compute the normalized trajectory
		var xoffset = (d[DX] - center);
		var yoffset = (d[DY] - center);
		var mag = Math.sqrt(xoffset * xoffset + yoffset * yoffset);
		xoffset = (50 + d[SIZE_IDX]) * xoffset / mag;
		yoffset = (50 + d[SIZE_IDX]) * yoffset / mag;
		
		//console.log(xoffset);
		var svg = d3.selectAll("svg");
		svg.append("line")
			.attr("stroke", "grey")
			.attr("stroke-width", 2)
			.attr("x1", d[DX] + (xoffset - 0.5*IND_W))
			.attr("x2", d[DX] + (xoffset))
			.attr("y1", d[DY] + (yoffset - 0.5*IND_W))
			.attr("y2", d[DY] + (yoffset));
		
		svg.append("line")
			.attr("stroke", "grey")
			.attr("stroke-width", 2)
			.attr("x1", d[DX] + (xoffset))
			.attr("x2", d[DX] + (xoffset + IND_W))
			.attr("y1", d[DY] + (yoffset))
			.attr("y2", d[DY] + (yoffset - 2.0*IND_W));
			
		activeColor.color = d[CLR_IDX];
		activeColor.position = d[POS];
		
		// Spin here for 0.5 seconds
		endTime = new Date();
		//respInt = setInterval(logResponse, 500);
	}
};

var responseGrid = function(d) {
	// Visually indicate the response
	d3.selectAll(".gridCell")
		.attr("stroke", function(dGrid) {
			if (d[POS] == dGrid[POS])
				return "black";
			else 
				return "lightgrey";
		});

	// Record the response
	activeColor.color = adjustedColor.color;
	activeColor.position = d[POS];
	activeColor.fixedSide = (positions[2 * d[POS]][POS + 1] == -1) ? "left" : "right";
	
	// Spin here for 0.5 seconds
	endTime = new Date();
	respInt = setInterval(adapt, 500);
};*/

var adapt = function() {
	// Set the screen to grey to avoid afterimage effects
	d3.selectAll("circle").remove();
	d3.selectAll("rect").remove();
		
	// Record the response -- this is a global variable
	activeColor.color = adjustedColor.color;
	activeColor.position = 0;
	activeColor.fixedSide = (positions[0][POS + 1] == -1) ? "left" : "right";
		
	//clearInterval(respInt);
	endTime = new Date();
	//console.log("adapt fired at " + endTime);
	respInt = setInterval(logResponse, 500);
	//logResponse();
}

var generateData = function(proximity) {
	adjustedStart = generateFixedData(proximity);
	generateAdjustedData(proximity);
};


// Set the size, color, position of the stimuli
var generateFixedData = function(proximity) {
	if (layoutType == "grid") {
		positions = [];
		return 0;
	}

	if (fixedChartType == "Marks" && numCircles == 1) 
		positions = [[fixedSize, fixedColor.color, center, center]];
	else  
		// TODO: Flesh this out to generate synthetic datasets for different chart types
		positions = [[fixedSize, fixedColor.color, 0, 0]];
		
	// Return the end of the stimulus data
	return positions.length;
};

// Set the size, color, and positions of the test objects -- populate the data in the "positions" array
var generateAdjustedData = function(proximity) {	
		// Compute the grid positions
		generateGrid();
		
		// Compute the positioning of each pair of circles
		var gridCell = gridPositions[0];
		// Draw the stimulus proximity/2 units from the center
		var gridCenters = [gridCell[0] + gridCell[2] / 2, gridCell[1] + gridCell[3] / 2];
		var fixedLeft = (Math.random() < 0.5) ? -1 : 1;
		var shapeNormalizer = (shapeType == "square") ? 1 : 0;
		

		/*positions.push([
							fixedSize,
							fixedColor.color.slice(0),
							gridCenters[0] - shapeNormalizer * fixedSize,// + fixedLeft * (fixedSize + proximity / 2), 
							gridCenters[1] - shapeNormalizer * fixedSize,
							gridCell[POS],
							fixedLeft
						]);*/
						
		// Constant Shape
		positions.push([
							adjustedSize,	// Size
							fixedColor.color.slice(0), // Color
							gridCenters[0] - shapeNormalizer * adjustedSize + fixedLeft * (adjustedSize + 0.5 * proximity), // X 
							gridCenters[1] - shapeNormalizer * adjustedSize, // Y
							gridCell[POS], // Not used
							fixedLeft  // Position of the fixed (non-jittered color)
						]);
		
		// Adjusted Shape
		positions.push([
							adjustedSize,
							adjustedColor.color.slice(0),
							gridCenters[0] - shapeNormalizer * adjustedSize - fixedLeft * (adjustedSize + 0.5 * proximity) , 
							gridCenters[1] - shapeNormalizer * adjustedSize,
							gridCell[POS],
							fixedLeft 
						]);
};

var generateGrid = function() {
	// Compute ncols and nrows for the grid
	//var nc = Math.ceil(Math.sqrt(adjustedColors.length) / 2);
	var nc = 1;//Math.ceil(Math.sqrt(adjustedColors.length));
	var nr = 1;//Math.ceil(adjustedColors.length / nc);
	var hstep = 2 * proximity + 4 * maxSize + GRID_PAD;
	var vstep = 2 * maxSize + GRID_PAD;
	
	// VS: Changes to pref=vent off-center rendering
	

	// Compute the actual positions
	gridPositions = [];
	for (var r = 0; r < nr; r++)
		for (var c = 0; c < nc; c++)
		
			gridPositions.push([c * (hstep + GRID_PAD), r * (vstep + GRID_PAD), hstep, vstep, r * nc + c]);
		
	
};

var roundForDisplay = function(arr) {
	var out = []
	for (v in arr) {
		out.push(Math.round(arr[v] * 100) / 100);
	}
	
	return out;
};