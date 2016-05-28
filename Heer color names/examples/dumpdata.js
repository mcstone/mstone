c3.load("../data/xkcd/c3_data.json");

var C_length = c3.color.length,
    W_length = c3.terms.length;


//entry function
function dumpData(type) {
	tcount = 500;
	switch(type) {
		case "T_matrix": dumpT(tcount); break;
		case "terms": dumpTerms(); break;
		case "colors": dumpColors(); break;
		case "none": break;
	}
}

function saveIt(data, filename){
	var csvContent = "data:text/csv;charset=utf-8,";
	//convert data to a string. Assumes an array of arrays
	
	data.forEach(function(infoArray, index){
	   dataString = infoArray.join(",");
	   csvContent += index < data.length ? dataString+ "\n" : dataString;
	}); 
console.log(csvContent.length)
	var encodedUri = encodeURI(csvContent);
	var link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", filename);

	link.click();
}

//These procs load up a cvsContent string, create an encoded URI, then click the link
//result is a "save" dialog that lets us download data from the browser to the desktop

//dump out the T matrix, as rows of color values, cols of term names
//can't dump the entire matrix as that string gets to
function dumpT(nrows) {
	var T_data = [];
	var headers = ["Hex", "lab_L", "lab_a", "lab_b"];
	for (var w=0; w< W_length; w++) {
		headers.push(c3.terms[w])
	}
	T_data.push(headers)

	for (var c = 0; c < nrows; c++) {
		row = []
		//Get color
		lab = c3.color[c];
		row = colorToRow(lab)  
		for (var w = 0; w < W_length; w++) {
			row.push(c3.count(c,w))
		}
		T_data.push(row)
	}
	saveIt(T_data, "T_matrix.csv")

}
//often want a hex plus the associated LAB. 
function colorToRow(lab) {
	return [lab.toString(), lab.L, lab.a, lab.b] //toString produces the hex
}

//Iterate through the the color, for each output the values shown. 
function dumpColors() {
	var headers = ["Hex", "lab_L", "lab_a", "lab_b", "frequency", "entropy", "term", "score" ];
	var color_data = []
	color_data.push(headers)
	for (var c = 0; c < C_length; c++) {
		color = c3.color[c];
		color_freq = c3.color.count[c];
		colors = colorToRow(color);
		colors.push(color_freq);
		colors.push(c3.color.entropy(c))
		rel_term = c3.color.relatedTerms(c,1)	//this is an object
		w = rel_term[0].index
		colors.push(c3.terms[w])  //this is the term
		colors.push(rel_term[0].score)  //this is the probability
		color_data.push(colors);
	}
	saveIt(color_data,"color_freq.csv")
}


//Iterate through the terms, for each output the values shown
//comparing related term to term, center color to relatedColor

function dumpTerms() {
	var headers = ["term", "frequency", "entropy", "rel_term","rt_score", "CHex", "Clab_L", "Clab_a", "Clab_b", "C Prob", "RHex", "Rlab_L", "Rlab_a", "Rlab_b", "RC Prob"];
	var term_data = []
	term_data.push(headers)
	for (var w = 0; w < W_length; w++) {
		term = c3.terms[w];
		term_freq = c3.terms.count[w];
		terms = [];
		terms.push(term);
		terms.push(term_freq);
		terms.push(c3.terms.entropy(w))
		//ask the question what is the most related term? Expect it to match the term
		//this uses the term association matrix, not sure what the score means
		rel_term = c3.terms.relatedTerms(w,1)
		rt = c3.terms[rel_term[0].index]
		terms.push(rt)
		terms.push(rel_term[0].score)
		//get the "center" color for the term
		center = c3.terms.center[w]
		terms = terms.concat(colorToRow(center))
		c = c3.color.index(center)	//closest quantized color to the center color.
		//this is the same probabilty as used in the relatedColor evaluation.
		prob = c3.color.prob(c,w);  //p(c|w)
		terms.push(prob)
		//now ask for the most "related color". Returns color with the largest probability of being the term
		rel_color = c3.terms.relatedColors(w,1)
		lab = c3.color[rel_color[0].index]
		terms = terms.concat(colorToRow(lab))
		terms.push(rel_color[0].score)	//score is the probability (c|w)
		term_data.push(terms);
	}
	saveIt(term_data, "term_freq.csv")
}

