//javascript color plotting routines, using D3
//class, needs a chroma color to initialize

function colorItem(color, selected, name, group, notes) {
		this.color = color
		this.selected = selected
		this.name = name
		this.group = group
		this.notes = notes
 }

function createColors(hex) {
	var colors = []
	for (i=0; i< hex.length; i++) {
		colors[i] = new colorItem(chroma(hex[i]),false)
	}
	return colors
}


sortColors = function(labVals) {
	//works for both lch and lab, sort by L
	labVals.sort(function (a,b) {
		if (a[0] > b[0]) {
		return 1;
	}
	if (a[0] < b[0]) {
		return -1;
	  }
	  // a must be equal to b
	  return 0;
	});
	return labVals
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