// aifontname.js
var scriptVersion     = "0.01";

// aifontname is a script for Adobe Illustrator that returns the Illustrator font names for text objects in your selection, or if nothing is selected, in your entire document.

// Copyright (c) 2015 Archie Tse

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this library except in compliance with the License.
// You may obtain a copy of the License at

// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


var doc = app.activeDocument;
var textFramesToCheck = [];
var aiFontNames = [];
var alertHed = "";

if (app.activeDocument.selection.length==0) {
	textFramesToCheck = doc.textFrames;
	alertHed = "Fonts used in your document";
} else {
	for (var k = 0; k < app.activeDocument.selection.length; k++) {
		var currentObject = app.activeDocument.selection[k];
		if (currentObject.typename=="TextFrame") {
			textFramesToCheck.push(currentObject);
		};
	};
	alertHed = "Fonts used in your selection";
}
// alert(textFramesToCheck);

if (textFramesToCheck.length==0) {
	alert("Error\nNo text to check.");
} else {
	// alert("yeah");
	for (var i = 0; i < textFramesToCheck.length; i++) {
		var currentTextFrame  = textFramesToCheck[i];
		var charactersToCheck = currentTextFrame.characters;
		for (var j = 0; j < charactersToCheck.length; j++) {
			var currentCharacter = charactersToCheck[j];
			var currentFont = currentCharacter.textFont.name;
			if (currentCharacter.contents !== "\r" && currentCharacter.contents !== " " ) {
				// alert(currentCharacter.contents + " = " + currentFont);
				var fontAlreadyInArray = false;
				for (var l = 0; l < aiFontNames.length; l++) {
					if (currentFont==aiFontNames[l]) {
						fontAlreadyInArray = true;
					};
				};
				if (!fontAlreadyInArray) {
					aiFontNames.push(currentFont);
					// alert("pushing " + currentFont);
				};
			};
		};
	};
};

// alert("aiFontNames.length = " + aiFontNames.length)

var alertText = alertHed;
for (var m = 0; m < aiFontNames.length; m++) {
	var fontName = aiFontNames[m];
	alertText += "\r" + fontName;
};
alertText += "\r\r___________\r\raifontname v" + scriptVersion;


alert(alertText);




