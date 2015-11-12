// Code to write a series of results to a CSV
var writeData = function(startDate, endDate) {
  // Compute the file contents
  var fixedC = convertFrom(fixedColor.color, colorType);
  var fixedS = pixelsToVisualAngle(fixedSize, inchesToDisplay, dpi);
  var adjustedC = convertFrom(adjustedColor.color, colorType);
  //var respC = convertFrom(respColor, colorType);
  var adjustedS = pixelsToVisualAngle(adjustedSize, inchesToDisplay, dpi);
  var outputLine = [  (parseInt(colorPtr) + 1), userId, age, gender, cvd, dpi, shapeType, numCircles, colorType.name, clrOffset, activeColor.fixedSide, resp, fixedColor.isControl,
            fixedS, fixedColor.id, activeColor.position];
            
  if (fixedSize > adjustedSize)
    outputLine.push("Fixed");
  else
    outputLine.push("Equal");
  
  // Write out the relative size variable
  /*var sizeData = [];
  
  if (fixedSize > adjustedSize) {
    sizeData = [];
    sizeData = sizeData.concat(getColorFields(fixedC, respC));
    sizeData.push(fixedS - adjustedS);
    sizeData.push(fixedS / adjustedS);
  }
  else if (fixedSize < adjustedSize) {
    var isLeft = activeColor.fixedSide == "left" ? "right" : "left";
    sizeData = [];
    sizeData = sizeData.concat(getColorFields(respC, fixedC));
    sizeData.push(adjustedS - fixedS);
    sizeData.push(adjustedS / fixedS);
  }
  else {
    sizeData = [];
    sizeData = sizeData.concat(getColorFields(fixedC, respC));
    sizeData.push(adjustedS - fixedS);
    sizeData.push(adjustedS / fixedS);
  }*/
  
  // Output everything in LCh
  outputLine = outputLine.concat(getColorFields(fixedC, adjustedC));
  //outputLine = outputLine.concat(getColorFields(fixedC, respC));
  //outputLine = outputLine.concat(sizeData);
  
  outputLine = roundForDisplay(outputLine);
  
  // Step number of the jittered color is displaced along the axis
  outputLine.push(fixedColor.l_deltas);
  outputLine.push(fixedColor.a_deltas);
  outputLine.push(fixedColor.b_deltas);
  
  // Add the time stamps
  outputLine.push(formatDate(startDate));
  outputLine.push(formatDate(endDate));
  outputLine.push((endDate - startDate).toString());
  outputLine.push((endDate - trialStartTime - 500 * colorPtr).toString());  // Account for delay to show response
  
  // Add any remaining config params
  outputLine.push(pixelsToVisualAngle(proximity, inchesToDisplay, dpi)/2);
  outputLine.push(colorIterations);
  outputLine.push(colorFile);
  outputLine.push(numSamples);
  outputLine.push(layoutType);
  outputLine.push(background);
  
  // Write out the file
  var outputData = JSON.stringify(outputLine.join(",") + "\n");
  $.ajax({
    type: "POST",
    async: false,
    url: "writeOut.php",
    data: {'data': outputData, 'session_name': JSON.stringify(userId + "_" + writeDate(trialStartTime) + ".csv")},
    dataType: 'json',
    cache: false,
    success: function() {
      //pickNext();
    },
    error: function(e) {
      //pickNext();
      console.log(e);
    }
  });
  
  console.log(outputData);
};

var toHtml = function(color) {
  return "rgba(" + parseInt(255 * color[0]) + "," + parseInt(255 * color[1]) + "," + parseInt(255 * color[2]) + "," + color[3] + ")";
};

var formatDate = function(date) {
  return (date.getMonth() * 100 / 100 + 1) + "/" + date.getDate() + "/" + date.getFullYear() + " "  
      + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds(); 
};

var writeDate = function(date) {
  return (date.getMonth() * 100 / 100 + 1) + "_" + date.getDate() + "_" + date.getFullYear() + "_"  
      + date.getHours() + "_" + date.getMinutes() + "_" + date.getSeconds() + "_" + date.getMilliseconds(); 
};

// Big is generally fixed
var getColorFields = function(first, second) {
  // Get the LCh data
  var big = convertTo(first, COLORTYPE.Lab).slice(0, 3);
  var small = convertTo(second, COLORTYPE.Lab).slice(0, 3);
  
  return [big, small, big[0] - small[0], big[1] - small[1], big[2] - small[2],
      Math.sqrt(  (big[0] - small[0])*(big[0] - small[0]) + 
            (big[1] - small[1])*(big[1] - small[1]) + 
            (big[2] - small[2]) * (big[2] - small[2])
            )];
};

var roundForDisplay = function(arr) {
  var out = []
  for (v in arr) {
    out.push(roundVal(arr[v]));
  }
  return out;
};

var roundVal = function(v) {
  if ($.isArray(v)) {
    return roundForDisplay(v);
  }
  if (isNaN(parseFloat(v))) {
    return v;
  }
  return Math.round(v * 1000) / 1000;
};