// Color binding parameters
var minL = 40;
var maxL = 90;
var EPSILON = 0.001;
var GREYPOINT = 2;
var normalizer = 1;

var randomColor = function(idx, colorType) {
  return Math.random() * (colorType.maxs[idx] - colorType.mins[idx]) + colorType.mins[idx];
};

var bump = function(idx) {
  return 0;
};

var validateLuminance = function(c) {
  // Verify the bounds of the selected color
  var rgb = validateGamut(c);
  var lab = convertTo(convertFrom(rgb, colorType), COLORTYPE.Lab);
  if (lab[0] < minL) 
    lab[0] = minL;
  else if (lab[0] > maxL) 
    lab[0] = maxL;
  
  return convertTo(convertFrom(lab, COLORTYPE.Lab), colorType);
};

var validateGamut = function(c) {
  // Validate that it is valid for that color space
  for (var i in c) {
    if (c[i] > colorType.maxs[i])
      c[i] = colorType.maxs[i];
    else if (c[i] < colorType.mins[i])
      c[i] = colorType.mins[i];
  }
  
  var rgb = convertFrom(c, colorType);
  
  for (var i in rgb) {
    if (rgb[i] > 1) {
      rgb[i] = 1;
    }
    else if (rgb[i] < 0)
      rgb[i] = 0;
  }
  
  return convertTo(rgb, colorType);
};

var sampleGamut = function(tempClr) {
  // Generate the sample array
  var samples = sampleColors(tempClr, numSamples);
  for (var i = 0; i < samples.length; i++) {
    var adjClr = samples[i];
    if (adjClr[0] < colorType.mins[0] || adjClr[0] > colorType.maxs[0] || adjClr[1] < colorType.mins[1] || adjClr[1] > colorType.maxs[1])
        return false;
    else if (!equalColors(validateGamut(adjClr), adjClr))
      return false;
  }
  
  return true;
  // Test that all in the sample array fits in the gamut
  
  /*for (var dl = -numSamples[1] * baseStep; dl <= numSamples[0] * baseStep; dl += baseStep) {
    for (var da = -half * chromaF * tempClr[1]; dc <= half * chromaF * tempClr[1]; dc += Math.max(chromaF * tempClr[1], 0.5)) {
      if (tempClr[1] < EPSILON) 
        dc = 1;
      
      var adjClr = [tempClr[0] + dl, tempClr[1] + dc, tempClr[2]];
      if (adjClr[0] < 0 || adjClr[0] > colorType.maxs[0] || adjClr[1] < 0 || adjClr[1] > colorType.maxs[1])
        return false;
      if (!equalColors(validateGamut(adjClr), adjClr)) {
        return false;
      }
  
      if (tempClr[1] < EPSILON) 
        break;
    }
  }
  
  return true;*/
};


var equalColors = function(c1, c2) {
  for (var i = 0; i < Math.min(c1.length, c2.length); i++) {
    if (Math.abs(c1[i] - c2[i]) > EPSILON) {
      return false;
    }
  }
  
  return true;
};

// Wrapper function. Passed the center color and number of samples along each direction of each axis
var sampleColors = function(center, sampleSize) {
  return sampleColors_FromJND(center, sampleSize);
};

// Returns an array of numSamples + 1 colors
// Use this for the JND study
var sampleColors_FromJND = function(center, sampleSize) {
  // Vary the chroma and luminance fields orthogonally
  var lRange =  [-numSamples, numSamples];
  var abRange = [-numSamples, numSamples];
  
  // Normalize the base steps such that the step at the largest size is 1. Probably not used
  normalizer = 1;
  var rawSteps = [attenuate([jnd[0], 0, 0], pixelsToVisualAngle(maxSize, inchesToDisplay, dpi))[0],
          attenuate([0, jnd[1], 0], pixelsToVisualAngle(maxSize, inchesToDisplay, dpi))[1],
          attenuate([0, 0, jnd[2]], pixelsToVisualAngle(maxSize, inchesToDisplay, dpi))[2]
        ];
  
  return stepColors(center, pickSizeC_FromJND([jnd[0], 0, 0])[0], 0, lRange, true)
        .concat(stepColors(center, pickSizeC_FromJND([0, jnd[1], 0])[1], 1, abRange, true))
        .concat(stepColors(center, pickSizeC_FromJND([0, 0, jnd[2]])[2], 2, abRange, true));
  
};

// Use this for the C-S Visualizer
var sampleColors_FromColor = function(center, sampleSize) {
  // Vary the chroma and luminance fields orthogonally
  var lRange =  [-numSamples, numSamples];
  var abRange = [-numSamples, numSamples];
  
  return stepColors_FromColor(center, baseStep * pickSizeC_FromColor([jnd[0], 0, 0], center), 0, lRange, true)
        .concat(stepColors_FromColor(center, baseStep * pickSizeC_FromColor([0, jnd[1], 0], center), 1, abRange, true))
        .concat(stepColors_FromColor(center, baseStep * pickSizeC_FromColor([0, 0, jnd[2]], center), 2, abRange, true));
  
};

// TODO: Finish Implementing This
var pickSizeC_FromColor = function(dc, c) {
  // Carter & Silverstein kLMS table 
  var cDict = [  [2, 1, 1, 1], 
          [1, 0.627, 0.620, 0.555], 
          [0.5, 0.531, 0.530, 0.401],
          [0.25, 0.431, 0.443, 0.305],
          [0.125, 0.317, 0.298, 0.191]];
  
  // Convert the color to LMS
  var cLms = xyzToLMS(labToXYZ(c));
  var dcLms = xyzToLMS(labToXYZ([c[0] + dc[0], c[1] + dc[1], c[2] + dc[2]]));
  
  // Pick the appropriate multipliers
  var ks = [];
  for (var i = 0; i < cDict.length; i++) {
    if (cDict[i][0] == sizeSet[sizePtr]) {
      ks = cDict[i].slice(1);
      break;
    }
    else if (cDict[i][0] > sizeSet[sizePtr] && i < cDict.length - 1 && cDict[i + 1][0] < sizeSet[sizePtr]) {
      // Lerp the sizes
      var mult = (cDict[i][0] - sizeSet[sizePtr]) / (cDict[i][0] - cDict[i + 1][0]);
      for (var j = 1; j < 4; j++)
        ks.push((1 - mult) * cDict[i][j] + mult * cDict[i + 1][j]);
      break;
    } else if (cDict[i][0] > sizeSet[sizePtr] && i == cDict.length - 1) {
      // Lerp with 0
      var mult = (cDict[i][0] - sizeSet[sizePtr][i]) / (cDict[i][0]);
      for (var j = 1; j < 4; j++)
        ks.push((1 - mult) * cDict[i][j]);
      break;
    }
  }
  
  // Apply the multipliers to LMS
  for (var i = 0; i < lms.length; i++)
    lms[i] *= 1 / ks[i];
    
  // Convert back to Lab differences
  return xyzToLab(lmsToXYZ(lms));
};

// Pass in JND along the axis 
var pickSizeC_FromJND = function(dc) {
  // Carter & Silverstein kLMS table [size, L coefficient, M coefficient, S coefficient] 
  var cDict = [  [2, 1, 1, 1], 
          [1, 0.627, 0.620, 0.555], 
          [0.5, 0.531, 0.530, 0.401],
          [0.25, 0.431, 0.443, 0.305],
          [0.125, 0.317, 0.298, 0.191]];
  
  // Convert the color to LMS
  var lms = xyzToLMS(labToXYZ(dc));
  
  // Pick the appropriate multipliers
  // Size pulled from sizeSet[sizePtr]
  var ks = [];
  for (var i = 0; i < cDict.length; i++) {
    if (cDict[i][0] == sizeSet[sizePtr]) {
      ks = cDict[i].slice(1);
      break;
    }
    else if (cDict[i][0] > sizeSet[sizePtr] && i < cDict.length - 1 && cDict[i + 1][0] < sizeSet[sizePtr]) {
      // Lerp the sizes
      var mult = (cDict[i][0] - sizeSet[sizePtr]) / (cDict[i][0] - cDict[i + 1][0]);
      for (var j = 1; j < 4; j++)
        ks.push((1 - mult) * cDict[i][j] + mult * cDict[i + 1][j]);
      break;
    } else if (cDict[i][0] > sizeSet[sizePtr] && i == cDict.length - 1) {
      // Lerp with 0
      var mult = (cDict[i][0] - sizeSet[sizePtr][i]) / (cDict[i][0]);
      for (var j = 1; j < 4; j++)
        ks.push((1 - mult) * cDict[i][j]);
      break;
    }
  }
  
  // Apply the multipliers to LMS
  for (var i = 0; i < lms.length; i++)
    lms[i] *= 1 / ks[i];
    
  // Convert back to Lab differences
  return xyzToLab(lmsToXYZ(lms));
};

// Vidya: here is what we need ot have modify
var attenuate = function(dc, size) {
  // Carter & Silverstein kLMS table 
  var cDict = [  [2, 1, 1, 1], 
          [1, 0.627, 0.620, 0.555], 
          [0.5, 0.531, 0.530, 0.401],
          [0.25, 0.431, 0.443, 0.305],
          [0.125, 0.317, 0.298, 0.191]];
  
  // Convert the color to LMS
  var lms = xyzToLMS(labToXYZ(dc));
  
  // Pick the appropriate multipliers
  var ks = [];
  for (var i = 0; i < cDict.length; i++) {
    if (cDict[i][0] == size) {
      ks = cDict[i].slice(1);
      break;
    }
    else if (cDict[i][0] > size && i < cDict.length - 1 && cDict[i + 1][0] < size) {
      // Lerp the sizes
      var mult = (cDict[i][0] - size) / (cDict[i][0] - cDict[i + 1][0]);
      for (var j = 1; j < 4; j++)
        ks.push((1 - mult) * cDict[i][j] + mult * cDict[i + 1][j]);
      break;
    } else if (cDict[i][0] > size && i == cDict.length - 1) {
      // Lerp with 0
      var mult = (cDict[i][0] - size) / (cDict[i][0]);
      for (var j = 1; j < 4; j++)
        ks.push((1 - mult) * cDict[i][j]);
      break;
    }
  }
  
  // Apply the multipliers to LMS
  for (var i = 0; i < lms.length; i++)
    lms[i] *= 1 / ks[i];
    
  // Convert back to Lab differences and normalize
  var lab = xyzToLab(lmsToXYZ(lms));
  return lab;
};

// stepSize is created from the C-S Numbers. index maps to axis. 
// Applies the jitters to the color per axis
var stepColors = function(color, stepSize, index, range, throughZero) {
  var clrs = [];
  for (var i = range[0]; i <= range[1]; i++) {
    var clr = color.slice(0);
    clr[index] += i * stepSize;
    if (i == 0 && !throughZero)
      continue;
    clrs.push((clr));//validateGamut
  }
  return clrs;
};

var stepMultiAxis = function(color, stepSize, index, range, throughZero) {
  var clrs = [];
  var lums = stepColors(color, stepSize[0], index[0], range[0], throughZero);
  var chromas = stepColors(color, stepSize[1], index[1], range[1], throughZero);
  for (var l = 0;  l < lums.length; l++) {
    for (var c = 0; c < chromas.length; c++) {
      var clr = [lums[l][0], chromas[c][1], color[2]];
      clrs.push(validateGamut(clr));
    }
  }
  
  return clrs;
};

var convertToGrey = function(c) {
  var newC = convertFrom(c, colorType);
  return convertTo([newC[0], newC[0], newC[0], newC[3]], colorType);
};

// From colorType to RGB conversion functions
var convertFrom = function(color, colorType) {
  switch(colorType) {
    case COLORTYPE.HSV:
      return hsvToRgb(color);
    case COLORTYPE.Lab:
      var c = d3.lab(color[0], color[1], color[2]).rgb();
      return [c.r / 255, c.g / 255, c.b / 255, 1];
    case COLORTYPE.LCh:
      return lchToRgb(color);
    case COLORTYPE.Alpha:
      return alphaToRgb(color);
  }
};

// To colorType from RGB conversion functions
var convertTo = function(color, colorType) {
  switch(colorType) {
    case COLORTYPE.HSV:
      return rgbToHsv(color);
    case COLORTYPE.Lab:
      var c = d3.lab("rgb(" + (color[0] * 255) + ", " + (color[1] * 255) + ", " + (color[2] * 255) + ")");
      return [c.l, c.a, c.b, 1];
    case COLORTYPE.LCh:
      return rgbToLch(color);
    case COLORTYPE.Alpha:
      return rgbToAlpha(color);
  }
};

// Convert HSV to RGB. Based on http://www.cs.rit.edu/~ncs/color/t_convert.html
var hsvToRgb = function(color) {
  // Handle 0 saturation
  if (color[1] == 0)
    return [color[2] / 100, color[2] / 100, color[2] / 100, 1];
    
  // Normalize component values
  var h = color[0] / 60.0;
  var s = color[1] / 100.0;
  var v = color[2] / 100.0;
  
  // Break down component values
  var i = Math.floor(h);
  var fact = h - i;
  var a = v * (1 - s);
  var b = v * (1 - s * fact);
  var c = v * (1 - s * (1 - fact));
  
  // Find value ordering based on sector
  switch(i){
    case 0: 
      return [v, c, a, 1];
    case 1:
      return [b, v, a, 1];
    case 2:
      return [a, v, c, 1];
    case 3: 
      return [a, b, v, 1];
    case 4: 
      return [c, a, v, 1];
    default: 
      return [v, a, b, 1];
  };
};

// Convert RGB to HSV. Based on http://www.cs.rit.edu/~ncs/color/t_convert.html
var rgbToHsv = function(color) {
  // Determine V
  var min, max, delta, h, s;
  min = Math.min(color[0], color[1], color[2]);
  max = Math.max(color[0], color[1], color[2]);
  delta = max - min;
  
  // Determine S
  if (max != 0)
    s = delta / max;
  else 
    return [0, 0, 0, 1];
  
  // Determine H
  if (delta == 0) 
    h = 0;
  else if (color[0] == max)
    h = (color[1] - color[2]) / delta;
  else if (color[1] == max)
    h = 2 + (color[2] - color[0]) / delta;
  else 
    h = 4 + (color[0] - color[1]) / delta;
  
  h *= 60;
  if (h < 0)
    h += 360;
    
  return [h, s * 100, max * 100, 1];
  
};

/* Alpha corresponds to percent white when on a white background.
As a result, this function will return the color attentuated
toward a white background for cases where the color is being 
actively changed. Alpha will only be directly stored if it is
the manipulated color type.*/
var alphaToRgb = function(color) {
  var pctAlpha = color[0];
  
  return [(color[3] * pctAlpha + (1 - pctAlpha)), 
      (color[1] * pctAlpha + (1 - pctAlpha)), 
      (color[2] * pctAlpha + (1 - pctAlpha)), 
      1];
};

// Swap R and A to simplify interfacing with the slider
var rgbToAlpha = function(color) {
  var c = color.slice(0);
  
  // Set the mins and maxs appropriately for the slider
  COLORTYPE.Alpha.mins[1] = fixedColor.color[1];
  COLORTYPE.Alpha.maxs[1] = fixedColor.color[1];
  COLORTYPE.Alpha.mins[2] = fixedColor.color[2];
  COLORTYPE.Alpha.maxs[2] = fixedColor.color[2];
  
  // Return the swapped color
  return [c[3], c[1], c[2], c[0]];
};

// Convert from LCh via Lab
var lchToRgb = function(color) {
  var lab = [color[0], color[1] * Math.cos(color[2] * (Math.PI / 180)), color[1] * Math.sin(color[2] * (Math.PI / 180))];
  return convertFrom(lab, COLORTYPE.Lab);
};

// Convert to LCh via Lab
var rgbToLch = function(color) {
  var lab = convertTo(color, COLORTYPE.Lab);
  var lch = [lab[0], Math.sqrt(lab[1] * lab[1] + lab[2]*lab[2]), (180 / Math.PI) * Math.atan2(lab[2], lab[1]), 1];
  while (lch[2] < 0)
    lch[2] += 360;
  while (lch[2] > 360) 
    lch[2] -= 360;
    
  return lch;
};

var labToXYZ = function(c) {
  var rgb = convertFrom(c, COLORTYPE.Lab);
  var rgbXyzMatrix = [[0.4124564, 0.3575761, 0.1804375],   
            [0.2126729, 0.7151522, 0.0721750], 
            [0.0193339, 0.1191920, 0.9503041]];
  return multiplyMatrix(rgbXyzMatrix, rgb.slice(0, 3));
};



var xyzToLab = function(c) {
  var xyzRgbMatrix = [[3.2404542, -1.5371385, -0.4985314], 
            [-0.9692660, 1.8760108, 0.0415560], 
            [0.0556434, -0.2040259, 1.0572252]];
  var rgb = multiplyMatrix(xyzRgbMatrix, c);
  return convertTo(rgb, COLORTYPE.Lab);
};

var xyzToLMS = function(c) {
  var xyzToLmsMatrix = [  [0.15516, 0.54307, 0.03287], 
              [-0.15516, 0.45692, 0.03287],
              [0.0, 0.0, 0.01608]];
  
  return multiplyMatrix(xyzToLmsMatrix, c);
};

var lmsToXYZ = function(c) {
  var lmsToXyzMatrix = [  [2.944861, -3.500099, 1.134994],
              [1.000010, 1.000010, -4.088349],
              [0.0, 0.0, 62.189055]];
  return multiplyMatrix(lmsToXyzMatrix, c);
};

// vector version of http://stackoverflow.com/questions/14850511/js-matrix-multiplication-issue
function multiplyMatrix(m1, m2) {
    var result = [];
  for(var k = 0; k < m1[0].length; k++) {
    var sum = 0;
    for(var i = 0; i < m1.length; i++) {
      sum += m1[i][k] * m2[i];
    }
    result.push(sum);
  }
    
    return result;
}

var chroma = function(color) {
  // Convert RGB to CIELab
  var c = d3.lab("rgb(" + (color[0] * 255) + ", " + (color[1] * 255) + ", " + (color[2] * 255) + ")");
  return Math.sqrt(c.a * c.a + c.b * c.b);
};
