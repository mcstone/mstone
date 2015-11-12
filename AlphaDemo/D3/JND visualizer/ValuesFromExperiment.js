// JScript source code
//these are the colors used in the JND experiments, as RGB values in the range 0..1
var stimColors = [[0.276991736, 0.276991723, 0.276991727
],
[0.323353135, 0.272703823, 0.121158949
],
[0.416265077, 0.21440951, 0.280102211
],
[0.446143626, 0.208630427, 0.128543973
],
[0.351528593, 0.22481811, 0.430556313
],
[0.379033802, 0.379033785, 0.379033791
],
[0.431925096, 0.374205303, 0.217090257
],
[0.529059665, 0.316675585, 0.382244027
],
[0.565393517, 0.310654622, 0.223198619
],
[0.46042087, 0.326397519, 0.540788404
],
[0.322983705, 0.340363035, 0.703694269
],
[0.657801213, 0.213330037, 0.38606234
],
[0.685729567, 0.203695802, 0.230306068
],
[0.607621817, 0.228359007, 0.543272335
],
[0.520425597, 0.249010256, 0.70546736
],
[0.351920341, 0.275006378, 0.873156715
],
[0.26189251, 0.417666976, 0.211960592
],
[0.486148083, 0.486148062, 0.486148069
],
[0.544472494, 0.480878466, 0.3180297
],
[0.37422926, 0.494083521, 0.652780661
],
[0.645396987, 0.423304615, 0.489452981
],
[0.687376955, 0.417025927, 0.323559679
],
[0.573241361, 0.432704508, 0.655054828
],
[0.444331966, 0.445642829, 0.824166957
],
[0.783480503, 0.330657412, 0.493285097
],
[0.816572684, 0.322115865, 0.329890584
],
[0.72891819, 0.343250123, 0.657703194
],
[0.640720965, 0.360242173, 0.826132762
],
[0.368631414, 0.527435265, 0.313276183
],
[0.597700354, 0.597700328, 0.597700337
],
[0.660672955, 0.592058021, 0.423787611
],
[0.697091863, 0.588422557, 0.233302381
],
[0.487964156, 0.605726636, 0.770532756
],
[0.765042214, 0.53408353, 0.601094189
],
[0.812021707, 0.527558978, 0.429003963
],
[0.840216576, 0.523343005, 0.24372973
],
[0.68970146, 0.543327145, 0.772979243
],
[0.853020939, 0.458165599, 0.775771964
],
[0.37642313, 0.646366194, 0.594749959
],
[0.478961432, 0.641269212, 0.419218745
],
[0.532064323, 0.63799041, 0.223854203
],
[0.713215597, 0.713215567, 0.713215578
],
[0.780249747, 0.70725019, 0.533932234
],
[0.821903734, 0.703149657, 0.343762883
],
[0.491738897, 0.764238631, 0.710140469
],
[0.592903085, 0.758791103, 0.529459843
],
[0.65077209, 0.755051549, 0.335977523
],
[0.428892678, 0.796750214, 0.32901268
],
[0.832322923, 0.832322888, 0.8323229
],
[0.609342754, 0.88545191, 0.829136026
],
[0.710290239, 0.879693483, 0.643635738
],
[0.77237392, 0.87554465, 0.448990874]];

//these are the 11 sizes we tested
var testedSizes = [0.333, 0.4, 0.5, 0.667, 0.8, 1.0, 1.25, 1.625, 2.0, 4.0, 6.0];

//These are the display parameters
var inchesToDisplay = 24;
var dpi = 96; //constant for now
// dpi = $("#dpi").height();  //this will need to be called at the top level

// Convert from a visual angle to pixel values to compute sizes
var visualAngleToPixels = function (angleDegrees, inchesToDisplay, approxDpi) {
    var angleRadians = angleDegrees * Math.PI / 180.0;
    return 2 * inchesToDisplay * Math.tan(angleRadians / 2.0) * approxDpi;
};

// Convert from a pixel size to a visual angle in degrees
var pixelsToVisualAngle = function (pixels, inchesToDisplay, approxDpi) {
    var sizeInches = 2 * pixels / approxDpi; 		// 2 is to account for pixels being a radius
    return 2 * Math.atan2(sizeInches, (2 * inchesToDisplay)) * (180 / Math.PI);
};
//just for illustration
var constantJND50 = function(size) {
	return([5,5,5]);
}

var JND50 = function (size) {
    // JND = const + frac(1/size)
    //calculated from our data.
    var frac = [0.751199, 1.54136, 2.87127];
    var constant = [5.07857, 5.33884, 5.34949];
    var JND = [0, 0, 0];
    for (var i = 0; i <3; i++) {
        JND[i] = constant[i]+frac[i]*(1.0/size);
    }
    return(JND);
}

var ND = function(p,s) {
	//ND(p,s) = p(A+B/s);
	var frac = [1.50, 3.08, 5.74]
	var constant = [10.16,10.68, 10.70]
	var ND = [0,0,0];
	for (var i = 0; i <3; i++) {
        ND[i] = p*(constant[i]+frac[i]*(1.0/s));
    }
	return(ND)
}
	
LABToHue = function(lab) {
    if (Math.abs(lab.a) <  0.000001 & Math.abs(lab.b) <  0.000001) return 0;
    else return Math.atan2(lab.b,lab.a);
}
LABToChroma = function(lab) {
    return Math.sqrt(lab.a*lab.a+lab.b*lab.b);
}
chromaSteps = function (size, c_rgb, offsets) {
    var JND = JND50(size); //L, a, b steps
    var c_lab = d3.lab(c_rgb);
    var c_hcl = d3.hcl(c_rgb);
    var Lnorm_step = 5;
    var colors_Lexp = [];
    var colors_Lnorm = [];
    var colors_Cexp = [];
    var colors_Cnorm = [];
    var rt2 = Math.sqrt(2);
    var lab_exp, lab_norm;
    var exp_hcl, norm_hcl;
    var exp_lab, norm_lab;
    for (var i = 0; i < offsets.length; i++) {
        //var norm_step = (JND[0] * offsets[i]) / rt2;  //use the same as L*
        var norm_step = (Lnorm_step* offsets[i]) / rt2;
        var exp_step = (offsets[i] * 0.5 * (JND[1] + JND[2])) / rt2; //average of the a and 
        exp_hcl = d3.hcl(c_rgb);
        exp_hcl.c = exp_hcl.c + exp_step;
        if (exp_hcl.c < 0) { exp_hcl.c = 0; }
        exp_lab = d3.lab(exp_hcl.rgb());
        norm_hcl = d3.hcl(c_rgb);
        norm_hcl.c = norm_hcl.c + norm_step;
        if (norm_hcl.c < 0) norm_hcl.c = 0;
        norm_lab = d3.lab(norm_hcl.rgb());
        console.log(norm_step, exp_step, offsets[i]);
        console.log(c_hcl, norm_hcl, exp_hcl);
        console.log(c_lab, norm_lab, exp_lab);
        colors_Cexp[i] = clipToRGB(exp_lab);
        colors_Cnorm[i] = clipToRGB(norm_lab);
        colors_Lexp[i] = clipToRGB(d3.lab(c_lab.l + JND[0] * offsets[i], c_lab.a, c_lab.b));
        colors_Lnorm[i] = clipToRGB(d3.lab(c_lab.l + Lnorm_step * offsets[i], c_lab.a, c_lab.b));
        //console.log(colors_L[i]);
        //console.log(colors_Cexp[i])
        //console.log(colors_Cnorm[i]);
    }
    return ([colors_Lexp, colors_Lnorm, colors_Cexp, colors_Cnorm]);
}
chromaSteps_old = function (size, c_rgb, offsets) {
    var JND = JND50(size); //L, a, b steps
    var c_lab = d3.lab(c_rgb);
    var c_hcl = d3.hcl(c_rgb);
    console.log(c_lab, test_lab);
    var colors_L = [];
    var colors_Cexp = [];
    var colors_Cnorm = [];
    var rt2 = Math.sqrt(2);
    var exp_hcl, norm_hcl;
    var exp_lab, norm_lab;
    for (var i = 0; i < offsets.length; i++) {
        var C_step = (JND[0] * offsets[i]) / rt2;
        colors_L[i] = clipToRGB(d3.lab(c_lab.l + JND[0] * offsets[i], c_lab.a, c_lab.b));
        //chroma steps defined as original L, equal steps in a and be defined by the ND for L*
        norm_lab = d3.lab(c_lab.l, c_lab.a + C_step, c_lab.b + C_step);
        //chroma steps defined as original L, equal ND steps in a and b
        exp_lab = d3.lab(c_lab.l, c_lab.a + (JND[1] * offsets[i]) / rt2, c_lab.b + (JND[2] * offsets[i]) / rt2);
        exp_hcl = d3.hcl(norm_lab);
        norm_hcl = d3.hcl(norm_lab);
//        console.log(exp_hcl, norm_hcl, c_hcl, exp_lab, norm_lab, c_lab, offsets[i]);
        colors_Cexp[i] = clipToRGB(exp_lab);
        colors_Cnorm[i] = clipToRGB(norm_lab);
    }
    return ([colors_L, colors_Cexp, colors_Cnorm]);
}
jndColors = function (p, size, c_rgb, offsets) {
    var JND = ND(p, size); //L, a, b steps
	var ND50 = JND50(size);
    var c_lab = d3.lab(c_rgb);
    // offsets shows us how to jitter each axis. Multiply times the JND
    var colors_L = [];
    var colors_a = [];
    var colors_b = [];
    for (var i = 0; i < offsets.length; i++) {
        colors_L[i] = clipToRGB(d3.lab(c_lab.l + JND[0] * offsets[i], c_lab.a, c_lab.b));
        colors_a[i] = clipToRGB(d3.lab(c_lab.l, c_lab.a + JND[1] * offsets[i], c_lab.b));
        colors_b[i] = clipToRGB(d3.lab(c_lab.l, c_lab.a, c_lab.b + JND[2] * offsets[i]));
    }
    return ([colors_L, colors_a, colors_b]);
}

//for comparison, what if we don't attenuate A and B so much?
fixedJND = function (size, c_rgb, offsets) {
    var JND = JND50(size); //L, a, b steps
    var c_lab = d3.lab(c_rgb);
    var colors_L = [];
    var colors_a = [];
    var colors_b = [];
    //force them to be all the same as the L step
    JND[1] = JND[0];
    JND[2] = JND[0];
    for (var i = 0; i < offsets.length; i++) {
        colors_L[i] = clipToRGB(d3.lab(c_lab.l + JND[0] * offsets[i], c_lab.a, c_lab.b));
        colors_a[i] = clipToRGB(d3.lab(c_lab.l, c_lab.a + JND[1] * offsets[i], c_lab.b));
        colors_b[i] = clipToRGB(d3.lab(c_lab.l, c_lab.a, c_lab.b + JND[2] * offsets[i]));
    }
    return ([colors_L, colors_a, colors_b]);
}
clipToRGB = function (c_lab) {
    var c_rgb = c_lab.rgb();
    if (outOfGamut(c_rgb.r) || outOfGamut(c_rgb.g) || outOfGamut(c_rgb.b) ) {
        clipped = true;
 //       console.log("Clipped", c_lab, c_rgb);
        return d3.rgb(200, 200, 200); //light error color
    }

    else {
        c_rgb.r = Math.round(c_rgb.r);  //Needs them to be ints or the toString() function creates garbage. Lame
        c_rgb.g = Math.round(c_rgb.g);
        c_rgb.b = Math.round(c_rgb.b);
        return (c_rgb);
    }
}
outOfGamut = function (v) {
    if ((v > 255) || (v < 0))  return (true); else return false;
}

  
