//javascript routines to do drawing and other computations for the Alpha demo
//for now, to keep the code easier to edit, debug
updateColors

//draw the alpha samples. Call with a d3.object with an appropriately sized and positioned SVG
drawSamples = function(sampleSVG, colors) {
	
	var circle = sampleSVG.selectAll("circle")
		.data(colors)
		.enter().append("circle")
		.style("fill", function(d) {return d})
		.attr("r", 20)
        .attr("cx", function(d,i) {return 20+42*i})
        .attr("cy", 50)
	
}

