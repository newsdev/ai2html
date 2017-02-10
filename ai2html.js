// ai2html.js
var scriptVersion     = "0.61";
var scriptEnvironment = "dvz";

// ai2html is a script for Adobe Illustrator that converts your Illustrator document into html and css.


// Copyright (c) 2011-2015 The New York Times Company

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this library except in compliance with the License.
// You may obtain a copy of the License at

// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.




// =====================================
// How to install ai2html
// =====================================

// - Move the ai2html.js file into the Illustrator folder where scripts are located.
// - For example, on Mac OS X running Adobe Illustrator CC 2014, the path would be: // Adobe Illustrator CC 2014/Presets/en_US/Scripts/ai2html.jsx

// =====================================
// How to use ai2html
// =====================================

// - Create your Illustrator artwork.
// - Size the artboard to the dimensions that you want the div to appear on the web page.
// - Make sure your Document Color Mode is set to RGB.
// - Make sure your document is saved.
// - Use Arial or Georgia unless you have added your own fonts to the fonts array in the script.
// - Run the script by choosing: File > Scripts > ai2html
// - Go to the folder containing your Illustrator file. Inside will be a folder called ai2html-output.
// - Open the html files in your browser to preview your output.

// Adding [].indexOf to Illustrator JavaScript
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/) {
        var len = this.length;
        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0) from += len;
        for (; from < len; from++) {
            if (from in this && this[from] === elt) return from;
        }
        return -1;
   };
}

// =====================================
// functions
// =====================================

// html entity substitution
// not used ==> ["\x22","&quot;"], ["\x3C","&lt;"], ["\x3E","&gt;"], ["\x26","&amp;"],
var htmlCharacterCodes = [["\xA0","&nbsp;"], ["\xA1","&iexcl;"], ["\xA2","&cent;"], ["\xA3","&pound;"], ["\xA4","&curren;"], ["\xA5","&yen;"], ["\xA6","&brvbar;"], ["\xA7","&sect;"], ["\xA8","&uml;"], ["\xA9","&copy;"], ["\xAA","&ordf;"], ["\xAB","&laquo;"], ["\xAC","&not;"], ["\xAD","&shy;"], ["\xAE","&reg;"], ["\xAF","&macr;"], ["\xB0","&deg;"], ["\xB1","&plusmn;"], ["\xB2","&sup2;"], ["\xB3","&sup3;"], ["\xB4","&acute;"], ["\xB5","&micro;"], ["\xB6","&para;"], ["\xB7","&middot;"], ["\xB8","&cedil;"], ["\xB9","&sup1;"], ["\xBA","&ordm;"], ["\xBB","&raquo;"], ["\xBC","&frac14;"], ["\xBD","&frac12;"], ["\xBE","&frac34;"], ["\xBF","&iquest;"], ["\xD7","&times;"], ["\xF7","&divide;"], ["\u0192","&fnof;"], ["\u02C6","&circ;"], ["\u02DC","&tilde;"], ["\u2002","&ensp;"], ["\u2003","&emsp;"], ["\u2009","&thinsp;"], ["\u200C","&zwnj;"], ["\u200D","&zwj;"], ["\u200E","&lrm;"], ["\u200F","&rlm;"], ["\u2013","&ndash;"], ["\u2014","&mdash;"], ["\u2018","&lsquo;"], ["\u2019","&rsquo;"], ["\u201A","&sbquo;"], ["\u201C","&ldquo;"], ["\u201D","&rdquo;"], ["\u201E","&bdquo;"], ["\u2020","&dagger;"], ["\u2021","&Dagger;"], ["\u2022","&bull;"], ["\u2026","&hellip;"], ["\u2030","&permil;"], ["\u2032","&prime;"], ["\u2033","&Prime;"], ["\u2039","&lsaquo;"], ["\u203A","&rsaquo;"], ["\u203E","&oline;"], ["\u2044","&frasl;"], ["\u20AC","&euro;"], ["\u2111","&image;"], ["\u2113",""], ["\u2116",""], ["\u2118","&weierp;"], ["\u211C","&real;"], ["\u2122","&trade;"], ["\u2135","&alefsym;"], ["\u2190","&larr;"], ["\u2191","&uarr;"], ["\u2192","&rarr;"], ["\u2193","&darr;"], ["\u2194","&harr;"], ["\u21B5","&crarr;"], ["\u21D0","&lArr;"], ["\u21D1","&uArr;"], ["\u21D2","&rArr;"], ["\u21D3","&dArr;"], ["\u21D4","&hArr;"], ["\u2200","&forall;"], ["\u2202","&part;"], ["\u2203","&exist;"], ["\u2205","&empty;"], ["\u2207","&nabla;"], ["\u2208","&isin;"], ["\u2209","&notin;"], ["\u220B","&ni;"], ["\u220F","&prod;"], ["\u2211","&sum;"], ["\u2212","&minus;"], ["\u2217","&lowast;"], ["\u221A","&radic;"], ["\u221D","&prop;"], ["\u221E","&infin;"], ["\u2220","&ang;"], ["\u2227","&and;"], ["\u2228","&or;"], ["\u2229","&cap;"], ["\u222A","&cup;"], ["\u222B","&int;"], ["\u2234","&there4;"], ["\u223C","&sim;"], ["\u2245","&cong;"], ["\u2248","&asymp;"], ["\u2260","&ne;"], ["\u2261","&equiv;"], ["\u2264","&le;"], ["\u2265","&ge;"], ["\u2282","&sub;"], ["\u2283","&sup;"], ["\u2284","&nsub;"], ["\u2286","&sube;"], ["\u2287","&supe;"], ["\u2295","&oplus;"], ["\u2297","&otimes;"], ["\u22A5","&perp;"], ["\u22C5","&sdot;"], ["\u2308","&lceil;"], ["\u2309","&rceil;"], ["\u230A","&lfloor;"], ["\u230B","&rfloor;"], ["\u2329","&lang;"], ["\u232A","&rang;"], ["\u25CA","&loz;"], ["\u2660","&spades;"], ["\u2663","&clubs;"], ["\u2665","&hearts;"], ["\u2666","&diams;"]];


// http://samuelmullen.com/2012/03/left-pad-zeroes-in-javascript/
var zeroPad = function(value, padding) {
	var zeroes = "0";
	for (var i = 0; i < padding; i++) { zeroes += "0"; }
	return (zeroes + value).slice(padding * -1);
};

// multiple key sorting function from https://github.com/Teun/thenBy.js
// first by length of name, then by population, then by ID
// data.sort(
//     firstBy(function (v1, v2) { return v1.name.length - v2.name.length; })
//     .thenBy(function (v1, v2) { return v1.population - v2.population; })
//     .thenBy(function (v1, v2) { return v1.id - v2.id; });
// );
var firstBy = (function() {
    /* mixin for the `thenBy` property */
    function extend(f) {
        f.thenBy = tb;
        return f;
    }
    /* adds a secondary compare function to the target function (`this` context)
       which is applied in case the first one returns 0 (equal)
       returns a new compare function, which has a `thenBy` method as well */
    function tb(y) {
        var x = this;
        return extend(function(a, b) {
            return x(a,b) || y(a,b);
        });
    }
    return extend;
})();
Array.prototype.findUniqueValues = function() {
	var o = {}, i, l = this.length, r = [];
	for(i=0; i<l;i+=1) o[this[i]] = this[i];
	for(i in o) r.push(o[i]);
	return r;
};

var cleanText = function(text) {
	for (var i=0; i < htmlCharacterCodes.length; i++) {
		var charCode = htmlCharacterCodes[i];
		text = text.replace( new RegExp(htmlCharacterCodes[i][0],'g'), htmlCharacterCodes[i][1] )
	};
	return text;
};
var straightenCurlyQuotesInsideAngleBrackets = function(text) {
	// thanks to jashkenas
	var tagFinder = /<[^\n]+?>/g;
	var quoteFinder = /[“‘’”]([^\n]*?)[“‘’”]/g;
	return text.replace(tagFinder, function(tag){
		return tag.replace( /[“”]/g , '"' ).replace( /[‘’]/g , "'" );
	});
};
var exportImageFiles = function(dest,width,height,formats,initialScaling,doubleres) {
	// alert(formats);
	// width and height are the artboard width and height and only used to determine whether or not to double res
	// initialScaling is the proportion to scale the base image before considering whether to double res. Usually just 1.
	// Exports current document to dest as a PNG8 file with specified
	// options, dest contains the full path including the file name
	// doubleres is "yes" or "no" whether you want to allow images to be double res
	// if you want to force ai2html to use doubleres, use "always"
	
	if (doubleres=="yes" || doubleres=="always") {
		// if image is too big to use double-res, then just output single-res.
		var pngImageScaling = 200 * initialScaling;
		var jpgImageScaling = 200 * initialScaling;
		if (doubleres == 'always' || ((width*height) < (3*1024*1024/4) || (width >= 945))) {
			// <3
			// feedback.push("The jpg and png images are double resolution.");
		} else if ( (width*height) < (3*1024*1024) ) {
			// .75-3
			pngImageScaling = 100;
			// feedback.push("The png image is single resolution.");
			// feedback.push("The jpg image is double resolution.");
		} else if ( (width*height) < (32*1024*1024/4) ) {
			// 3-8
			pngImageScaling = 100;
			// warnings.push("The png image is single resolution, but is too large to display on first-generation iPhones.");
			// feedback.push("The jpg image is double resolution.");
		} else if ( (width*height) < (32*1024*1024) ) {
			// 8-32
			pngImageScaling = 100;
			jpgImageScaling = 100;
			// warnings.push("The png image is single resolution, but is too large to display on first-generation iPhones.");
			// feedback.push("The jpg image is single resolution.");
		} else {
			// 32+
			pngImageScaling = 100;
			jpgImageScaling = 100;
			// warnings.push("The jpg and png images are single resolution, but are too large to display on first-generation iPhones.");
		};
	} else {
		var pngImageScaling = 100 * initialScaling;
		var jpgImageScaling = 100 * initialScaling;
	};
	// alert("scaling\npngImageScaling = " + pngImageScaling + "\njpgImageScaling = " + jpgImageScaling);

	for (var formatNumber = 0; formatNumber < formats.length; formatNumber++) {
		var format = formats[formatNumber];
		if (format=="png") {
			var pngExportOptions = new ExportOptionsPNG8();
			var pngType = ExportType.PNG8;
			var pngFileSpec = new File(dest);
			pngExportOptions.colorCount       = docSettings.png_number_of_colors;
			pngExportOptions.transparency     = (docSettings.png_transparent==="no") ? false : true;
			pngExportOptions.artBoardClipping = true;
			pngExportOptions.antiAliasing     = false;
			pngExportOptions.horizontalScale  = pngImageScaling;
			pngExportOptions.verticalScale    = pngImageScaling;
			app.activeDocument.exportFile( pngFileSpec, pngType, pngExportOptions );
			// feedback.push("pngExportOptions.png_number_of_colors = " + pngExportOptions.colorCount);
			// feedback.push("pngExportOptions.transparency = " + pngExportOptions.transparency);
		} else if (format=="png24") {
			var pngExportOptions = new ExportOptionsPNG24();
			var pngType = ExportType.PNG24;
			var pngFileSpec = new File(dest);
			pngExportOptions.transparency     = (docSettings.png_transparent==="no") ? false : true;
			pngExportOptions.artBoardClipping = true;
			pngExportOptions.antiAliasing     = false;
			pngExportOptions.horizontalScale  = pngImageScaling;
			pngExportOptions.verticalScale    = pngImageScaling;
			app.activeDocument.exportFile( pngFileSpec, pngType, pngExportOptions );
		} else if (format=="svg") {
			var svgExportOptions = new ExportOptionsSVG();
			var svgType = ExportType.SVG;
			// alert("This will be the svg dest: " + dest);
			var svgFileSpec = new File(dest);
			svgExportOptions.embedAllFonts         = false;
			svgExportOptions.fontSubsetting        = SVGFontSubsetting.None;
			svgExportOptions.compressed            = false;
			svgExportOptions.documentEncoding      = SVGDocumentEncoding.UTF8;
			svgExportOptions.embedRasterImages     = (docSettings.svg_embed_images==="yes") ? true : false;
			// svgExportOptions.horizontalScale       = initialScaling;
			// svgExportOptions.verticalScale         = initialScaling;
			svgExportOptions.saveMultipleArtboards = false;
			svgExportOptions.DTD                   = SVGDTDVersion.SVG1_1; // SVG1_0 SVGTINY1_1 <=default SVG1_1 SVGTINY1_1PLUS SVGBASIC1_1 SVGTINY1_2
			svgExportOptions.cssProperties         = SVGCSSPropertyLocation.STYLEATTRIBUTES; // ENTITIES STYLEATTRIBUTES <=default PRESENTATIONATTRIBUTES STYLEELEMENTS
			app.activeDocument.exportFile( svgFileSpec, svgType, svgExportOptions );

		} else if (format=="jpg") {
			if (jpgImageScaling > maxJpgImageScaling) {
				jpgImageScaling = maxJpgImageScaling;
				var promoImageFileName = dest.split("/").slice(-1)[0];
				feedback.push(promoImageFileName + ".jpg was output at a lower scaling than desired because of a limit on jpg exports in Illustrator. If the file needs to be larger, change the image format to png which does not appear to have limits.")
			};
			var jpgExportOptions = new ExportOptionsJPEG();
			var jpgType = ExportType.JPEG;
			var jpgFileSpec = new File(dest);
			jpgExportOptions.artBoardClipping = true;
			jpgExportOptions.antiAliasing     = false;
			jpgExportOptions.qualitySetting   = docSettings.jpg_quality;
			jpgExportOptions.horizontalScale  = jpgImageScaling;
			jpgExportOptions.verticalScale    = jpgImageScaling;
			app.activeDocument.exportFile( jpgFileSpec, jpgType, jpgExportOptions );
			// feedback.push("jpgExportOptions.qualitySetting = " + jpgExportOptions.qualitySetting);
		};
	};
};
var isEmpty = function(str) {
	return (!str || 0 === str.length);
};
var isBlank = function(str) {
	return (!str || /^\s*$/.test(str));
};
var makeKeyword = function(text) {
	// text = text.replace( /[^A-Za-z0-9_\-]/g , "_" ).toLowerCase();
	text = text.replace( /[^A-Za-z0-9_\-]/g , "_" );
	return text;
};
var unlockStuff = function(parentObj) {
	if (parentObj.typename=="Layer" || parentObj.typename=="Document") {
		for (var layerNo = 0; layerNo < parentObj.layers.length; layerNo++) {
			var currentLayer = parentObj.layers[layerNo];
			if (currentLayer.locked==true) {
				currentLayer.locked = false;
				lockedObjects.push(currentLayer);
			};
			if (currentLayer.visible==false) {
				currentLayer.visible = true;
				hiddenObjects.push(currentLayer);
			};
			unlockStuff(currentLayer);
		};
	};
	for (var groupItemsNo = 0; groupItemsNo < parentObj.groupItems.length; groupItemsNo++) {
		var currentGroupItem = parentObj.groupItems[groupItemsNo];
		if (currentGroupItem.locked==true) {
			currentGroupItem.locked = false;
			lockedObjects.push(currentGroupItem);
		};
		unlockStuff(currentGroupItem);
	};
	for (var textFrameNo = 0; textFrameNo < parentObj.textFrames.length; textFrameNo++) {
		var currentTextFrame = parentObj.textFrames[textFrameNo];
		// this line is producing the MRAP error!!!
		if (currentTextFrame.locked==true) {
			currentTextFrame.locked = false;
			lockedObjects.push(currentTextFrame);
		};
	};
};
var hideTextFrame = function(textFrame) {
	textFramesToUnhide.push(textFrame);
	textFrame.hidden = true;
};
var roundTo = function(numberToRound,decimalPlaces) {
	var roundedNumber = Math.round(numberToRound * Math.pow(10,decimalPlaces)) / Math.pow(10,decimalPlaces);
	return roundedNumber;
};
var createPromoImage = function(abNumber) {
	doc.artboards.setActiveArtboardIndex(abNumber);
	var activeArtboard       =  doc.artboards[abNumber];
		activeArtboardRect   =  activeArtboard.artboardRect,
		abX                  =  activeArtboardRect[0],
		abY                  = -activeArtboardRect[1],
		abW                  =  Math.round(activeArtboardRect[2]-abX),
		abH                  = -activeArtboardRect[3]-abY,
		artboardAspectRatio  =  abH/abW,
		artboardName         =  makeKeyword(activeArtboard.name),
		docArtboardName      =  makeKeyword(docSettings.project_name) + "-" + artboardName + "-" + abNumber,
		imageDestination     =  docPath + docArtboardName + "-promo",
		promoImageAspect     =  promoImageMinHeight/promoImageMinWidth,
		promoScale           =  1;
	if (artboardAspectRatio>promoImageAspect) {
		promoScale = promoImageMinWidth/abW;
		if (abH * promoScale > promoImageMaxHeight) {
			promoScale = promoImageMaxHeight/abH;
		}
	} else {
		promoScale = promoImageMinHeight/abH;
		if (abW * promoScale > promoImageMaxWidth) {
			promoScale = promoImageMaxWidth/abW;
		}
	}

	var promoW = abW * promoScale;
	var promoH = abH * promoScale;

	// feedback.push("promoImageAspect = " + promoImageAspect + "\r" +
	// 	"abNumber = " + abNumber + "\r" +
	// 	"artboardAspectRatio = " + artboardAspectRatio + "\r" +
	// 	"promoScale = " + promoScale + "\r" +
	// 	"abW = " + abW + "\r" +
	// 	"abH = " + abH + "\r" +
	// 	"promoW = " + promoW + "\r" +
	// 	"promoH = " + promoH);

	// alert("promoImageAspect = " + promoImageAspect + "\r" +
	// 	"abNumber = " + abNumber + "\r" +
	// 	"artboardAspectRatio = " + artboardAspectRatio + "\r" +
	// 	"promoScale = " + promoScale + "\r" +
	// 	"abW = " + abW + "\r" +
	// 	"abH = " + abH + "\r" +
	// 	"promoW = " + promoW + "\r" +
	// 	"promoH = " + promoH);

	// var promoImageFormat = [];
	// if (docSettings.image_format[0]=="png" ||
	// 	docSettings.image_format[0]=="png24" ||
	// 	docSettings.image_format[0]=="svg")
	// {
	// 	promoImageFormat.push("png");
	// } else {
	// 	promoImageFormat.push(docSettings.image_format[0]);
	// };

	var promoImageFormats = [];
	for (var formatNo = 0; formatNo < docSettings.image_format.length; formatNo++) {
		var promoFormat = docSettings.image_format[formatNo];
		if (promoFormat=="png" ||
			promoFormat=="png24" ||
			promoFormat=="svg")
		{
			promoImageFormats.push("png");
		} else {
			promoImageFormats.push(promoFormat);
		};
	};

	pBar.setTitle(artboardName + ': Writing promo image...');

	var tempPNGtransparency = docSettings.png_transparent;
	docSettings.png_transparent = "no";
	if (docSettings.write_image_files=="yes") {
		exportImageFiles(imageDestination,promoW,promoH,promoImageFormats,promoScale,"no");
		};
	docSettings.png_transparent = tempPNGtransparency;
};
var applyTemplate = function(template,atObject) {
	var newText = template;
	for (var atKey in atObject) {
		var mustachePattern = new RegExp("\\{\\{\\{? *" + atKey + " *\\}\\}\\}?","g");
		var ejsPattern      = new RegExp("\\<\\%[=]? *" + atKey + " *\\%\\>","g");
		var replacePattern  = atObject[atKey];
		newText = newText.replace( mustachePattern , replacePattern );
		newText = newText.replace( ejsPattern      , replacePattern );
	};
	return newText;
};
var outputHtml = function(htmlText,fileDestination) {
	var htmlFile = new File( fileDestination );
	htmlFile.open( "w", "TEXT", "TEXT" );
		htmlFile.lineFeed = "Unix";
		htmlFile.encoding = "UTF-8";
		htmlFile.writeln(htmlText);
	htmlFile.close;
};
var readTextFileAndPutIntoAVariable = function(inputFile,starterText,linePrefix,lineSuffix) {
	var outputText = starterText;
	if ( inputFile.exists ) {
		inputFile.open("r");
		while(!inputFile.eof) {
			outputText += linePrefix + inputFile.readln() + lineSuffix;
		};
		inputFile.close();
	} else {
		errors.push(inputFile + " could not be found.");
	};
	return outputText;
};
var checkForOutputFolder = function(folderPath, nickname) {
	var outputFolder = new Folder( folderPath );
	if (!outputFolder.exists) {
		var outputFolderCreated = outputFolder.create();
		if (outputFolderCreated) {
			feedback.push("The " + nickname + " folder did not exist, so the folder was created.");
		} else {
			warnings.push("The " + nickname + " folder did not exist and could not be created.");
		};
	};
};

// ================================================
// Progress bar
// ================================================

function progressBar() {
  this.win = null;
}

progressBar.prototype.init = function() {
  var min=0, max=100;

  var win = new Window("palette", "Ai2html progress", [150, 150, 600, 260]);
  this.win = win;

  win.pnl = win.add("panel", [10, 10, 440, 100], "Progress");

  win.pnl.progBar      = win.pnl.add("progressbar", [20, 35, 410, 60], min, max);
  win.pnl.progBarLabel = win.pnl.add("statictext", [20, 20, 320, 35], min+"%");

  win.show();

  return true;
}

progressBar.prototype.setProgress = function(progress) {
  var win = this.win;
  var max = win.pnl.progBar.maxvalue,
      min = win.pnl.progBar.minvalue;

  // progress is always 0.0 to 1.0
  var pct = progress * max;
  win.pnl.progBar.value = pct;

  this.setLabel();
  win.update();
}

progressBar.prototype.getProgress = function() {
  var win = this.win;
  var max = win.pnl.progBar.maxvalue,
      min = win.pnl.progBar.minvalue;

  return this.win.pnl.progBar.value/max;
}

progressBar.prototype.setLabel = function() {
  this.win.pnl.progBarLabel.text = Math.round(this.win.pnl.progBar.value) + "%";
}

progressBar.prototype.setTitle = function(title) {
  this.win.pnl.text = title;
  this.win.update();
}

progressBar.prototype.increment = function(amount) {
  var amount = amount || 0.01;
  var win = this.win;
  this.setProgress(this.getProgress()+amount);
  win.update();
}

progressBar.prototype.close = function() {
	this.win.update();
	this.win.close();
}

// ================================================
// ai2html and config settings
// ================================================

// Settings can be generated by making a copy of this Google Spreadsheet:
	// https://docs.google.com/spreadsheets/d/13ESQ9ktfkdzFq78FkWLGaZr2s3lNbv2cN25F2pYf5XM/edit?usp=sharing
	// Make a copy of the spreadsheet for yourself.
	// Modify the settings to taste.
	// Copy the contents from column Images and replace the settings statements:
if (scriptEnvironment=="nyt") {
	var ai2htmlBaseSettings = {
        ai2html_environment: {defaultValue: scriptEnvironment, includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        settings_version: {defaultValue: scriptVersion, includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        create_promo_image: {defaultValue: "yes", includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        image_format: {defaultValue: ["png"], includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "array", possibleValues: "jpg, png, png24", notes: "Images will be generated in mulitple formats if multiple formats are listed, separated by commas. The first format will be used in the html. Sometimes this is useful to compare which format will have a smaller file size."},
        write_image_files: {defaultValue: "yes", includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: "Set this to “no” to skip writing the image files. Generally only use this after you have run the script once with this setting set to “yes.”"},
        responsiveness: {defaultValue: "fixed", includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "fixed, dynamic", notes: "Dynamic responsiveness means ai graphics will scale to fill the container they are placed in."},
        max_width: {defaultValue: "", includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "integer", possibleValues: "", notes: "Blank or any positive number in pixels, but do not write “px” - blank means artboards will set max size, instead it is written to the config file so that the max width can be applied to the template’s container."},
        output: {defaultValue: "one-file", includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "one-file, multiple-files", notes: "One html file containing all the artboards or a separate html file for each artboard."},
        project_name: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: "Use this to set a custom project name. The project name is being used in output filenames, class names, etc."},
        html_output_path: {defaultValue: "../src/", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "folderPath", possibleValues: "", notes: "Allows user to change folder to write html files, path should be written relative to ai file location. This is ignored if the project_type in the yml is ai2html."},
        html_output_extension: {defaultValue: ".html", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "fileExtension", possibleValues: "", notes: "This is ignored if the project_type in the yml is ai2html."},
        image_output_path: {defaultValue: "../public/_assets/", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "folderPath", possibleValues: "", notes: "_assets/ for preview default. This is where the image files get written to locally and should be written as if the html_output location is the starting point."},
        image_source_path: {defaultValue: null, includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "folderPath", possibleValues: "", notes: "Use this setting to specify from where the images are being loaded from the HTML file. Defaults to image_output_path"},
        create_config_file: {defaultValue: "true", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "trueFalse", possibleValues: "", notes: "This is ignored in env=nyt."},
        config_file_path: {defaultValue: "../config.yml", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "filePath", possibleValues: "", notes: "This only gets used to write the config file. It’s not used in the nyt mode to read the config.yml. Path should written relative to the ai file location."},
        local_preview_template: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "filePath", possibleValues: "", notes: ""},
        png_transparent: {defaultValue: "no", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        png_number_of_colors: {defaultValue: 128, includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "integer", possibleValues: "2 to 256", notes: ""},
        jpg_quality: {defaultValue: 60, includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "integer", possibleValues: "0 to 100", notes: ""},
        center_html_output: {defaultValue: "true", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: "Adds “margin:0 auto;” to the div containing the ai2html output."},
        use_2x_images_if_possible: {defaultValue: "yes", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        use_lazy_loader: {defaultValue: "yes", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        include_resizer_css_js: {defaultValue: "yes", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        include_resizer_classes: {defaultValue: "no", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        include_resizer_widths: {defaultValue: "yes", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        include_resizer_script: {defaultValue: "yes", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        svg_embed_images: {defaultValue: "no", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        render_rotated_skewed_text_as: {defaultValue: "html", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "image, html", notes: ""},
        show_completion_dialog_box: {defaultValue: "true", includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "trueFalse", possibleValues: "", notes: "Set this to false if you don't want to see the dialog box confirming completion of the script."},
        clickable_link: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: "If you put a url in this field, an <a> tag will be added, wrapping around the output and pointing to that url."},
        testing_mode: {defaultValue: "no", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        last_updated_text: {defaultValue: "", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: ""},
        headline: {defaultValue: "", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: ""},
        leadin: {defaultValue: "", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: ""},
        summary: {defaultValue: "", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: "Summary field for Scoop assets"},
        notes: {defaultValue: "", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: ""},
        sources: {defaultValue: "", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: ""},
        credit: {defaultValue: "By The New York Times", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: ""},
        page_template: {defaultValue: "nyt5-article-embed", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        publish_system: {defaultValue: "scoop", includeInSettingsBlock: false, includeInConfigFile: true, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        environment: {defaultValue: "production", includeInSettingsBlock: false, includeInConfigFile: true, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        show_in_compatible_apps: {defaultValue: "yes", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: true, inputType: "yesNo", possibleValues: "", notes: ""},
        display_for_promotion_only: {defaultValue: "false", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: false, inputType: "trueFalse", possibleValues: "", notes: ""},
        constrain_width_to_text_column: {defaultValue: "false", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: false, inputType: "trueFalse", possibleValues: "", notes: ""},
        scoop_publish_fields: {defaultValue: "true", includeInSettingsBlock: false, includeInConfigFile: true, useQuoteMarksInConfigFile: false, inputType: "trueFalse", possibleValues: "", notes: ""},
        scoop_asset_id: {defaultValue: "", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        scoop_username: {defaultValue: "", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        scoop_slug: {defaultValue: "", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        scoop_external_edit_key: {defaultValue: "", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""}
	};
} else if (scriptEnvironment == "dvz") {
    var ai2htmlBaseSettings = {
        ai2html_environment: {defaultValue: scriptEnvironment, includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        settings_version: {defaultValue: scriptVersion, includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        create_promo_image: {defaultValue: "yes", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        image_format: {defaultValue: ["png"], includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "array", possibleValues: "jpg, png, png24", notes: "Images will be generated in mulitple formats if multiple formats are listed, separated by commas. The first format will be used in the html. Sometimes this is useful to compare which format will have a smaller file size."},
        write_image_files: {defaultValue: "yes", includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: "Set this to “no” to skip writing the image files. Generally only use this after you have run the script once with this setting set to “yes.”"},
        responsiveness: {defaultValue: "dynamic", includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "fixed, dynamic", notes: "Dynamic responsiveness means ai graphics will scale to fill the container they are placed in."},
        max_width: {defaultValue: "", includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "integer", possibleValues: "", notes: "Blank or any positive number in pixels, but do not write “px” - blank means artboards will set max size, the max width is not included in the html stub, instead it is written to the config file so that the max width can be applied to the template’s container."},
        output: {defaultValue: "one-file", includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "one-file, multiple-files", notes: "One html file containing all the artboards or a separate html file for each artboard."},
        project_name: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: "Use this to set a custom project name. The project name is being used in output filenames, class names, etc."},
        html_output_path: {defaultValue: "../src/html/_ai2html/", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "folderPath", possibleValues: "", notes: "Allows user to change folder to write html files, path should be written relative to ai file location. This is ignored if the project_type in the yml is ai2html."},
        html_output_extension: {defaultValue: ".ai2html.html", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "fileExtension", possibleValues: "", notes: "This is ignored if the project_type in the yml is ai2html."},
        image_output_path: {defaultValue: "../../../src/img/", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "folderPath", possibleValues: "", notes: "This is where the image files get written to locally and should be written as if the html_output is the starting point."},
        image_source_path: {defaultValue: "img/", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "folderPath", possibleValues: "", notes: "Use this setting to specify from where the images are being loaded from the HTML file. Defaults to image_output_path"},
        create_config_file: {defaultValue: "false", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "trueFalse", possibleValues: "", notes: "This is ignored in env=nyt."},
        config_file_path: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "filePath", possibleValues: "", notes: "This only gets used to write the config file. It’s not used in the nyt mode to read the config.yml. Path should written relative to the ai file location."},
        local_preview_template: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "filePath", possibleValues: "", notes: ""},
        png_transparent: {defaultValue: "no", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        png_number_of_colors: {defaultValue: 128, includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "integer", possibleValues: "2 to 256", notes: ""},
        jpg_quality: {defaultValue: 60, includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "integer", possibleValues: "0 to 100", notes: ""},
        center_html_output: {defaultValue: "true", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: "Adds “margin:0 auto;” to the div containing the ai2html output."},
        use_2x_images_if_possible: {defaultValue: "always", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        use_lazy_loader: {defaultValue: "yes", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        include_resizer_css_js: {defaultValue: "yes", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        include_resizer_classes: {defaultValue: "yes", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        include_resizer_widths: {defaultValue: "yes", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: "If set to “yes”, ai2html adds data-min-width and data-max-width attributes to each artboard"},
        svg_embed_images: {defaultValue: "no", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        render_rotated_skewed_text_as: {defaultValue: "html", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "image, html", notes: ""},
        show_completion_dialog_box: {defaultValue: "true", includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: "Set this to “no” if you don't want to see the dialog box confirming completion of the script."},
        clickable_link: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: "If you put a url in this field, an <a> tag will be added, wrapping around the output and pointing to that url."},
        testing_mode: {defaultValue: "no", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        last_updated_text: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: ""},
        headline: {defaultValue: "", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: ""},
        leadin: {defaultValue: "", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: ""},
        summary: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: true, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: "Summary field for Scoop assets"},
        notes: {defaultValue: "", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: ""},
        sources: {defaultValue: "", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: ""},
        credit: {defaultValue: "By Bloomberg", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: ""},
        page_template: {defaultValue: "graphics", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        publish_system: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        environment: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        show_in_compatible_apps: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: true, inputType: "yesNo", possibleValues: "", notes: ""},
        display_for_promotion_only: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "trueFalse", possibleValues: "", notes: ""},
        constrain_width_to_text_column: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "trueFalse", possibleValues: "", notes: ""},
        scoop_publish_fields: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "trueFalse", possibleValues: "", notes: ""},
        scoop_asset_id: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        scoop_username: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        scoop_slug: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        scoop_external_edit_key: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""}
    };
} else {
	var ai2htmlBaseSettings = {
        ai2html_environment: {defaultValue: scriptEnvironment, includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        settings_version: {defaultValue: scriptVersion, includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        create_promo_image: {defaultValue: "no", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        image_format: {defaultValue: ["png"], includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "array", possibleValues: "jpg, png, png24", notes: "Images will be generated in mulitple formats if multiple formats are listed, separated by commas. The first format will be used in the html. Sometimes this is useful to compare which format will have a smaller file size."},
        write_image_files: {defaultValue: "yes", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: "Set this to “no” to skip writing the image files. Generally only use this after you have run the script once with this setting set to “yes.”"},
        responsiveness: {defaultValue: "fixed", includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "fixed, dynamic", notes: "Dynamic responsiveness means ai graphics will scale to fill the container they are placed in."},
        max_width: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "integer", possibleValues: "", notes: "Blank or any positive number in pixels, but do not write “px” - blank means artboards will set max size, the max width is not included in the html stub, instead it is written to the config file so that the max width can be applied to the template’s container."},
        output: {defaultValue: "one-file", includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "one-file, multiple-files", notes: "One html file containing all the artboards or a separate html file for each artboard."},
        project_name: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: "Use this to set a custom project name. The project name is being used in output filenames, class names, etc."},
        html_output_path: {defaultValue: "/ai2html-output/", includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "folderPath", possibleValues: "", notes: "Allows user to change folder to write html files, path should be written relative to ai file location. This is ignored if the project_type in the yml is ai2html."},
        html_output_extension: {defaultValue: ".html", includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "fileExtension", possibleValues: "", notes: "This is ignored if the project_type in the yml is ai2html."},
        image_output_path: {defaultValue: "", includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "folderPath", possibleValues: "", notes: "This is where the image files get written to locally and should be written as if the html_output is the starting point."},
        image_source_path: {defaultValue: null, includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "folderPath", possibleValues: "", notes: "Use this setting to specify from where the images are being loaded from the HTML file. Defaults to image_output_path"},
        create_config_file: {defaultValue: "false", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "trueFalse", possibleValues: "", notes: "This is ignored in env=nyt."},
        config_file_path: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "filePath", possibleValues: "", notes: "This only gets used to write the config file. It’s not used in the nyt mode to read the config.yml. Path should written relative to the ai file location."},
        local_preview_template: {defaultValue: "", includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "filePath", possibleValues: "", notes: ""},
        png_transparent: {defaultValue: "no", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        png_number_of_colors: {defaultValue: 128, includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "integer", possibleValues: "2 to 256", notes: ""},
        jpg_quality: {defaultValue: 60, includeInSettingsBlock: true, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "integer", possibleValues: "0 to 100", notes: ""},
        center_html_output: {defaultValue: "true", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: "Adds “margin:0 auto;” to the div containing the ai2html output."},
        use_2x_images_if_possible: {defaultValue: "yes", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        use_lazy_loader: {defaultValue: "no", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        include_resizer_css_js: {defaultValue: "no", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        include_resizer_classes: {defaultValue: "no", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        include_resizer_widths: {defaultValue: "yes", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: "If set to “yes”, ai2html adds data-min-width and data-max-width attributes to each artboard"},
        include_resizer_script: {defaultValue: "no", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        svg_embed_images: {defaultValue: "no", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        render_rotated_skewed_text_as: {defaultValue: "html", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "image, html", notes: ""},
        show_completion_dialog_box: {defaultValue: "yes", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: "Set this to “no” if you don't want to see the dialog box confirming completion of the script."},
        clickable_link: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: "If you put a url in this field, an <a> tag will be added, wrapping around the output and pointing to that url."},
        testing_mode: {defaultValue: "no", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "yesNo", possibleValues: "", notes: ""},
        last_updated_text: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: ""},
        headline: {defaultValue: "Ai Graphic Headline", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: ""},
        leadin: {defaultValue: "Introductory text here.", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: ""},
        summary: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: true, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: "Summary field for Scoop assets"},
        notes: {defaultValue: "Notes: Text goes here.", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: ""},
        sources: {defaultValue: "Source: Name goes here.", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: ""},
        credit: {defaultValue: "By ai2html", includeInSettingsBlock: true, includeInConfigFile: true, useQuoteMarksInConfigFile: true, inputType: "text", possibleValues: "", notes: ""},
        page_template: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        publish_system: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        environment: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        show_in_compatible_apps: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: true, inputType: "yesNo", possibleValues: "", notes: ""},
        display_for_promotion_only: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "trueFalse", possibleValues: "", notes: ""},
        constrain_width_to_text_column: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "trueFalse", possibleValues: "", notes: ""},
        scoop_publish_fields: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "trueFalse", possibleValues: "", notes: ""},
        scoop_asset_id: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        scoop_username: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        scoop_slug: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""},
        scoop_external_edit_key: {defaultValue: "", includeInSettingsBlock: false, includeInConfigFile: false, useQuoteMarksInConfigFile: false, inputType: "text", possibleValues: "", notes: ""}
	};
};
// End of ai2htmlBaseSettings block copied from Google Spreadsheet.


// ================================================
// constants
// ================================================

// Add to the fonts array to make the script work with your own custom fonts.
// To make it easier to add to this array, use the "fonts" worksheet of this Google Spreadsheet:
	// https://docs.google.com/spreadsheets/d/13ESQ9ktfkdzFq78FkWLGaZr2s3lNbv2cN25F2pYf5XM/edit?usp=sharing
	// Make a copy of the spreadsheet for yourself.
	// Modify the settings to taste.
var fonts = [
	{"aifont":"ArialMT","family":"arial,helvetica,sans-serif","weight":"","style":""},
	{"aifont":"Arial-BoldMT","family":"arial,helvetica,sans-serif","weight":"bold","style":""},
	{"aifont":"Arial-ItalicMT","family":"arial,helvetica,sans-serif","weight":"","style":"italic"},
	{"aifont":"Arial-BoldItalicMT","family":"arial,helvetica,sans-serif","weight":"bold","style":"italic"},
	{"aifont":"Georgia","family":"georgia,'times new roman',times,serif","weight":"","style":""},
	{"aifont":"Georgia-Bold","family":"georgia,'times new roman',times,serif","weight":"bold","style":""},
	{"aifont":"Georgia-Italic","family":"georgia,'times new roman',times,serif","weight":"","style":"italic"},
	{"aifont":"Georgia-BoldItalic","family":"georgia,'times new roman',times,serif","weight":"bold","style":"italic"},
        {"aifont":"BWHaasDot-75BoldFine","family":"BWHaasHead-25XThin,HaasText,helvetica,arial,sans-serif","weight":"","style":""},
        {"aifont":"BWHaasDot-75BoldCoarseReverse","family":"BWHaasDot-75BoldCoarseReverse,HaasText,helvetica,arial,sans-serif","weight":"","style":""},
        {"aifont":"BWHaasDot-75BoldFine","family":"BWHaasHead-25XThin,HaasText,helvetica,arial,sans-serif","weight":"","style":""},
        {"aifont":"BWHaasHead-25XThin","family":"BWHaasHead-25XThin,HaasText,helvetica,arial,sans-serif","weight":"","style":""},
        {"aifont":"BWHaasHead-26XThinItalic","family":"BWHaasHead-25XThin,HaasText,helvetica,arial,sans-serif","weight":"","style":"italic"},
        {"aifont":"BWHaasHead-55Roman","family":"BWHaasHead-55Roman,HaasText,helvetica,arial,sans-serif","weight":"","style":""},
        {"aifont":"BWHaasHead-56Italic","family":"BWHaasHead-56Italic,HaasText,helvetica,arial,sans-serif","weight":"","style":"italic"},
        {"aifont":"BWHaasHead-65Medium","family":"BWHaasHead-65Medium,HaasText,helvetica,arial,sans-serif","weight":"","style":""},
        {"aifont":"BWHaasHead-66MediumItalic","family":"BWHaasHead-66MediumItalic,HaasText,helvetica,arial,sans-serif","weight":"","style":"italic"},
        {"aifont":"BWHaasHead-75Bold","family":"BWHaasHead-75Bold,HaasText,helvetica,arial,sans-serif","weight":"","style":""},
        {"aifont":"BWHaasHead-76BoldItalic","family":"BWHaasHead-76BoldItalic,HaasText,helvetica,arial,sans-serif","weight":"","style":"italic"},
        {"aifont":"BWHaasHead-95Black","family":"BWHaasHead-95Black,HaasText,helvetica,arial,sans-serif","weight":"","style":""},
        {"aifont":"BWHaasHead-96BlackItalic","family":"BWHaasHead-95Black,HaasText,helvetica,arial,sans-serif","weight":"","style":"italic"},
        {"aifont":"BWHaasText-55Roman","family":"BWHaasText-55Roman,HaasText,helvetica,arial,sans-serif","weight":"","style":""},
        {"aifont":"BWHaasText-56Italic","family":"BWHaasText-56Italic,HaasText,helvetica,arial,sans-serif","weight":"","style":""},
        {"aifont":"BWHaasText-65Medium","family":"BWHaasText-65Medium,HaasText,helvetica,arial,sans-serif","weight":"","style":""},
        {"aifont":"BWHaasText-66MediumItalic","family":"BWHaasText-66MediumItalic,HaasText,helvetica,arial,sans-serif","weight":"","style":"italic"},
        {"aifont":"BWHaasText-75Bold","family":"BWHaasText-75Bold,HaasText,helvetica,arial,sans-serif","weight":"","style":""},
        {"aifont":"BWHaasText-76BoldItalic","family":"BWHaasText-76BoldItalic,HaasText,helvetica,arial,sans-serif","weight":"","style":"italic"},
        {"aifont":"TiemposHeadline-Bold","family":"'TiemposHead',Georgia,serif","weight":"","style":""},
        {"aifont":"TiemposHeadline-BoldItalic","family":"'TiemposHeadline-BoldItalic',Georgia,serif","weight":"","style":"italic"},
        {"aifont":"TiemposHeadline-Black","family":"'TiemposHeadline-Black',Georgia,serif","weight":"","style":""},
        {"aifont":"TiemposHeadline-BlackItalic","family":"'TiemposHeadline-Black',Georgia,serif","weight":"","style":"italic"},
        {"aifont":"TiemposText-Regular","family":"'TiemposText',Georgia,serif","weight":"400","style":""},
        {"aifont":"TiemposText-RegularItalic","family":"'TiemposText',Georgia,serif","weight":"400","style":"italic"},
        {"aifont":"TiemposText-Medium","family":"'TiemposText',Georgia,serif","weight":"","style":"400"},
        {"aifont":"TiemposText-MediumItalic","family":"'TiemposText',Georgia,serif","weight":"400","style":"italic"},
        {"aifont":"TiemposText-Semibold","family":"'TiemposText',Georgia,serif","weight":"600","style":""},
        {"aifont":"TiemposText-SemiboldItalic","family":"'TiemposText',Georgia,serif","weight":"600","style":"italic"},
        {"aifont":"TiemposText-Bold","family":"'TiemposHead',Georgia,serif","weight":"700","style":""},
        {"aifont":"TiemposText-BoldItalic","family":"'TiemposHead',Georgia,serif","weight":"700","style":"italic"},
        {"aifont":"BWDruk-BoldPoster","family":"BWDruk-BoldPoster","weight":"","style":""},
        {"aifont":"BWDruk-Heavy","family":"BWDruk-Heavy","weight":"","style":""},
        {"aifont":"BWDruk-Regular","family":"BWDruk-Regular","weight":"","style":""},
        {"aifont":"BWDruk-Super","family":"BWDruk-Super","weight":"","style":""},
        {"aifont":"BWDrukText-Super","family":"BWDruk-Super","weight":"","style":""},
        {"aifont":"BWDrukWide-Super","family":"BWDrukWide-Super","weight":"","style":""},
        {"aifont":"BWDrukXXCond-Super","family":"BWDrukXXCond-Super","weight":"","style":""},
        {"aifont":"BWDrukXXXCond-Super","family":"BWDrukXXXCond-Super","weight":"","style":""},
        {"aifont":"BWDrukXXXXCond-Super","family":"BWDrukXXXXCond-Super","weight":"","style":""},
        {"aifont":"BWHaasText","family":"BWHaasText-55Roman,HaasText,helvetica,arial,sans-serif","weight":"","style":""}
];

var caps = [
	{"ai":"FontCapsOption.NORMALCAPS","html":""},
	{"ai":"FontCapsOption.ALLCAPS","html":"uppercase"},
	{"ai":"FontCapsOption.SMALLCAPS","html":"uppercase"}
];
var align = [
	{"ai":"Justification.LEFT","html":""},
	{"ai":"Justification.RIGHT","html":"right"},
	{"ai":"Justification.CENTER","html":"center"},
	{"ai":"Justification.FULLJUSTIFY","html":"justify"},
	{"ai":"Justification.FULLJUSTIFYLASTLINELEFT","html":"justify"},
	{"ai":"Justification.FULLJUSTIFYLASTLINECENTER","html":"justify"},
	{"ai":"Justification.FULLJUSTIFYLASTLINERIGHT","html":"justify"}
];
var pStyleKeyTags = [
	"aifont",
	"size",
	"capitalization",
	"r",
	"g",
	"b",
	"tracking",
	"leading",
	"spacebefore",
	"spaceafter",
	"justification",
	"opacity"
];

// ================================================
// declarations
// ================================================

var d             = new Date();
var currYear      = d.getFullYear();
var currDate      = zeroPad(d.getDate(),2);
var currMonth     = zeroPad(d.getMonth() + 1,2); //Months are zero based
var currHour      = zeroPad(d.getHours(),2);
var currMin       = zeroPad(d.getMinutes(),2);
var dateTimeStamp = currYear + "-" + currMonth + "-" + currDate + " - " + currHour + ":" + currMin;

// user inputs, settings, etc
var defaultFamily       = "nyt-franklin,arial,helvetica,sans-serif";
var defaultWeight       = "";
var defaultStyle        = "";
var defaultSize         = 13;
var defaultLeading      = 18;
var nameSpace           = "g-";
var imageScale          = 200;
var maxJpgImageScaling  = 776.19; // This is specified in the Javascript Object Reference under ExportOptionsJPEG.
var pctPrecision        = 4;
var outputType          = "pct"; // "abs" or "pct"
// var promoImageMinWidth  = 768+40; // should be at least 768x507 AFTER being cropped, so we're making it extra large to get around this error
// var promoImageMinHeight = 507+40;
var promoImageMinWidth  = 3000;  // should be at least 768x507 AFTER being cropped, so we're making it extra large to get around Scoop error
var promoImageMinHeight = promoImageMinWidth*2/3;
var promoImageMaxWidth  = 6000;  // need to set a max width because ai jpg export fails if it's too large
var promoImageMaxHeight = promoImageMaxWidth*2/3;
// var settingsArrays      = ["image_format"] // put hash keys here for settings that are arrays -- in the illustrator file, the setting should be in the format "key: value,value,value"
var settingsFrames      = [];
var docSettings         = {};

// vars to hold warnings and informational messages at the end
var feedback  = [];
var warnings  = [];
var errors    = [];

// flags
// var docHasYml              = false;
var docHadSettingsBlock    = false;
var aiFileInPreviewProject = false;

var doc                    = app.activeDocument;
var docPath                = doc.path + "/";
// var origFilename           = doc.name;

var origFile               = new File (docPath + doc.name);
var parentFolder           = docPath.toString().match( /[^\/]+\/$/ );
var publicFolder           = new Folder( docPath + "../public/" );
var srcFolder              = new Folder( docPath + "../src/" );
var ymlFile                = new File( docPath + "../config.yml" );
var gitConfigFile          = new File( docPath + "../.git/config");
var alertText              = "";
if (scriptEnvironment=="nyt") {
	var alertHed               = "Actually, that’s not half bad.";
} else if (scriptEnvironment=="dvz") {
	var alertHed               = "Good job, you're the best.";
        defaultFamily              = "BWHaasText-55Roman,helvetica,sans-serif";
        nameSpace                  = "dvz-";
} else {
	var alertHed               = "Nice work!";

}
var textFramesToUnhide     = [];
var lockedObjects          = [];
var hiddenObjects		   = [];
var largestArtboardIndex;
var largestArtboardArea    = 0;
var largestArtboardWidth   = 0;
var	rgbBlackThreshold      = 36; // value between 0 and 255 lower than which if all three RGB values are below then force the RGB to #000 so it is a pure black

var pBar = new progressBar();
pBar.init();

// work on inlining responsive js and css
// var responsiveCssFile      = new File( docPath + "../public/assets/resizerStyle.css");
// var responsiveJsFile       = new File( docPath + "../public/assets/resizerScript.js");
// var responsiveJs = "\t<script>\n";
// responiveJs
// inputFile,starterText,linePrefix,lineSuffix
// readTextFileAndPutIntoAVariable


// loop thru all layers, groups and textframes to find locked objects and unlock them
unlockStuff(doc);

//unhide layers that where hidded so objects inside could be locked
for (var i = hiddenObjects.length-1; i>=0; i--) {
	hiddenObjects[i].visible = false;
};

// ================================================
// read .git/config file to get preview slug
// ================================================


if ( gitConfigFile.exists && scriptEnvironment=="nyt" ) {
	gitConfigFile.open("r");
	while(!gitConfigFile.eof) {
		var line      = gitConfigFile.readln();
		var lineArray = line.split("=");
		if (lineArray.length>1) {
			var gitConfigKey    = lineArray[0].replace( /^\s+/ , "" ).replace( /\s+$/ , "" );
			var gitConfigValue  = lineArray[1].replace( /^\s+/ , "" ).replace( /\s+$/ , "" );
			if ( gitConfigKey=="url" ) {
				docSettings.preview_slug = gitConfigValue.replace( /^[^:]+:/ , "" ).replace( /\.git$/ , "");
				// feedback.push("preview slug = " + docSettings.preview_slug);
			};
		};
	};
	gitConfigFile.close();
};


// ================================================
// read yml file if it exists to determine what type of project this is
// ================================================

var previewProjectType = "";
if ( ymlFile.exists && scriptEnvironment=="nyt"  ) {
	ymlFile.open("r");
	while(!ymlFile.eof) {
		var line      = ymlFile.readln();
		var lineArray = line.split(":");
		if (lineArray.length>1) {
			var ymlKey    = lineArray[0].replace( /^\s+/ , "" ).replace( /\s+$/ , "" );
			var ymlValue  = lineArray[1].replace( /^\s+/ , "" ).replace( /\s+$/ , "" );
			if ( ymlKey=="project_type" && ymlValue=="ai2html") {
				previewProjectType = ymlValue;
			};
			if ( ymlKey=="scoop_slug" ) {
				docSettings.scoop_slug_from_config_yml = ymlValue;
			};
		};
	};
	ymlFile.close();
} else {
	// if a config.yml file does not exist, then yml
	previewProjectType = "config.yml is missing";
};

// ================================================
// Transfer default values into docSettings object.
// Generate text for ai2html settings block and determine length.
// ================================================

var defaultSettingsText   = "ai2html-settings";
var ai2htmlSettingsLength = 0;
// var ymlSettings           = {};
for (setting in ai2htmlBaseSettings) {
	if (ai2htmlBaseSettings[setting].includeInSettingsBlock) {
		defaultSettingsText += "\r" + setting + ': ' + ai2htmlBaseSettings[setting].defaultValue;
		ai2htmlSettingsLength += 1;
	};
	// if (ai2htmlBaseSettings[setting].includeInConfigFile) {
	// 	ymlSettings[setting] = ai2htmlBaseSettings[setting].defaultValue;
	// };
	docSettings[setting] = ai2htmlBaseSettings[setting].defaultValue;
};

if (docSettings.project_name == "") {
	docSettings.project_name = doc.name.replace(/(.+)\.[aieps]+$/,"$1").replace(/ /g,"-");
} else {
	docSettings.project_name = makeKeyword(docSettings.project_name);
}

// ================================================
// determine which artboards get which show classes
// ================================================

var nyt5Breakpoints = [
	{ name:"xsmall"    , lowerLimit:   0, upperLimit: 180, artboards:[] },
	{ name:"small"     , lowerLimit: 180, upperLimit: 300, artboards:[] },
	{ name:"smallplus" , lowerLimit: 300, upperLimit: 460, artboards:[] },
	{ name:"submedium" , lowerLimit: 460, upperLimit: 600, artboards:[] },
	{ name:"medium"    , lowerLimit: 600, upperLimit: 720, artboards:[] },
	{ name:"large"     , lowerLimit: 720, upperLimit: 945, artboards:[] },
	{ name:"xlarge"    , lowerLimit: 945, upperLimit:1050, artboards:[] },
	{ name:"xxlarge"   , lowerLimit:1050, upperLimit:1600, artboards:[] }
];
var breakpoints        = {};
breakpoints.min        = "";
breakpoints.max        = "";
var artboardsToProcess = [];
var artboardsMaxMins   = [];
var artboardsLefts     = [];
var artboardsTops      = [];

var largestNyt5Breakpoint = 0;
for (var bpNumber = 0; bpNumber < nyt5Breakpoints.length; bpNumber++) {
	if (nyt5Breakpoints[bpNumber].upperLimit>largestNyt5Breakpoint) {
		largestNyt5Breakpoint = nyt5Breakpoints[bpNumber].upperLimit;
	};
};

// loop thru artboards and determine which ones to process.
// to manually force an artboard to appear at a specific pixel width,
// append the width to the end of the artboard name with a colon and then the number, eg. "Artboard name:720"
// old way of doing this: name that artboard with a "ai2html-" followed by the upperlimit of the breakpoint, eg. ai2html-720
pBar.setTitle('Determining artboards to process...')
for (var abNumber = 0; abNumber < doc.artboards.length; abNumber++) {
	if (doc.artboards[abNumber].name.search(/^-/)==-1) {
		artboardsToProcess.push(true);
		var artboardWidthMatch   = false;
		var currentArtboard      = doc.artboards[abNumber];
		var currentArtboardWidth = 0;

		// calculate artboard width for purposes of determining viewport -- need to make this into a function
		if (doc.artboards[abNumber].name.search(/^.+:\d+$/)!=-1) {
			currentArtboardWidth = (doc.artboards[abNumber].name.replace( /^.+:(\d+)$/ , "$1" ));
		} else if (doc.artboards[abNumber].name.search(/^ai2html-\d+$/)!=-1) {
			// this is the old way, supported for backward compatibility
			currentArtboardWidth = (doc.artboards[abNumber].name.replace( /^ai2html-(\d+)$/ , "$1" ));
		} else {
			currentArtboardWidth = Math.round(currentArtboard.artboardRect[2]-currentArtboard.artboardRect[0]);
		};
		// alert(abNumber + " = " + currentArtboardWidth);

		artboardsLefts.push(currentArtboard.artboardRect[0]);
		artboardsTops.push(currentArtboard.artboardRect[1]);
		for (var bpNumber = 0; bpNumber < nyt5Breakpoints.length; bpNumber++) {
			var currentBreakpointWidth = nyt5Breakpoints[bpNumber].upperLimit;
			if (currentBreakpointWidth==currentArtboardWidth) {
				artboardWidthMatch = true;
			};
		};
		if (!artboardWidthMatch && docSettings.include_resizer_classes=="yes" && docSettings.ai2html_environment=="nyt") {
			// warnings.push('The width of the artboard named "' + currentArtboard.name + '" (#' + (abNumber+1) + ") does not match any of the NYT5 breakpoints and may produce unexpected results on your web page. OurYou probably want to adjust the width of this artboard so that it is exactly the width of a breakpoint.");
			warnings.push('The width of the artboard named "' + currentArtboard.name + '" (#' + (abNumber+1) + ") does not match any of the NYT5 breakpoints and may produce unexpected results on your web page. The new script should be able to accommodate this, but please double check just in case.");
		}
	} else {
		artboardsToProcess.push(false);
	};
};

// figure out where is the top left of all artboards to place settings text block
artboardsLefts.sort(function(a,b){return a-b});
artboardsTops.sort(function(a,b){return a-b});
var artboardsLeft = artboardsLefts[0];
var artboardsTop  = artboardsTops[artboardsTops.length-1];

// assign artboards to their corresponding breakpoints -- can have more than one artboard per breakpoint.
// also figure out the min and max breakpoints that have artboards.
var breakpointsWithNoNativeArtboard = [];
var overrideArtboardWidth           = false;
var maxArtboardWidth                = 0;
pBar.setTitle('Assigning artboards to breakpoints...')
for (var bpNumber = 0; bpNumber < nyt5Breakpoints.length; bpNumber++) {
	var currentBreakpoint = nyt5Breakpoints[bpNumber];
	for (var abNumber = 0; abNumber < doc.artboards.length; abNumber++) {
		if (artboardsToProcess[abNumber]) {
			var currentArtboard = doc.artboards[abNumber];

			// calculate artboard width for purposes of determining viewport -- need to make this into a function
			// need to figure out what to do here if responsiveness==fixed
		// calculate artboard width for purposes of determining viewport -- need to make this into a function
			if (doc.artboards[abNumber].name.search(/^.+:\d+$/)!=-1) {
				currentArtboardWidth = (doc.artboards[abNumber].name.replace( /^.+:(\d+)$/ , "$1" ));
			} else if (doc.artboards[abNumber].name.search(/^ai2html-\d+$/)!=-1) {
				// this is the old way, supported for backward compatibility
				currentArtboardWidth = (doc.artboards[abNumber].name.replace( /^ai2html-(\d+)$/ , "$1" ));
			} else {
				currentArtboardWidth = Math.round(currentArtboard.artboardRect[2]-currentArtboard.artboardRect[0]);
			};
			if (currentArtboardWidth>maxArtboardWidth) {
				maxArtboardWidth = currentArtboardWidth;
			};
			if (currentArtboardWidth<=currentBreakpoint.upperLimit&&currentArtboardWidth>currentBreakpoint.lowerLimit) {
				currentBreakpoint.artboards.push(abNumber);
			};
		};
	};
	if (currentBreakpoint.artboards.length==0) {
		breakpointsWithNoNativeArtboard.push(currentBreakpoint.name);
	} else {
		if (breakpoints.min=="") {
			breakpoints.min = currentBreakpoint.upperLimit;
		};
		if (overrideArtboardWidth==false) {
			breakpoints.max = currentBreakpoint.upperLimit;
		} else {
			breakpoints.max = nyt5Breakpoints[nyt5Breakpoints.length-1].upperLimit;
		};
	};
};
var noNativeArtboardWarning = "These breakpoints have no native artboard: ";
for (var bpNumber = 0; bpNumber < breakpointsWithNoNativeArtboard.length; bpNumber++) {
	noNativeArtboardWarning += breakpointsWithNoNativeArtboard[bpNumber];
	if (bpNumber<breakpointsWithNoNativeArtboard.length-1) {
		noNativeArtboardWarning += ", ";
	};
};
// error message for breakpoints that have more than one native artboard
for (var bpNumber = 0; bpNumber < nyt5Breakpoints.length; bpNumber++) {
	var nyt5Breakpoint = nyt5Breakpoints[bpNumber];
	if (nyt5Breakpoint.artboards.length>1&&docSettings.ai2html_environment=="nyt") {
		warnings.push('The ' + nyt5Breakpoint.upperLimit + "px breakpoint has " + nyt5Breakpoint.artboards.length + " artboards. You probably want only one artboard per breakpoint.")
	}
};
//put artboard in for breakpoints with no artboard starting from smallest to largest, leaving lower end empty if nothing at the bottom end.
var breakpointsWithNoArtboard = [];
var noArtboard = false;
for (var bpNumber = 0; bpNumber < nyt5Breakpoints.length; bpNumber++) {
	var currentBreakpoint = nyt5Breakpoints[bpNumber];
	var previousArtboards = [];
	if (bpNumber>0) {
		previousArtboards = nyt5Breakpoints[bpNumber-1].artboards;
	};
	if (currentBreakpoint.artboards.length==0) {
		currentBreakpoint.artboards = previousArtboards;
	};
	if (currentBreakpoint.artboards.length==0) {
		breakpointsWithNoArtboard.push(currentBreakpoint.name);
	};
};

// ================================================
// add settings text block if one does not exist
// ================================================
pBar.setTitle('Processing settings text blocks...');
// check for settings text block
for (var tfNumber=0;tfNumber<doc.textFrames.length;tfNumber++) {
	var thisFrame = doc.textFrames[tfNumber];
	if ( thisFrame.contents!="" ) {
		if (thisFrame.paragraphs[0].contents=="ai2html-settings") {
			docHadSettingsBlock = true;
		};
	};
};
// create text settings block if one doesn't exist
if (!docHadSettingsBlock) {
	try {
		settingsTextLayer = doc.layers.getByName("ai2html-settings");
	} catch(e) {
		var settingsTextLayer   = doc.layers.add();
		settingsTextLayer.zOrder(ZOrderMethod.BRINGTOFRONT);
		settingsTextLayer.name  = "ai2html-settings";
	};
	var settingsTextSize       = 15;
	var settingsTextLeading    = 22;
	var settingsTextExtraLines = 6;
	var settingsTextWidth      = 400;
	var settingsTextHeight     = settingsTextLeading * (ai2htmlSettingsLength + settingsTextExtraLines);
	var settingsTextOffset     = 50;
	var settingsTextTop        = artboardsTop;
	var settingsTextLeft       = artboardsLeft-settingsTextWidth-settingsTextOffset;
	var settingsTextRectRef    = settingsTextLayer.pathItems.rectangle(settingsTextTop, settingsTextLeft, settingsTextWidth, settingsTextHeight);
	var settingsAreaTextRef    = settingsTextLayer.textFrames.areaText(settingsTextRectRef);
	settingsAreaTextRef.contents = defaultSettingsText;
	for (var c = 0; c < settingsAreaTextRef.characters.length; c++) {
		var currentChar        = settingsAreaTextRef.characters[c];
		currentChar.size       = settingsTextSize;
		currentChar.leading    = settingsTextLeading;
	};
};


// ================================================
// grab custom settings, html, css, js and text blocks
// ================================================

var customCss        = "\r\t<style type='text/css' media='screen,print'>\r",
	customJs         = "",
	customHtml       = "",
	customYml        = "",
	customCssBlocks  = 0,
	customHtmlBlocks = 0,
	customJsBlocks   = 0;

customYml += "ai2html_version: " + scriptVersion      + "\n";
customYml += "project_type: "    + previewProjectType + "\n";
customYml += "tags: ai2html\n";

for (var tfNumber=0;tfNumber<doc.textFrames.length;tfNumber++) {
	var thisFrame = doc.textFrames[tfNumber];
	if ( thisFrame.contents!="" ) {
		if (thisFrame.paragraphs[0].contents=="ai2html-css") {
			settingsFrames.push(thisFrame);
			hideTextFrame(thisFrame);
			customCssBlocks += 1;
			customCss += "\t\t/* Custom CSS block " + customCssBlocks + " */\r"
			for (var p=1; p < thisFrame.paragraphs.length; p++) {
				var paragraphContentIsValid = true;
				try {
					thisFrame.paragraphs[p].contents;
				} catch(e) {
					// alert(e);
					paragraphContentIsValid = false;
				};
				if (paragraphContentIsValid) {
					customCss += "\t\t" + cleanText(thisFrame.paragraphs[p].contents) + "\r";
				};
			};
		};
		if (thisFrame.paragraphs[0].contents=="ai2html-html") {
			settingsFrames.push(thisFrame);
			hideTextFrame(thisFrame);
			customHtmlBlocks += 1;
			customHtml += "\r\t<!-- Custom HTML block " + customHtmlBlocks + " -->\r"
			for (var p=1; p < thisFrame.paragraphs.length; p++) {
				var paragraphContentIsValid = true;
				try {
					thisFrame.paragraphs[p].contents;
				} catch(e) {
					// alert(e);
					paragraphContentIsValid = false;
				};
				if (paragraphContentIsValid) {
					customHtml += "\t" + cleanText(thisFrame.paragraphs[p].contents) + "\r";
				};
			};
		};
		if (thisFrame.paragraphs[0].contents=="ai2html-js") {
			settingsFrames.push(thisFrame);
			hideTextFrame(thisFrame);
			customJsBlocks += 1;
			customJs += "\r\t<!-- Custom JS block " + customJsBlocks + " -->\r"
			for (var p=1; p < thisFrame.paragraphs.length; p++) {
				var paragraphContentIsValid = true;
				try {
					thisFrame.paragraphs[p].contents;
				} catch(e) {
					// alert(e);
					paragraphContentIsValid = false;
				};
				if (paragraphContentIsValid) {
					customJs += "\t" + cleanText(thisFrame.paragraphs[p].contents) + "\r";
				};
			};
		};
		if (thisFrame.paragraphs[0].contents=="ai2html-settings" || thisFrame.paragraphs[0].contents=="ai2html-text") {
			settingsFrames.push(thisFrame);
			hideTextFrame(thisFrame);
			for (var p=1; p < thisFrame.paragraphs.length; p++) {
				var paragraphContentIsValid = true;
				try {
					thisFrame.paragraphs[p].contents;
				} catch(e) {
					// alert(e);
					paragraphContentIsValid = false;
				};
				if (paragraphContentIsValid) {
					var thisParagraph    = thisFrame.paragraphs[p].contents;
					var hashKey          = thisParagraph.replace( /^[ \t]*([^ \t:]*)[ \t]*:(.*)$/ , "$1" );
					var hashValue        = thisParagraph.replace( /^[ \t]*([^ \t:]*)[ \t]*:(.*)$/ , "$2" );
					hashKey              = hashKey.replace( /^\s+/ , "" ).replace( /\s+$/ , "" );
					hashValue            = hashValue.replace( /^\s+/ , "" ).replace( /\s+$/ , "" );
					hashValue            = straightenCurlyQuotesInsideAngleBrackets(hashValue);
					// replace values from old versions of script with current values
					if (hashKey=="output" && hashValue=="one-file-for-all-artboards") { hashValue="one-file"; };
					if (hashKey=="output" && hashValue=="one-file-per-artboard")      { hashValue="multiple-files"; };
					if (hashKey=="output" && hashValue=="preview-one-file")           { hashValue="one-file"; };
					if (hashKey=="output" && hashValue=="preview-multiple-files")     { hashValue="multiple-files"; };
					// handle stuff that goes in config file and other exceptions, like array values
					if (hashKey in ai2htmlBaseSettings && ai2htmlBaseSettings[hashKey].includeInConfigFile) {
						hashValue     = (hashValue.replace( /(["])/g , '\\$1' )); // add stuff to ["] for chars that need to be esc in yml file
					} else {
						if (hashKey in ai2htmlBaseSettings && ai2htmlBaseSettings[hashKey].inputType=="array") {
							hashValue = hashValue.replace( /[\s,]+/g , ',' );
							if (hashValue.length==0) {
								hashValue = []; // have to do this because .split always returns an array of length at least 1 even if it's splitting an emptry string
							} else {
								hashValue = hashValue.split(",");
							};
						};
					};
					docSettings[hashKey] = hashValue;
				};
			};
		};
	};
};

customYml += "min_width: "       + breakpoints.min    + "\n";
if (docSettings.max_width!="") {
	customYml += "max_width: " + docSettings.max_width + "\n";
} else if (docSettings.responsiveness!="fixed"&&docSettings.ai2html_environment=="nyt") {
	customYml += "max_width: " + largestNyt5Breakpoint + "\n";
} else if (docSettings.responsiveness!="fixed"&&docSettings.ai2html_environment!="nyt") {
	// don't write a max_width setting as there should be no max width in this case
} else {
	// this is the case of fixed responsiveness
	// customYml += "max_width: " + breakpoints.max + "\n";
	customYml += "max_width: " + maxArtboardWidth + "\n";
};

// write out remaining values for config file
for (setting in docSettings) {
	if (setting in ai2htmlBaseSettings && ai2htmlBaseSettings[setting].includeInConfigFile) {
		var quoteMark = "";
		if (ai2htmlBaseSettings[setting].useQuoteMarksInConfigFile) { quoteMark = '"'; };
		customYml    += setting + ': ' + quoteMark + docSettings[setting] + quoteMark + "\n";
	};
}

customCss  += "\t</style>\r";
customJs   += "\r";
customHtml += "\r";

var imageExtension = ".png";
if (docSettings.image_format.length>0) {
	imageExtension = "." + docSettings.image_format[0].substring(0,3);
};

// ================================================
// validate settings
// ================================================

if (docSettings.max_width!=""&&docSettings.ai2html_environment=="nyt") {
	var max_width_is_valid = false;
	for (var bpNumber = 0; bpNumber < nyt5Breakpoints.length; bpNumber++) {
		if (docSettings.max_width==nyt5Breakpoints[bpNumber].upperLimit.toString()) {
			max_width_is_valid = true;
		};
	};
	if (!max_width_is_valid) {
		errors.push('The max_width setting of "' + docSettings.max_width + '" is not a valid breakpoint and will create an error when you "preview publish."');
	};
};

// ================================================
// reset the output path and extension if the previewProjectType is ai2html and fix other path issues
// ================================================

if (previewProjectType=="ai2html") {
	docSettings.html_output_path      = "/../public/";
	docSettings.html_output_extension = ".html";
	docSettings.image_output_path     = "_assets/";
};
docSettings.preview_image_path = "_assets/";

if (docSettings.image_source_path === null) {
	// fall back to image output path
	docSettings.image_source_path = docSettings.image_output_path;
}

// ================================================
// check for things that should/could prevent the script from running, otherwise proceed
// ================================================

// check for ai2html and preview project folders
if (parentFolder === null) {
	alertHed = "The Script Stopped Because of an Error";
	errors.push('You need to save your Illustrator file before running this script');
} else if ( parentFolder[0]==="ai/" && publicFolder.exists ) {
	aiFileInPreviewProject = true;
	// alert("ai file is in a preview project");
};
if (doc.documentColorSpace!="DocumentColorSpace.RGB") {
	alertHed = "The Script Stopped Because of an Error";
	errors.push('Convert document color mode to "RGB" before running script. (File>Document Color Mode>RGB Color)' );
} else if (!docHadSettingsBlock && docSettings.ai2html_environment=="nyt") {
	alertHed = "Settings Text Block Added";
	feedback.push("A settings text block was created to the left of all your artboards. Fill out the settings to link your project to the Scoop asset.");
} else if (
		(
			(previewProjectType=="config.yml is missing") ||
			(previewProjectType=="ai2html" && !publicFolder.exists) ||
			((previewProjectType!="ai2html" && previewProjectType!="config.yml is missing") && !srcFolder.exists)
		) && docSettings.ai2html_environment=="nyt"
    ){
		alertHed = "The Script Stopped Because of an Error";
		errors.push("Make sure your Illustrator file is inside the “ai” folder of a Preview project.");
		errors.push("If the Illustrator file is in the correct folder, your Preview project may be missing a config.yml file or a “public” or a “src” folder.");
		errors.push("If this is an ai2html project, it is probably easier to just create a new ai2html Preview project and move this Illustrator file into the “ai” folder inside the project.");
} else {

	// ======================================
	// main stuff
	// ======================================

	if (!docHadSettingsBlock && docSettings.ai2html_environment!="nyt") {
		feedback.push("A settings text block was created to the left of all your artboards. You can use it to customize your output.");
	};

	// process local preview template if appropriate
	if (docSettings.local_preview_template!="") {
		var localPreviewTemplateFile = new File(docPath + docSettings.local_preview_template);
		var localPreviewTemplateText = readTextFileAndPutIntoAVariable(localPreviewTemplateFile,"","","\n");
	};

	var uniqueArtboardWidths = [];
	if (docSettings.include_resizer_widths == "yes") {
		// measure breakpoints based on artboard widths
		for (var abNumber = 0; abNumber < doc.artboards.length; abNumber++) {
			if (artboardsToProcess[abNumber]) {
				var abRect = doc.artboards[abNumber].artboardRect,
					abW = Math.round(abRect[2]-abRect[0]),
					customMinWidth = doc.artboards[abNumber].name.split(':')[1];
				if (customMinWidth) abW = Math.round(+customMinWidth);
				if (uniqueArtboardWidths.indexOf(abW) < 0) uniqueArtboardWidths.push(abW);
			}
		}
		uniqueArtboardWidths.sort(function(a,b){return a-b;});
	}

	// begin main stuff
	var responsiveHtml = "";
	for (var abNumber = 0; abNumber < doc.artboards.length; abNumber++) {
		if (artboardsToProcess[abNumber]) {
			doc.artboards.setActiveArtboardIndex(abNumber);
			var activeArtboard      =  doc.artboards[abNumber];
			docSettings.docName     =  makeKeyword(docSettings.project_name);
			var artboardName        =  makeKeyword(activeArtboard.name.replace( /^(.+):\d+$/ , "$1"));
			// var docArtboardName     =  makeKeyword(docSettings.project_name) + "-" + artboardName + "-" + abNumber;
			var docArtboardName     =  docSettings.docName + "-" + artboardName;
			var activeArtboardRect  =  activeArtboard.artboardRect;
			var abX                 =  activeArtboardRect[0];
			var abY                 = -activeArtboardRect[1];
			var abW                 =  Math.round(activeArtboardRect[2]-abX);
			var abH                 = -activeArtboardRect[3]-abY;
			var artboardAspectRatio =  abH/abW;

			pBar.setTitle(docArtboardName + ': Starting to generate HTML...');
			pBar.setProgress(abNumber/(doc.artboards.length));

			// for determining which artboard to use for promo image
			// if (abW>=largestArtboardWidth) {
				if (abW*abH>largestArtboardArea) {
					largestArtboardArea  = abW*abH;
					// largestArtboardWidth = abW;
					largestArtboardIndex = abNumber;
				};
			// };

			var html = [];
			var numHtmlStrands   = 12;
			for (var i=0;i<numHtmlStrands;i++) {html[i] = "";};

			// css is in html[2]
			// user-custom css is in html[3]
			// html is in html[6]
			// user-custom html is in html[7]
			// user-custom js is in html[9]
			// typekit is in html[10]

			html[0] += "Cut and paste into Scoop\r";

			html[1] += "\r\t<!-- Artboard: " + artboardName + " -->\r"

			var showClass = "";

			for (var bpNumber = 0; bpNumber < nyt5Breakpoints.length; bpNumber++) {
				var nyt5Breakpoint = nyt5Breakpoints[bpNumber];
				for (var bpArtboardNumber = 0; bpArtboardNumber < nyt5Breakpoint.artboards.length; bpArtboardNumber++) {
					var bpArtboard = nyt5Breakpoint.artboards[bpArtboardNumber];
					if (abNumber==bpArtboard) {
						showClass += (showClass.length>0) ? " ":"";
						showClass += "g-show-" + nyt5Breakpoint.name;
					}
				}
			}

			if (docSettings.include_resizer_classes=="no") {
				showClass = "";
			}

			html[1] += "\t<div id='"+nameSpace+docArtboardName+"' class='"+nameSpace+"artboard "+nameSpace+"artboard-v3 "+showClass+"'";
			if (docSettings.include_resizer_widths == "yes") {
				// add data-min/max-width attributes
				// find breakpoints
				for (var bpIndex = 1; bpIndex < uniqueArtboardWidths.length; bpIndex++) {
					if (abW < uniqueArtboardWidths[bpIndex]) break;
				}
				html[1] += " data-min-width='"+uniqueArtboardWidths[bpIndex-1]+"'";
				if (bpIndex < uniqueArtboardWidths.length) {
					html[1] += " data-max-width='"+(uniqueArtboardWidths[bpIndex]-1)+"'";
				}
			}
			html[1] += ">\r";
			html[1] += "\t\t<style type='text/css' media='screen,print'>\r";
			html[1] += "\t\t\t#"+nameSpace+docArtboardName+"{\r";
			html[1] += "\t\t\t\tposition:relative;\r";
			html[1] += "\t\t\t\toverflow:hidden;\r";
			if (docSettings.responsiveness=="fixed") {
				html[1] += "\t\t\t\twidth:"  + Math.round(abW) + "px;\r";
			};
			// if (docSettings.max_width!="") {
			// 	html[1] += "\t\t\t\tmax-width:"  + Math.round(docSettings.max_width) + "px;\r";
			// };
			html[1] += "\t\t\t}\r";
			html[1] += "\t\t\t."+nameSpace+"aiAbs{\r";
			html[1] += "\t\t\t\tposition:absolute;\r";
			html[1] += "\t\t\t}\r";
			html[1] += "\t\t\t."+nameSpace+"aiImg{\r";
			html[1] += "\t\t\t\tdisplay:block;\r";
			html[1] += "\t\t\t\twidth:100% !important;\r";
			html[1] += "\t\t\t}\r";
			html[1] += "\t\t\t#"+nameSpace+docArtboardName+" p{\r";
			html[1] += "\t\t\t\tfont-family:" + defaultFamily + ";\r";
			html[1] += "\t\t\t\tfont-size:" + defaultSize + "px;\r";
			html[1] += "\t\t\t\tline-height:" + defaultLeading + "px;\r";
			if (docSettings.testing_mode=="yes") {
				html[1] += "\t\t\t\tcolor: rgba(209, 0, 0, 0.5) !important;\r";
			};
			html[1] += "\t\t\t\tmargin:0;\r";
			html[1] += "\t\t\t}\r";

			html[4] += "\t\t</style>\r";
			html[4] += "\t\t<div id='"+nameSpace+docArtboardName+"-graphic'>\r";

			if (outputType=="abs") {
				// this option appears to not really be needed
				html[5] += "\t\t\t<img id='" +nameSpace+"ai"+abNumber+"-0'\r";
				html[5] += "\t\t\t\tclass='" +nameSpace+"aiAbs "+nameSpace+"aiImg'\r";
				if (docSettings.ai2html_environment=="nyt") {
					html[5] += "\t\t\t\tsrc='"   + docSettings.preview_image_path + docArtboardName + imageExtension + "'\r";
				} else {
					html[5] += "\t\t\t\tsrc='"   + docSettings.image_source_path + docArtboardName + imageExtension + "'\r";
				};
				html[5] += "\t\t\t\twidth="  + Math.round(abW) + "\r";
				html[5] += "\t\t\t\theight=" + Math.round(abH) + "\r";
				html[5] += "\t\t\t\t/>\r";
			} else if (outputType=="pct") {
				// this is the default option which seems to work with both fixed and dynamic responsiveness
				html[5] += "\t\t\t<img id='" +nameSpace+"ai"+abNumber+"-0'\r";
				html[5] += "\t\t\t\tclass='" +nameSpace+"aiImg'\r";
				// html[5] += "\t\t\t\tstyle='width:100% !important;'\r";
				if (docSettings.use_lazy_loader=="no") {
					if (docSettings.ai2html_environment=="nyt") {
						html[5] += "\t\t\t\tsrc='"   + docSettings.preview_image_path + docArtboardName + imageExtension + "'\r";
					} else {
						html[5] += "\t\t\t\tsrc='"   + docSettings.image_source_path + docArtboardName + imageExtension + "'\r";
					};
				} else {
                    html[5] += "\t\t\t\tsrc='data:image/gif;base64,R0lGODlhCgAKAIAAAB8fHwAAACH5BAEAAAAALAAAAAAKAAoAAAIIhI+py+0PYysAOw=='\r"; // dummy image to hold space while image loads
					if (docSettings.ai2html_environment=="nyt") {
	                    html[5] += "\t\t\t\tdata-src='"   + docSettings.preview_image_path + docArtboardName + imageExtension + "'\r";
					} else {
	                    html[5] += "\t\t\t\tdata-src='"   + docSettings.image_source_path + docArtboardName + imageExtension + "'\r";
					};
                    html[5] += "\t\t\t\tdata-height-multiplier='" + roundTo(artboardAspectRatio,4) + "'\r";
				};
				html[5] += "\t\t\t\t/>\r";
			};

			html[8]  += "\t\t</div>\r"; // closing the nameSpace+docArtboardName div
			html[11] += "\t</div>\r";

			var docFrames     = doc.textFrames;
			var selectFrames  = [];

			for (var i=0;i<docFrames.length;i++) {
				var thisFrame = docFrames[i];

				var visibleLeft   =  thisFrame.visibleBounds[0];
				var visibleTop    = -thisFrame.visibleBounds[1];
				var visibleRight  =  thisFrame.visibleBounds[2];
				var visibleBottom = -thisFrame.visibleBounds[3];

				var abLeft   =  activeArtboardRect[0];
				var abTop    = -activeArtboardRect[1];
				var abRight  =  activeArtboardRect[2];
				var abBottom = -activeArtboardRect[3];

				var frameIsHidden = thisFrame.hidden;
				var frameIsHiddenAlert = thisFrame.contents;
				frameIsHiddenAlert += "\n" + thisFrame.typename + " = " + thisFrame.hidden;

				// traverse all parent objects to determine if any of them are hidden or locked
				if (!frameIsHidden) {
					var objectParent = thisFrame.parent;
					while (objectParent.typename!="Document") {
						if (objectParent.typename=="Layer") {
							frameIsHiddenAlert += "\n" + objectParent.typename + " = " + !objectParent.visible;
							if (!objectParent.visible) {
								frameIsHidden = true;
							};
							objectParent = objectParent.parent;
						} else {
							frameIsHiddenAlert += "\n" + objectParent.typename + " = " + objectParent.hidden;
							if (objectParent.hidden) {
								frameIsHidden = true;
							};
							objectParent = objectParent.parent;
						};
					};
				};

				var frameInBounds = false;

				if (
					(
						(visibleLeft>=abLeft && visibleLeft<=abRight) ||
						(visibleRight>=abLeft && visibleRight<=abRight) ||
						(visibleLeft<=abLeft && visibleRight>=abRight)
					) && (
						(visibleTop>=abTop && visibleTop<=abBottom) ||
						(visibleBottom>=abTop && visibleBottom<=abBottom) ||
						(visibleTop<=abTop && visibleBottom>=abBottom)
					)
				) {
					frameInBounds=true;
				};

				if (
					// reasons to include text for processing
					frameInBounds &&
					!frameIsHidden&&
					// !thisFrame.hidden &&
					thisFrame.contents!="" &&
					(
						docSettings.render_rotated_skewed_text_as=="html" ||
						(
							docSettings.render_rotated_skewed_text_as=="image" &&
							!textIsTransformed(thisFrame)
						)
					) &&
					(thisFrame.kind=="TextType.AREATEXT" || thisFrame.kind=="TextType.POINTTEXT")
				) {
					selectFrames.push(thisFrame);
				};
			};

			// Sort the selectFrames array top to bottom, left to right.
			selectFrames.sort(
			    firstBy(function (v1, v2) { return v2.top  - v1.top ; })
			    .thenBy(function (v1, v2) { return v1.left - v2.left; })
			);

			// Find unique character and paragraph styles
			// Style keys for paragraphs are the character style of the last paragraph.
			var pStyleKeys = [];
			var cStyleKeys = [];

			var pFamily    = [];
			var pWeight    = [];
			var pStyle     = [];
			var pSize      = [];
			var pLeading   = [];

			pBar.setTitle(docArtboardName + ': Finding unique text styles...');
			for (var i=0;i<selectFrames.length;i++) {
				var thisFrame = selectFrames[i];
				var numChars = thisFrame.characters.length;
				var runningChars = 0;
				var b = "\t"
				for (var k=0;k<thisFrame.paragraphs.length;k++) {
					if (runningChars<numChars && thisFrame.paragraphs[k].characters.length!=0) {
						// var sampleChar = thisFrame.paragraphs[k].length-1;
						var sampleChar = Math.round(thisFrame.paragraphs[k].length/2)-1;
						var pStyleKey = "";
						pStyleKey += thisFrame.paragraphs[k].characters[sampleChar].textFont.name;
						pStyleKey += b + Math.round(thisFrame.paragraphs[k].characters[sampleChar].size);
						pStyleKey += b + thisFrame.paragraphs[k].characters[sampleChar].capitalization;

						if (thisFrame.paragraphs[k].characters[sampleChar].fillColor.typename=="GrayColor") {
							var grayPct = selectFrames[i].characters[k].fillColor.gray;
							var rgbPct   = (100-grayPct)/100*255;
							var redOut   = rgbPct;
							var greenOut = rgbPct;
							var blueOut  = rgbPct;
						} else if (thisFrame.paragraphs[k].characters[sampleChar].fillColor.typename=="RGBColor") {
							var redOut   = thisFrame.paragraphs[k].characters[sampleChar].fillColor.red;
							var greenOut = thisFrame.paragraphs[k].characters[sampleChar].fillColor.green;
							var blueOut  = thisFrame.paragraphs[k].characters[sampleChar].fillColor.blue;
							if (redOut  <rgbBlackThreshold&&
								greenOut<rgbBlackThreshold&&
								blueOut <rgbBlackThreshold) {
								redOut   = 0;
								greenOut = 0;
								blueOut  = 0;
							};
						} else if (thisFrame.paragraphs[k].characters[sampleChar].fillColor.typename=="NoColor") {
							var redOut   = 0;
							var greenOut = 255;
							var blueOut  = 0;
							warnings.push("This text has no fill. Please fill it with an RGB color. It has been filled with green. Text: “" + thisFrame.paragraphs[k].contents + "”");
						} else {
							var redOut   = 0;
							var greenOut = 0;
							var blueOut  = 0;
							warnings.push("This text is filled with a non-RGB color. Please fill it with an RGB color. Text: “" + thisFrame.paragraphs[k].contents + "”");
						};
						pStyleKey += b + redOut.toString(16);
						pStyleKey += b + greenOut.toString(16);
						pStyleKey += b + blueOut.toString(16);

						pStyleKey += b + thisFrame.paragraphs[k].characters[sampleChar].tracking;
						pStyleKey += b + Math.round(thisFrame.paragraphs[k].leading);
						pStyleKey += b + Math.round(thisFrame.paragraphs[k].spaceBefore);
						pStyleKey += b + Math.round(thisFrame.paragraphs[k].spaceAfter);
						pStyleKey += b + thisFrame.paragraphs[k].justification;
						pStyleKey += b + Math.round(thisFrame.opacity);
						pStyleKeys.push(pStyleKey);
						runningChars += (thisFrame.paragraphs[k].characters.length)+1;
					} else {
						runningChars += 1;
					};
				};
			};
			pStyleKeys = pStyleKeys.findUniqueValues();

			// Write css for each style key
			var pStyleCss = "";
			// var cStyleCss = "";
			pBar.setTitle(docArtboardName + ': Writing CSS for text styles...');
			for (var i=0;i<pStyleKeys.length;i++) {
				var thisKey = pStyleKeys[i];
				var pArray = thisKey.split("\t");
				var pHash  = {};
				for (var j=0;j<pStyleKeyTags.length;j++) {
					var thisTag = pStyleKeyTags[j];
					pHash[thisTag] = pArray[j];
					if (thisTag=="size"||thisTag=="leading"||thisTag=="spacebefore"||thisTag=="spaceafter") {
						pHash[thisTag] = Math.round(pHash[thisTag]);
					};
					if (thisTag=="aifont") {
						pHash['family'] = defaultFamily;
						pHash['weight'] = defaultWeight;
						pHash['style']  = defaultStyle;
						for (var k=0;k<fonts.length;k++) {
							if (pHash['aifont']==fonts[k]['aifont']) {
								pHash['family'] = fonts[k]['family'];
								pHash['weight'] = fonts[k]['weight'];
								pHash['style']  = fonts[k]['style'];
							};
						};
						// check for franklin or cheltenham
						// for (var tempFamily in nytFonts) {
						// 	for (var fontNo = 0; fontNo < nytFonts[tempFamily].fontList.length; fontNo++) {
						// 		var tempFont = nytFonts[tempFamily].fontList[fontNo];
						// 		if (tempFont === pHash['aifont']) { nytFonts[tempFamily].inDoc = true; };
						// 	};
						// };
					};
					if (thisTag=="r"||thisTag=="g"||thisTag=="b") {
						if (pHash[thisTag].length==1) { pHash[thisTag] = "0"+pHash[thisTag] };
					};
					if (thisTag=="capitalization") {
						for (var k=0;k<caps.length;k++) {
							if (pHash['capitalization']==caps[k]['ai']) {
								pHash['capitalization'] =caps[k]['html'];
							};
						};
					};
					if (thisTag=="justification") {
						for (var k=0;k<align.length;k++) {
							if (pHash['justification']==align[k]['ai']) {
								pHash['justification'] =align[k]['html'];
							};
						};
					};
					if (thisTag=="tracking") {
						// pHash['tracking'] = pHash['tracking']/1000;
						pHash['tracking'] = pHash['tracking']/1200;
					};
					if (thisTag=="opacity") {
						pHash['opacity'] = pHash['opacity']/100;
					};
				};
				pStyleCss += "\t\t\t#"+nameSpace+docArtboardName+" ."+nameSpace+"aiPstyle" + i + " {\r";
				if (pHash['family']!=defaultFamily) { pStyleCss += "\t\t\t\tfont-family:" + pHash['family'] + ";\r"; };
				if (pHash['size']!=defaultSize) { pStyleCss += "\t\t\t\tfont-size:" + pHash['size'] + "px;\r"; };
				if (pHash['leading']!=defaultLeading) { pStyleCss += "\t\t\t\tline-height:" + pHash['leading'] + "px;\r"; };
				if (pHash['weight']!="") { pStyleCss += "\t\t\t\tfont-weight:" + pHash['weight'] + ";\r"; };
				if (pHash['style']!="" ) { pStyleCss += "\t\t\t\tfont-style:" + pHash['style'] + ";\r"; };
				if (pHash['capitalization']!="" ) { pStyleCss += "\t\t\t\ttext-transform:" + pHash['capitalization'] + ";\r"; };
				if (pHash['justification']!="" ) { pStyleCss += "\t\t\t\ttext-align:" + pHash['justification'] + ";\r"; };
				if (pHash['spacebefore']>0 ) { pStyleCss += "\t\t\t\tpadding-top:" + pHash['spacebefore'] + "px;\r"; };
				if (pHash['spaceafter']>0 ) { pStyleCss += "\t\t\t\tpadding-bottom:" + pHash['spaceafter'] + "px;\r"; };
				if (pHash['tracking']!=0 ) { pStyleCss += "\t\t\t\tletter-spacing:" + pHash['tracking'] + "em;\r"; };
				if (pHash['opacity']!=1.0 ) { pStyleCss += "\t\t\t\tfilter: alpha(opacity=" + (pHash['opacity']*100) + ");\r"; };
				if (pHash['opacity']!=1.0 ) { pStyleCss += "\t\t\t\t-ms-filter:'progid:DXImageTransform.Microsoft.Alpha(Opacity=" + (pHash['opacity']*100) + ")';\r"; };
				if (pHash['opacity']!=1.0 ) { pStyleCss += "\t\t\t\topacity:" + pHash['opacity'] + ";\r"; };
				pStyleCss += "\t\t\t\tcolor:#" + pHash['r'] + pHash['g'] + pHash['b'] + ";\r";
				pStyleCss += "\t\t\t}\r";
			};

			html[2] += pStyleCss;

			html[2] += '\t\t\t.g-aiPtransformed p { white-space: nowrap; }\r';

			// Output html for each text frame
			pBar.setTitle(docArtboardName + ': Writing HTML for text blocks...');
			var oneArtboard = 1/(doc.artboards.length),
					oneBlock    = 1/(selectFrames.length),
					oneBlockNormalized = oneBlock * oneArtboard;

			for (var i=0;i<selectFrames.length;i++) {
				pBar.increment(oneBlockNormalized); // Keeps text frames progress from overshooting current overall progress.
				var thisFrame = selectFrames[i];
				var vFactor = .5; // This is an adjustment to correct for vertical placement.
				var thisFrameAttributes = {};

				// Read in attribute variables from notes field for this text frame
				var rawNotes = thisFrame.note;
				// alert("note = " + rawNotes);
				rawNotes = rawNotes.split("\r");
				for (var rNo = 0; rNo < rawNotes.length; rNo++) {
					var rn = rawNotes[rNo];
					var rnKey   = rn.replace( /^[ \t]*([^ \t:]*)[ \t]*:(.*)$/ , "$1" );
					var rnValue = rn.replace( /^[ \t]*([^ \t:]*)[ \t]*:(.*)$/ , "$2" );
					rnKey       = rnKey.replace( /^\s+/ , "" ).replace( /\s+$/ , "" );
					rnValue     = rnValue.replace( /^\s+/ , "" ).replace( /\s+$/ , "" );
					thisFrameAttributes[rnKey] = rnValue;
				};


				var kind, htmlX, htmlY, htmlT, htmlB, htmlTM, htmlH, htmlL, htmlR, htmlW, htmlLM, alignment, extraWidthPct;
				var centerBuffer = 30; // additional width on left and right sides for center aligned point text in percent of ai width

				if (thisFrame.kind=="TextType.POINTTEXT") {
					kind = "point";
					// /this line throws an error if the first paragraph of the frame is empty.
					// var htmlY = Math.round(-thisFrame.position[1] - (((thisFrame.paragraphs[0].characters[0].leading - thisFrame.paragraphs[0].characters[0].size)*vFactor) + thisFrame.paragraphs[0].spaceBefore)-abY);
					htmlY = Math.round(-thisFrame.position[1] - (((thisFrame.characters[0].leading - thisFrame.characters[0].size)*vFactor) + thisFrame.characters[0].spaceBefore)-abY);
				} else if (thisFrame.kind=="TextType.AREATEXT") {
					kind = "area";
					// var htmlY = Math.round(-thisFrame.position[1] - (((thisFrame.paragraphs[0].characters[0].leading - thisFrame.paragraphs[0].characters[0].size)*vFactor) + thisFrame.paragraphs[0].spaceBefore)-abY);
					htmlY = Math.round(-thisFrame.position[1] - (((thisFrame.characters[0].leading - thisFrame.characters[0].size)*vFactor) + thisFrame.characters[0].spaceBefore)-abY);
				} else {
					kind = "other";
				};
				htmlH = Math.round(thisFrame.height);
				if (thisFrameAttributes.valign==="bottom") {
					htmlB = htmlY + thisFrame.height;
				// } else if (thisFrameAttributes.valign==="center") {
				// 	htmlT  = htmlY+(thisFrame.height/2);
				// 	htmlTM = thisFrame.height*(1/2*-1);
				} else {
					htmlT = htmlY;
				};

				// additional width for box to allow for slight variations in font widths
				if (kind=="area") {
					extraWidthPct = 0; // was 3 percent -- but need to account for when it hits the edge of the box since we are now overflow hidden
				} else {
					extraWidthPct = 100;
				};
				htmlW = thisFrame.width*(1+(extraWidthPct/100));
				if (thisFrame.characters[0].justification=="Justification.LEFT") {
					alignment = "left";
					// htmlX = thisFrame.left-abX;
					htmlL = thisFrame.left-abX;
					htmlR = abW-(thisFrame.left+htmlW-abX);
				} else if (thisFrame.characters[0].justification=="Justification.RIGHT") {
					alignment = "right";
					// htmlX = abW-(thisFrame.left+thisFrame.width-abX);
					htmlL = thisFrame.left-(thisFrame.width*(1+(extraWidthPct/100)))-abX;
					htmlR = abW-(thisFrame.left+thisFrame.width-abX);
				} else if (thisFrame.characters[0].justification=="Justification.CENTER") {
					alignment = "center";
					// if (thisFrame.kind=="TextType.AREATEXT") { centerBuffer=0; }; // don't use additional padding if the text block is area text.
					// htmlX  = thisFrame.left-abX-(abW*(1+(extraWidthPct/100/2)));
					htmlL  = thisFrame.left-abX+(thisFrame.width/2); // thanks jeremy!
					htmlLM = thisFrame.width*(1+(extraWidthPct/100))/2*-1;
				} else {
					alignment = "other";
					htmlX = Math.round(thisFrame.left-abX);
				};

				var frameLayer = makeKeyword(thisFrame.layer.name);

				// var getParentLayers = function(startingLayer) {
				// 	var parentLayers = [];

				// }

				// var frameLayers = addLayerClasses(getParentLayers(thisFrame.layer));


				var j = i+1;
				var thisFrameId = nameSpace+"ai"+abNumber+"-" + j;
				if (thisFrame.name!="") {
					thisFrameId = makeKeyword(thisFrame.name);
				};
				html[6] += "\t\t\t<div id='"+thisFrameId;
				html[6] += "' class='"+nameSpace+frameLayer+" "+nameSpace+"aiAbs"+
					(textIsTransformed(thisFrame) && kind == "point" ? ' g-aiPtransformed' : '')+"' style='";

				// check if text is transformed
				if (textIsTransformed(thisFrame)) {
					// find transformed anchor point pre-transformation
					var t_bounds = thisFrame.geometricBounds,
						u_bounds = getUntransformedTextBounds(thisFrame),
						u_width = u_bounds[2] - u_bounds[0],
						t_width = t_bounds[2] - t_bounds[0],
						u_height = u_bounds[3] - u_bounds[1],
						t_height = t_bounds[3] - t_bounds[1],
						v_align = thisFrameAttributes.valign || 'top',
						t_scale_x = thisFrame.textRange.characterAttributes.horizontalScale / 100,
						t_scale_y = thisFrame.textRange.characterAttributes.verticalScale / 100,
						t_anchor = getAnchorPoint(u_bounds, thisFrame.matrix, alignment, v_align, t_scale_x, t_scale_y),
						t_trans_x = 0,
						t_trans_y = 0;

					// position div on transformed anchor point
					html[6] += "left:" + round((t_anchor[0]-abX)/abW*100, pctPrecision) + "%;";
					html[6] += "top:" + round((-t_anchor[1]-abY)/abH*100, pctPrecision) + "%;";

					// move "back" to left or top to center or right align text
					if (alignment == 'center') t_trans_x -= u_width * 0.5;
					else if (alignment == 'right') t_trans_x -= u_width;
					if (v_align == 'center' || v_align == 'middle') t_trans_y -= u_height * 0.5;
					else if (v_align == 'bottom') t_trans_y -= u_height;

					var mat = thisFrame.matrix;

					mat = app.concatenateMatrix(app.getTranslationMatrix(t_trans_x, t_trans_y),
							app.concatenateTranslationMatrix(mat, -mat.mValueTX, -mat.mValueTY));

					// var mat, mat0 = thisFrame.matrix;
					// mat0 = app.concatenateTranslationMatrix(mat0, -mat0.mValueTX, -mat0.mValueTY);
					// mat = app.concatenateMatrix(app.getTranslationMatrix(t_trans_x, t_trans_y), mat0);

					var transform = "matrix("
							+round(mat.mValueA, pctPrecision)+','
							+round(-1*mat.mValueB, pctPrecision)+','
							+round(-1*mat.mValueC, pctPrecision)+','
							+round(mat.mValueD, pctPrecision)+','
							+round(t_trans_x, pctPrecision)+','
							+round(-t_trans_y, pctPrecision)+') '
							+"scaleX("+round(t_scale_x, pctPrecision)+") "
							+"scaleY("+round(t_scale_y, pctPrecision)+")";

					var transformOrigin = alignment + ' '+(v_align == 'middle' ? 'center' : v_align);

					html[6] += "transform: "+transform+";";
					html[6] += "transform-origin: "+transformOrigin+";";
					html[6] += "-webkit-transform: "+transform+";";
					html[6] += "-webkit-transform-origin: "+transformOrigin+";";
					html[6] += "-ms-transform: "+transform+";";
					html[6] += "-ms-transform-origin: "+transformOrigin+";";

					if (kind == 'area') html[6] += "width: "+(u_width * (1+(extraWidthPct/100)))+"px;";

				} else {

					if (outputType=="abs") {
						html[6] += "top:" + round(htmlY) + "px;";
						if (alignment=="left") {
							html[6] += "left:"  + round(htmlL) + "px;";
							html[6] += "width:" + round(htmlW) + "px;";
						} else if (alignment=="right") {
							html[6] += "right:" + round(htmlR) + "px;";
							html[6] += "width:" + round(htmlW) + "px;";
						} if (alignment=="center") {
							html[6] += "left:"  + round(htmlL) + "px;";
							html[6] += "width:" + round(htmlW) + "px;";
							html[6] += "margin-left:" + round(htmlLM) + "px;";
						};
					} else if (outputType=="pct") {
						if (thisFrameAttributes.valign==="bottom") {
							html[6] += "bottom:" + round(100-(htmlB/abH*100), pctPrecision) + "%;";
						} else {
							html[6] += "top:" + round(htmlT/abH*100, pctPrecision) + "%;";
						};
						if (alignment=="right") {
							html[6] += "right:" + round(htmlR/abW*100, pctPrecision) + "%;";
							if (kind=="area") {
								html[6] += "width:" + round(htmlW/abW*100, pctPrecision) + "%;";
							};
						} else if (alignment=="center") {
							html[6] += "left:" + round(htmlL/abW*100, pctPrecision) + "%;";
							html[6] += "width:" + round(htmlW/abW*100, pctPrecision) + "%;";
							html[6] += "margin-left:" + round(htmlLM/abW*100, pctPrecision) + "%;";
						} else {
							html[6] += "left:" + round(htmlL/abW*100, pctPrecision) + "%;";
							if (kind=="area") {
								html[6] += "width:" + round(htmlW/abW*100, pctPrecision) + "%;";
							};
						};

					};

				}

				html[6] += "'>\r"; // close div tag for text frame

				var numChars = thisFrame.characters.length;
				var runningChars = 0;
				for (var k=0;k<thisFrame.paragraphs.length;k++) {

					if (runningChars<numChars && thisFrame.paragraphs[k].characters.length!=0) {
						// var sampleChar = thisFrame.paragraphs[k].length-1;
						var sampleChar = Math.round(thisFrame.paragraphs[k].length/2)-1;
						var pStyleKey = "";
						pStyleKey += thisFrame.paragraphs[k].characters[sampleChar].textFont.name;
						pStyleKey += b + Math.round(thisFrame.paragraphs[k].characters[sampleChar].size);
						pStyleKey += b + thisFrame.paragraphs[k].characters[sampleChar].capitalization;

						if (thisFrame.paragraphs[k].characters[sampleChar].fillColor.typename=="GrayColor") {
							var grayPct = selectFrames[i].characters[k].fillColor.gray;
							var rgbPct   = (100-grayPct)/100*255;
							var redOut   = rgbPct;
							var greenOut = rgbPct;
							var blueOut  = rgbPct;
						} else if (thisFrame.paragraphs[k].characters[sampleChar].fillColor.typename=="RGBColor") {
							var redOut   = thisFrame.paragraphs[k].characters[sampleChar].fillColor.red;
							var greenOut = thisFrame.paragraphs[k].characters[sampleChar].fillColor.green;
							var blueOut  = thisFrame.paragraphs[k].characters[sampleChar].fillColor.blue;
							if (redOut  <rgbBlackThreshold&&
								greenOut<rgbBlackThreshold&&
								blueOut <rgbBlackThreshold) {
								redOut   = 0;
								greenOut = 0;
								blueOut  = 0;
							};
						} else if (thisFrame.paragraphs[k].characters[sampleChar].fillColor.typename=="NoColor") {
							var redOut   = 0;
							var greenOut = 255;
							var blueOut  = 0;
							warnings.push("This text has no fill. Please fill it with an RGB color. It has been filled with green. Text: “" + thisFrame.paragraphs[k].contents + "”");
						} else {
							var redOut   = 0;
							var greenOut = 0;
							var blueOut  = 0;
							warnings.push("This text is filled with a non-RGB color. Please fill it with an RGB color. It has been filled with black. Text: “" + thisFrame.paragraphs[k].contents + "”");
						};

						pStyleKey += b + redOut.toString(16);
						pStyleKey += b + greenOut.toString(16);
						pStyleKey += b + blueOut.toString(16);

						pStyleKey += b + thisFrame.paragraphs[k].characters[sampleChar].tracking;
						pStyleKey += b + Math.round(thisFrame.paragraphs[k].leading);
						pStyleKey += b + Math.round(thisFrame.paragraphs[k].spaceBefore);
						pStyleKey += b + Math.round(thisFrame.paragraphs[k].spaceAfter);
						pStyleKey += b + thisFrame.paragraphs[k].justification;
						pStyleKey += b + Math.round(thisFrame.opacity);

						var pStyleKeyId = 0;
						for (var l=0;l<pStyleKeys.length;l++) {
							if (pStyleKey==pStyleKeys[l]) {
								pStyleKeyId = l;
							};
						};

						html[6] += "\t\t\t\t<p class='"+nameSpace+"aiPstyle" + pStyleKeyId + "'>";
						if (isNaN(thisFrame.paragraphs[k].length)) {
							html[6] += "&nbsp;";
						} else {
							textToClean = thisFrame.paragraphs[k].contents;
							textToClean = straightenCurlyQuotesInsideAngleBrackets(textToClean);
							cleanedText = cleanText(textToClean);
							html[6] += cleanedText;
						};
						html[6] += "</p>\r";
						runningChars += (thisFrame.paragraphs[k].characters.length)+1;
					} else {
						html[6] += "\t\t\t\t<p>&nbsp;</p>\r";
						runningChars += 1;
					};
				};
				html[6] += "\t\t\t</div>\r";
			};

			for (var i=1;i<html.length;i++) {
				responsiveHtml += (html[i]);
			};
			// responsiveHtml += "\n";

			for (var i=0;i<selectFrames.length;i++) {
				hideTextFrame(selectFrames[i]);
			};

			// unhide text now if in testing mode
			if (docSettings.testing_mode=="yes") {
				for (var i=0;i<selectFrames.length;i++) {
					selectFrames[i].hidden = false;
				};
			};

			var imageDestinationFolder = docPath + docSettings.html_output_path + docSettings.image_output_path;
			checkForOutputFolder(imageDestinationFolder, "image_output_path");
			var imageDestination = imageDestinationFolder + docArtboardName;
			// alert ("imageDestination\n" +
			// 		"docPath = " + docPath + "\n" +
			// 		"docSettings.html_output_path = " + docSettings.html_output_path + "\n" +
			// 		"docSettings.image_output_path = " + docSettings.image_output_path + "\n" +
			// 		"docArtboardName = " + docArtboardName);

			if (docSettings.write_image_files=="yes") {
				// if in svg export, hide path elements outside of the current artboard
				if (docSettings.image_format[0] == 'svg') {
					// save refs to elements we are hiding
					var hiddenItemsOutsideArtboard = hideElementsOutsideArtboardRect(activeArtboardRect);
				}

			pBar.setTitle(docArtboardName + ': Writing image...');

			exportImageFiles(imageDestination,abW,abH,docSettings.image_format,1.0,docSettings.use_2x_images_if_possible);

				if (docSettings.image_format[0] == 'svg' && hiddenItemsOutsideArtboard.length > 0) {
				// unhide non-text elements hidden before export
					for (var item_i=0; item_i < hiddenItemsOutsideArtboard.length; item_i++) {
						hiddenItemsOutsideArtboard[item_i].hidden = false;
					}
				}
			};


			// unhide text now if NOT in testing mode
			if (docSettings.testing_mode!="yes") {
				for (var i=0;i<selectFrames.length;i++) {
					selectFrames[i].hidden = false;
				};
			};

			//=====================================
			// output html file here if doing a file for every artboard
			//=====================================

			if (docSettings.output=="multiple-files") {
				var responsiveJs        = '\t<script src="_assets/resizerScript.js"></script>' + "\n";
				var responsiveCss       = '\t<link rel="stylesheet" href="_assets/resizerStyle.css">' + "\n";
				if (docSettings.include_resizer_css_js=="no"||docSettings.ai2html_environment!="nyt") {
					responsiveJs        = "";
					responsiveCss       = "";
				};
				if (docSettings.include_resizer_script=="yes") {
					responsiveJs = '\t' + getResizerScript() + '\n';
					responsiveCss             = "";
				}
				var responsiveTextScoop = responsiveHtml;
				var textForFile         = "";
				var htmlFileDestination = "";
				var headerText          = "<div id='" + nameSpace + docArtboardName + "-box' class='ai2html'>\r";
				headerText             += "\t<!-- Generated by ai2html v" + scriptVersion + " - " + dateTimeStamp + " -->\r"
				headerText             += "\t<!-- ai file: " + docSettings.project_name + " -->\r";
				if (docSettings.ai2html_environment=="nyt") {
					headerText             += "\t<!-- preview: " + docSettings.preview_slug + " -->\r";
					headerText             += "\t<!-- scoop  : " + docSettings.scoop_slug_from_config_yml + " -->\r";
				};
				headerText             += "\r";
				headerText             += "\t<style type='text/css' media='screen,print'>\r";
				if (docSettings.max_width!="") {
					headerText             += "\t\t#" + nameSpace + docArtboardName + "-box {\r";
					headerText             += "\t\t\tmax-width:" + docSettings.max_width + "px;\r";
					headerText             += "\t\t}\r";
				};
				if (docSettings.center_html_output) {
					headerText             += "\t\t."+nameSpace+"artboard {\r";
					headerText             += "\t\t\tmargin:0 auto;\r";
					headerText             += "\t\t}\r";
				};
				headerText             += "\t</style>\r";
				headerText             += "\r";
				var footerText          = "\t<!-- End ai2html" + " - " + dateTimeStamp + " -->\r</div>\r";

				textForFile += headerText;
				if (previewProjectType=="ai2html") { textForFile += responsiveCss; };
				if (customCssBlocks>0)             { textForFile += customCss;     };
				textForFile += responsiveTextScoop;
				if (customHtml.length>0)           { textForFile += customHtml;    };
				if (customJs.length>0)             { textForFile += customJs;      };
				if (responsiveJs.length>0)         { textForFile += responsiveJs;  };
				textForFile += footerText;
				textForFile  = applyTemplate(textForFile,docSettings);
				// textForFile  = straightenCurlyQuotesInsideAngleBrackets(textForFile);

				htmlFileDestinationFolder = docPath + docSettings.html_output_path;
				checkForOutputFolder(htmlFileDestinationFolder, "html_output_path");
				htmlFileDestination = htmlFileDestinationFolder + docArtboardName + docSettings.html_output_extension;
				if (docSettings.local_preview_template!="") {
					pBar.setTitle(docArtboardName + ': Writing HTML file...');

					docSettings.ai2htmlPartial     = textForFile;
					var localPreviewDestination = htmlFileDestinationFolder + docArtboardName + ".preview.html";
					var localPreviewHtml        = applyTemplate(localPreviewTemplateText,docSettings)
					outputHtml(localPreviewHtml,localPreviewDestination);
				};

				outputHtml(textForFile,htmlFileDestination);
				// var responsiveHtmlScoopFile = new File( htmlFileDestination );
				// responsiveHtmlScoopFile.open( "w", "TEXT", "TEXT" );
				// 	responsiveHtmlScoopFile.lineFeed = "Unix";
				// 	responsiveHtmlScoopFile.encoding = "UTF-8";
				// 	responsiveHtmlScoopFile.writeln(textForFile);
				// responsiveHtmlScoopFile.close;
				responsiveHtml = "";
			};

		}; // end check if artboard to process
	}; // end artboard loop


	//=====================================
	// output html file here if doing one file for all artboards
	//=====================================

	if (docSettings.output=="one-file") {
		var responsiveJs              = '\t<script src="_assets/resizerScript.js"></script>' + "\n";
		var responsiveCss             = '\t<link rel="stylesheet" href="_assets/resizerStyle.css">' + "\n";
		if (docSettings.include_resizer_css_js=="no"||docSettings.ai2html_environment!="nyt") {
			responsiveJs              = "";
			responsiveCss             = "";
		};
		if (docSettings.include_resizer_script=="yes") {
			responsiveJs = '\t' + getResizerScript() + '\n';
			responsiveCss             = "";
		}

		var responsiveTextScoop       = responsiveHtml;
		var textForFile               = "";
		var htmlFileDestinationFolder = "";
		var htmlFileDestination       = "";
		var headerText                = "<div id='" + nameSpace + makeKeyword(docSettings.project_name) + "-box' class='ai2html'>\r";
		headerText                   += "\t<!-- Generated by ai2html v" + scriptVersion + " - " + dateTimeStamp + " -->\r"
		headerText                   += "\t<!-- ai file: " + docSettings.project_name + " -->\r";
		if (docSettings.ai2html_environment=="nyt") {
			headerText               += "\t<!-- preview: " + docSettings.preview_slug + " -->\r";
			headerText               += "\t<!-- scoop  : " + docSettings.scoop_slug_from_config_yml + " -->\r";
		};
		headerText                   += "\r";
		headerText                   += "\t<style type='text/css' media='screen,print'>\r";
		if (docSettings.max_width!="") {
			headerText               += "\t\t#" + nameSpace + makeKeyword(docSettings.project_name) + "-box {\r";
			headerText               += "\t\t\tmax-width:" + docSettings.max_width + "px;\r";
			headerText               += "\t\t}\r";
		};
		if (docSettings.center_html_output) {
			headerText             += "\t\t."+nameSpace+"artboard {\r";
			headerText             += "\t\t\tmargin:0 auto;\r";
			headerText             += "\t\t}\r";
		};
		if (docSettings.clickable_link!="") {
			headerText             += "\t\t."+nameSpace+"ai2htmlLink {\r";
			headerText             += "\t\t\tdisplay: block;\r";
			headerText             += "\t\t}\r";
		};
		headerText                   += "\t</style>\r";
		headerText                   += "\r";
		if (docSettings.clickable_link!="") {
			headerText += "\t<a class='"+nameSpace+"ai2htmlLink' href='"+docSettings.clickable_link+"'>\r";
		};



		var footerText = "";
		if (docSettings.clickable_link!="") {
			footerText += "\t</a>\r";
		}
		footerText                += "\t<!-- End ai2html" + " - " + dateTimeStamp + " -->\r</div>\r";

		textForFile += headerText;
		if (previewProjectType=="ai2html") { textForFile += responsiveCss; };
		if (customCssBlocks>0)             { textForFile += customCss;     };
		textForFile += responsiveTextScoop;
		if (customHtml.length>0)           { textForFile += customHtml;    };
		if (customJs.length>0)             { textForFile += customJs;      };
		if (responsiveJs.length>0)         { textForFile += responsiveJs;  };

		textForFile += footerText;
		textForFile  = applyTemplate(textForFile,docSettings);
		// textForFile  = straightenCurlyQuotesInsideAngleBrackets(textForFile);

		htmlFileDestinationFolder = docPath + docSettings.html_output_path;
		checkForOutputFolder(htmlFileDestinationFolder, "html_output_path");
		if (previewProjectType=="ai2html") {
			htmlFileDestination     = htmlFileDestinationFolder + "index" + docSettings.html_output_extension;
		} else if ((previewProjectType!="ai2html"&&srcFolder.exists)||docSettings.ai2html_environment!="nyt") {
			htmlFileDestination     = htmlFileDestinationFolder + docSettings.project_name + docSettings.html_output_extension;
			if (docSettings.local_preview_template!="") {
				// var localPreviewTemplateFile = new File(docPath + docSettings.local_preview_template);
				// var localPreviewTemplateText = readTextFileAndPutIntoAVariable(localPreviewTemplateFile,"","","");
				pBar.setTitle('Writing HTML file...');

				docSettings.ai2htmlPartial = textForFile;
				var localPreviewDestination = htmlFileDestinationFolder + docSettings.project_name + ".preview.html";
				var localPreviewHtml = applyTemplate(localPreviewTemplateText,docSettings)
				outputHtml(localPreviewHtml,localPreviewDestination);
			};
		};

		outputHtml(textForFile,htmlFileDestination);
		// var responsiveHtmlScoopFile = new File( htmlFileDestination );
		// responsiveHtmlScoopFile.open( "w", "TEXT", "TEXT" );
		// 	responsiveHtmlScoopFile.lineFeed = "Unix";
		// 	responsiveHtmlScoopFile.encoding = "UTF-8";
		// 	responsiveHtmlScoopFile.writeln(textForFile);
		// responsiveHtmlScoopFile.close;

	};

	//=====================================
	// write configuration file with graphic metadata
	//=====================================

	if (
			(docSettings.ai2html_environment=="nyt" && previewProjectType=="ai2html") ||
			(docSettings.ai2html_environment!="nyt" && docSettings.create_config_file)
		) {
		var configFileFolder = (docPath + docSettings.config_file_path).replace( /[^\/]+$/ , "");
		checkForOutputFolder(configFileFolder , "configFileFolder");
		var configFile = new File( docPath + docSettings.config_file_path );
		configFile.open( "w", "TEXT", "TEXT" );
			configFile.lineFeed = "Unix";
			configFile.encoding = "UTF-8";
			configFile.writeln(customYml);
		configFile.close;
	} else {

	};

	// Create promo image with largest artboard
	if (docSettings.create_promo_image=="yes") {
		createPromoImage(largestArtboardIndex);
	};


}; // end rgb colorspace test


// Unhide stuff that was hidden during processing
for (var i = 0; i < textFramesToUnhide.length; i++) {
	var currentFrameToUnhide = textFramesToUnhide[i];
	currentFrameToUnhide.hidden = false;
};

// Unhide layers so objects inside can be unlocked
for (var i = hiddenObjects.length-1; i>=0; i--) {
	hiddenObjects[i].visible = true;
};

// Relock stuff that was unlocked during processing
for (var i = lockedObjects.length-1; i>=0; i--) {
	lockedObjects[i].locked = true;
};

// Hide again layers
for (var i = hiddenObjects.length-1; i>=0; i--) {
	hiddenObjects[i].visible = false;
};


pBar.setTitle('Saving Illustrator document...');
pBar.setProgress(1.0);
// Save the document
if (parentFolder !== null) {
	var saveOptions = new IllustratorSaveOptions();
	saveOptions.pdfCompatible = false;
	// if (!doc.saved) { doc.save() };
	if (!doc.saved) { doc.saveAs( origFile , saveOptions ) };
	feedback.push("Your Illustrator file was saved.")
}

// ==============================
// alert box
// ==============================

if (customCssBlocks==1)  { feedback.push(customCssBlocks  + " custom CSS block was added.") };
if (customCssBlocks>1)   { feedback.push(customCssBlocks  + " custom CSS blocks were added.") };
if (customHtmlBlocks==1) { feedback.push(customHtmlBlocks + " custom HTML block was added.") };
if (customHtmlBlocks>1)  { feedback.push(customHtmlBlocks + " custom HTML blocks were added.") };
if (customJsBlocks==1)   { feedback.push(customJsBlocks   + " custom JS block was added.") };
if (customJsBlocks>1)    { feedback.push(customJsBlocks   + " custom JS blocks were added.") };

if (docSettings["image_format"].length==0) {
	warnings.push("No images output because no image formats were specified.")
};

if (errors.length == 1) {
	alertText += "\rError\r================\r";
} else if (errors.length > 1) {
	alertText += "\rErrors\r================\r";
};
if (errors.length > 0) {
	for (var e = 0; e < errors.length; e++) {
		alertText += "• " + errors[e] + "\r";
	};
};
if (warnings.length == 1) {
	alertText += "\rWarning\r================\r";
} else if (warnings.length > 1) {
	alertText += "\rWarnings\r================\r";
};
if (warnings.length > 0) {
	for (var w = 0; w < warnings.length; w++) {
		alertText += "• " + warnings[w] + "\r";
	};
};
if (feedback.length > 0) {
	alertText += "\rInformation\r================\r";
	for (var f = 0; f < feedback.length; f++) {
		alertText += "• " + feedback[f] + "\r";
	};
};

pBar.close();

if (docSettings.show_completion_dialog_box=="true") {
        alert(alertHed + "\n" + alertText + "\n\n\n================\nai2html-nyt5-bbg v"+scriptVersion);
};

function getResizerScript() {
	var resizerScript="";
	resizerScript += "\n" + "<script type=\"text\/javascript\">";
	resizerScript += "\n" + "    (function() {";
	resizerScript += "\n" + "        \/\/ only want one resizer on the page";
	resizerScript += "\n" + "        if (document.documentElement.className.indexOf(\"g-resizer-v3-init\") > -1) return;";
	resizerScript += "\n" + "        document.documentElement.className += \" g-resizer-v3-init\";";
	resizerScript += "\n" + "        \/\/ require IE9+";
	resizerScript += "\n" + "        if (!(\"querySelector\" in document)) return;";
	resizerScript += "\n" + "        function resizer() {";
	resizerScript += "\n" + "            var elements = Array.prototype.slice.call(document.querySelectorAll(\".g-artboard-v3[data-min-width]\")),";
	resizerScript += "\n" + "                widthById = {};";
	resizerScript += "\n" + "            elements.forEach(function(el) {";
	resizerScript += "\n" + "                var parent = el.parentNode,";
	resizerScript += "\n" + "                    width = widthById[parent.id] || parent.getBoundingClientRect().width,";
	resizerScript += "\n" + "                    minwidth = el.getAttribute(\"data-min-width\"),";
	resizerScript += "\n" + "                    maxwidth = el.getAttribute(\"data-max-width\");";
	resizerScript += "\n" + "                widthById[parent.id] = width;";
	resizerScript += "\n" + "";
	resizerScript += "\n" + "                if (+minwidth <= width && (+maxwidth >= width || maxwidth === null)) {";
	resizerScript += "\n" + "                    var img = el.querySelector('.g-aiImg');";
	resizerScript += "\n" + "                    if (img.getAttribute('data-src') && img.getAttribute('src') != img.getAttribute('data-src')) {";
	resizerScript += "\n" + "                        img.setAttribute('src', img.getAttribute('data-src'));";
	resizerScript += "\n" + "                    }";
	resizerScript += "\n" + "                    el.style.display = \"block\";";
	resizerScript += "\n" + "                } else {";
	resizerScript += "\n" + "                    el.style.display = \"none\";";
	resizerScript += "\n" + "                }";
	resizerScript += "\n" + "            });";


	if (scriptEnvironment=="nyt") {
		resizerScript += "\n" + "            try {";
		resizerScript += "\n" + "                if (window.parent && window.parent.$) {";
		resizerScript += "\n" + "                    window.parent.$(\"body\").trigger(\"resizedcontent\", [window]);";
		resizerScript += "\n" + "                }";
		resizerScript += "\n" + "                document.documentElement.dispatchEvent(new Event('resizedcontent'));";
		resizerScript += "\n" + "                if (window.require && document.querySelector('meta[name=sourceApp]') && document.querySelector('meta[name=sourceApp]').content == 'nyt-v5') {";
		resizerScript += "\n" + "                    require(['foundation\/main'], function() {";
		resizerScript += "\n" + "                        require(['shared\/interactive\/instances\/app-communicator'], function(AppCommunicator) {";
		resizerScript += "\n" + "                            AppCommunicator.triggerResize();";
		resizerScript += "\n" + "                        });";
		resizerScript += "\n" + "                    });";
		resizerScript += "\n" + "                }";
		resizerScript += "\n" + "            } catch(e) { console.log(e); }";
	}

	resizerScript += "\n" + "        }";
	resizerScript += "\n" + "";
	resizerScript += "\n" + "        resizer();";
	resizerScript += "\n" + "        document.addEventListener('DOMContentLoaded', resizer);";
	resizerScript += "\n" + "        \/\/ feel free to replace throttle with _.throttle, if available";
	resizerScript += "\n" + "        window.addEventListener('resize', throttle(resizer, 200));        ";
	resizerScript += "\n" + "";
	resizerScript += "\n" + "        function throttle(func, wait) {";
	resizerScript += "\n" + "            \/\/ from underscore.js";
	resizerScript += "\n" + "            var _now = Date.now || function() { return new Date().getTime(); },";
	resizerScript += "\n" + "                context, args, result, timeout = null, previous = 0;";
	resizerScript += "\n" + "            var later = function() {";
	resizerScript += "\n" + "                previous = _now();";
	resizerScript += "\n" + "                timeout = null;";
	resizerScript += "\n" + "                result = func.apply(context, args);";
	resizerScript += "\n" + "                if (!timeout) context = args = null;";
	resizerScript += "\n" + "            };";
	resizerScript += "\n" + "            return function() {";
	resizerScript += "\n" + "                var now = _now(), remaining = wait - (now - previous);";
	resizerScript += "\n" + "                context = this;";
	resizerScript += "\n" + "                args = arguments;";
	resizerScript += "\n" + "                if (remaining <= 0 || remaining > wait) {";
	resizerScript += "\n" + "                    if (timeout) {";
	resizerScript += "\n" + "                        clearTimeout(timeout);";
	resizerScript += "\n" + "                        timeout = null;";
	resizerScript += "\n" + "                    }";
	resizerScript += "\n" + "                    previous = now;";
	resizerScript += "\n" + "                    result = func.apply(context, args);";
	resizerScript += "\n" + "                    if (!timeout) context = args = null;";
	resizerScript += "\n" + "                } else if (!timeout) {";
	resizerScript += "\n" + "                    timeout = setTimeout(later, remaining);";
	resizerScript += "\n" + "                }";
	resizerScript += "\n" + "                return result;";
	resizerScript += "\n" + "            };";
	resizerScript += "\n" + "        }";
	resizerScript += "\n" + "";
	resizerScript += "\n" + "       ";
	resizerScript += "\n" + "    })();";
	resizerScript += "\n" + "<\/script>";
	resizerScript += "\n" + "";
	return resizerScript;
}

function textIsTransformed(textFrame) {
	return !(textFrame.matrix.mValueA==1 &&
		textFrame.matrix.mValueB==0 &&
		textFrame.matrix.mValueC==0 &&
		textFrame.matrix.mValueD==1);
		// || textFrame.textRange.characterAttributes.horizontalScale != 100
		// || textFrame.textRange.characterAttributes.verticalScale != 100;
}

function getUntransformedTextBounds(textFrame) {
	var oldSelection = activeDocument.selection;

	activeDocument.selection = [textFrame];
	app.copy();
	app.paste();
	var textFrameCopy = activeDocument.selection[0];
	// move to same position
	textFrameCopy.left = textFrame.left;
	textFrameCopy.top = textFrame.top;
	var bnds = textFrameCopy.geometricBounds;

	var old_center_x = (bnds[0] + bnds[2]) * 0.5,
		old_center_y = (bnds[1] + bnds[3]) * 0.5;

	// inverse transformation of copied text frame
	textFrameCopy.transform(app.invertMatrix(textFrame.matrix));
	// remove scale
	textFrameCopy.textRange.characterAttributes.horizontalScale = 100;
	textFrameCopy.textRange.characterAttributes.verticalScale = 100;
	// move transformed text frame back to old center point
	var new_center_x, new_center_y;
	var max_iter = 5;

	while (--max_iter > 0) {
		bnds = textFrameCopy.geometricBounds;
		new_center_x = (bnds[0] + bnds[2]) * 0.5;
		new_center_y = (bnds[1] + bnds[3]) * 0.5;
		textFrameCopy.translate(old_center_x - new_center_x, old_center_y - new_center_y);
	}

	var bounds = textFrameCopy.geometricBounds;

	textFrameCopy.textRange.characterAttributes.fillColor = getRGBColor(250, 50, 50);
	textFrameCopy.remove();

	// reset selection
	activeDocument.selection = oldSelection;
	return bounds;
}

function getRGBColor(r,g,b) {
	var col = new RGBColor();
	col.red = r || 0;
	col.green = g || 0;
	col.blue = b || 0;
	return col;
}

function getAnchorPoint(untransformedBounds, matrix, hAlign, vAlign, sx, sy) {
	var center_x = (untransformedBounds[0] + untransformedBounds[2]) * 0.5,
		center_y = (untransformedBounds[1] + untransformedBounds[3]) * 0.5,
		anchor_x = (hAlign == 'left' ? untransformedBounds[0] :
			(hAlign == 'center' ? center_x : untransformedBounds[2])),
		anchor_y = (vAlign == 'top' ? untransformedBounds[1] :
			(vAlign == 'bottom' ? untransformedBounds[3] : center_y)),
		anchor_dx = (anchor_x - center_x),
		anchor_dy = (anchor_y - center_y);

	var mat = app.concatenateMatrix(app.getScaleMatrix(sx*100, sy*100), matrix);

	var t_anchor_x = center_x + mat.mValueA * anchor_dx + mat.mValueC * anchor_dy,
		t_anchor_y = center_y + mat.mValueB * anchor_dx + mat.mValueD * anchor_dy;

	return [t_anchor_x, t_anchor_y];
}


function hideElementsOutsideArtboardRect(artbnds) {
	var hidden = [], all_groups;
	checkLayers(doc.layers);

	function checkLayers(layers) {
		for (var lid=0; lid<layers.length; lid++) {
			var layer = layers[lid];
			if (layer.visible) { // only deal with visible layers
				var checkItemGroups = [layer.pathItems, layer.symbolItems, layer.compoundPathItems];
				all_groups = [];
				traverseGroups(layer);
				// feedback.push('layer.groupItems '+layer.groupItems.length);
				// alert('groups: '+groups.length);
				for (var g=0; g<all_groups.length; g++) {
					checkItemGroups.push(all_groups[g].pathItems);
					checkItemGroups.push(all_groups[g].symbolItems);
					checkItemGroups.push(all_groups[g].compoundPathItems);
				}
				for (var cig=0; cig<checkItemGroups.length; cig++) {
					for (var item_i=0; item_i<checkItemGroups[cig].length; item_i++) {
						var check_item = checkItemGroups[cig][item_i],
							item_bnds = check_item.visibleBounds;
						// bounds are [left,-top,right,-bottom]
						if (item_bnds[0] > artbnds[2] ||
							item_bnds[2] < artbnds[0] ||
							item_bnds[1] < artbnds[3] ||
							item_bnds[3] > artbnds[1]) {
							if (!check_item.hidden) {
								hidden.push(check_item);
								check_item.hidden = true;
							}
						}
					}
				}
				if (layer.layers.length > 0) checkLayers(layer.layers);
			}
		}
		function traverseGroups(groupItems) {
			for (var g=0;g<groupItems.length;g++) {
				// check group bounds
				var bnds = groupItems[g].visibleBounds;
				if (bnds[0] > artbnds[2] || bnds[2] < artbnds[0] || bnds[1] < artbnds[3] || bnds[3] > artbnds[1]) {
					// group entirely out of artboard, so ignore
					groupItems[g].hidden = true;
					hidden.push(groupItems[g]);
				} else {
					// recursively check sub-groups
					all_groups.push(groupItems[g]);
					if (groupItems[g].groupItems.length > 0) {
						traverseGroups(groupItems[g].groupItems);
					}
				}
			}
		}
	}

	return hidden;
}

function round(number, precision) {
	var d = Math.pow(10, precision || 0);
	return Math.round(number * d) / d;
}
