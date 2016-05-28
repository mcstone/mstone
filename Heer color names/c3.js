(function(){c3 = {version: "1.0.0"}; // semver
//load the data, call c3_init(), which creates arrays and c3_api(), which adds procedures
c3.load = function(uri, async) {
  async = async || false;
  var req = new XMLHttpRequest();
  var onload = function() {
    if (!async || req.readyState == 4) {
      if (req.status == 200 || req.status == 0) {
        c3_init(JSON.parse(req.responseText));
        c3_api();
      } else {
        alert("Error Loading C3 Data");
      }
    }
  };
  req.open('GET', uri, false);
  if (async) req.onreadystatechange = onload;
  req.send(null);
  if (!async) onload();
}
//c3.color= Array[8325] d3.lab colors. These are binned to multiples of 5
//c3.terms = Array[153] strings, the color names
//c3.T = Array[273725] integers, represents counts = #times the color/name pair was called
//c3.A = Array[23409] positive (?) fractions, including 0, parse word association matrix, doesn't seem to be used
//c3.color.count = Array[8325] of counts, one/color. Extracted from T
//c3.terms.count = Array[153] of counts, one/term. Also extracted from T
function c3_init(json) {
  var i, C, W, T, A, ccount, tcount;

  // parse colors
  c3.color = [];
  for (i=0; i<json.color.length; i+=3) {
    c3.color[i/3] = d3.lab(json.color[i], json.color[i+1], json.color[i+2]);
  }
  C = c3.color.length;

  // parse terms
  c3.terms = json.terms;
  W = c3.terms.length;

  // parse count table
  c3.T = T = [];
  for (var i=0; i<json.T.length; i+=2) {
    T[json.T[i]] = json.T[i+1];
  }

  // construct counts over a row or column
  c3.color.count = ccount = []; for (i=0; i<C; ++i) ccount[i] = 0;
  c3.terms.count = tcount = []; for (i=0; i<W; ++i) tcount[i] = 0;
//this shows how to convert an index of T into c and w
  d3.keys(T).forEach(function(idx) {
    var c = Math.floor(idx / W),
        w = Math.floor(idx % W),
        v = T[idx] || 0;
    ccount[c] += v;  // for each color, what is the count
    tcount[w] += v;  //for each word, what is the count
  });
c3.terms.imap = {}
for (var w = 0; w<c3.terms.length; ++w) {
	c3.terms.imap[c3.terms[w]] = w;
}
c3.color.imap = {}	//takes a LAB string to c, the color index
for (var c=0; c<c3.color.length; ++c) {
	var x = c3.color[c];
    c3.color.imap[[x.L,x.a,x.b].join(",")] = c;
  }
  // parse word association matrix
  c3.A = A = json.A;	//used in term.relatedTerms
}
			
			
//this adds procedures. Some to the c3.api, some to the c3.color and c3.terms arrays
//also adds the Array c3.terms.centers, which is the d3.lab color most representative of the term
function c3_api() {
  var C = c3.color.length,	
      W = c3.terms.length,
      T = c3.T,
      A = c3.A,
      ccount = c3.color.count,
      tcount = c3.terms.count;

//given a T index, return the associated c and w indices
c3.tocw = function(idx) {
	var c = Math.floor(idx / W)
    var w = Math.floor(idx % W)
	return (c,w)
}
  //the value of a T cell, defined by c, w
  c3.count = function(c, w) {
    return T[c*W+w] || 0;
  }
  
//first all the terms procs

//for a given term, the probability it is the color c = p(w|c) eqn 2
  c3.terms.prob = function(w, c) {
    return (T[c*W+w]||0) / tcount[w];
  }

  c3.terms.entropy = function(w) {
    var H = 0, p;
    for (var c=0; c<C; ++c) {
      p = (T[c*W+w]||0) / tcount[w];
      if (p > 0) H += p * Math.log(p) / Math.LN2;
    }
    return H;
  }

  c3.terms.perplexity = function(w) {
    var H = c3.terms.entropy(w);
    return Math.pow(2, -H);
  }
//term distance
  c3.terms.cosine = function(a, b) {
    var sa=0, sb=0, sc=0, ta, tb;
    for (var c=0; c<C; ++c) {
      ta = (T[c*W+a]||0);
      tb = (T[c*W+b]||0);
      sa += ta*ta;
      sb += tb*tb;
      sc += ta*tb;
    }
    return sc / (Math.sqrt(sa*sb));
  }


  c3.terms.hellinger = function(a, b) {
    var bc=0, pa, pb, z = Math.sqrt(tcount[a]*tcount[b]);
    for (var c=0; c<C; ++c) {
      pa = (T[c*W+a]||0);
      pb = (T[c*W+b]||0);
      bc += Math.sqrt(pa*pb);
    }
    return Math.sqrt(1 - bc / z);
  }
  //returns w given a string
  c3.terms.index = function(t_name) {
	  var w =  c3.terms.imap[t_name] || -1
	  return w
  }
  c3.terms.relatedColors = function(w, limit) {
    var list = [];
    for (var c=0; c<C; ++c) {
      var s = (T[c*W+w] || 0) / ccount[c];	//p(c|w), or color.prob(c|w)
      if (s > 0) list.push({index: c, score: s});
    }
    list.sort(function(a,b) { return b.score - a.score; });
    return limit ? list.slice(0,limit) : list;
  }

  c3.terms.relatedTerms = function(w, limit) {
    var sum = 0, c = c3.terms.center[w], list = [];
    for (var i=0; i<W; ++i) {
      if (i != w) list.push({index: i, score: A[i*W+w]});
    }
    list.sort(function(a, b) {
	  var ca, cb, dL1, dL2, da1, da2, db1, db2,
          cmp = b.score - a.score;
      if (Math.abs(cmp) < 0.00005) {
        // break near ties by distance between centers
        ca = c3.terms.center[a.index];
        cb = c3.terms.center[b.index];
        cmp = ca.de00(c) - cb.de00(c);
      }
      return cmp;
    });
    list.unshift({index: w, score: A[w*W+w]});
    return limit ? list.slice(0,limit) : list;
  }

  // compute representative colors
  c3.terms.center = d3.range(W).map(function(w) {
    var list = c3.terms.relatedColors(w, 5)
                 .map(function(d) { return c3.color[d.index]; });
	var L = 0, a = 0, b = 0, N = list.length;
	list.forEach(function(c) { L += c.L; a += c.a; b += c.b; });
	return d3.lab(Math.round(L/N), Math.round(a/N), Math.round(b/N));
  })




//now the color functions  
			
//given a color, the probability it is the term w
  c3.color.prob = function(c, w) {
    return (T[c*W+w]||0) / ccount[c];
  }

  c3.color.entropy = function(c) {
    var H = 0, p;
    for (var w=0; w<W; ++w) {
      p = (T[c*W+w]||0) / ccount[c];  //this is the color.prob function
      if (p > 0) H += p * Math.log(p) / Math.LN2;
    }
    return H;
  }
  c3.color.perplexity = function(c) {
    var H = c3.color.entropy(c);
    return Math.pow(2, -H);
  }
//This is a distance metric, angle between two color vectors. 
  c3.color.cosine = function(a, b) {
    var sa=0, sb=0, sc=0, ta, tb;
    for (var w=0; w<W; ++w) {
      ta = (T[a*W+w]||0);
      tb = (T[b*W+w]||0);
      sa += ta*ta;
      sb += tb*tb;
      sc += ta*tb;
    }
    return sc / (Math.sqrt(sa*sb));
  }

  c3.color.hellinger = function(a, b) {
    var bc=0, pa, pb, z = Math.sqrt(ccount[a]*ccount[b]);
    for (var w=0; w<W; ++w) {
      pa = (T[a*W+w]||0);
      pb = (T[b*W+w]||0);
      bc += Math.sqrt(pa*pb);
    }
    return Math.sqrt(1 - bc / z);
  }
  //given any LAB color, generates the c index.
  c3.color.index = function(c_value) {
	  var x = d3.lab(c_value),
      L = 5 * Math.round(x.L/5),
      a = 5 * Math.round(x.a/5),
      b = 5 * Math.round(x.b/5),
      s = [L,a,b].join(",");
  return c3.color.imap[s] || -1;
  }
  c3.color.relatedTerms = function(c, limit, minCount) {
    var cc = c*W, list = [], sum = 0, s, cnt = c3.terms.count;
    for (var w=0; w<W; ++w) {
      if ((s = T[cc+w]) !== undefined) {
        list.push({index: w, score: s});
        sum += s;
      }
    }
    if (minCount) {
      list = list.filter(function(d) { return cnt[d.index] > minCount; });
    }
    list.sort(function(a,b) { return b.score - a.score; });
    list.forEach(function(d) { d.score /= sum; });
    return limit ? list.slice(0, limit) : list;
  }


}
})();
