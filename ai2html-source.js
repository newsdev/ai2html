// ai2html is a script for Adobe Illustrator that converts your Illustrator document into html and css.
// Copyright (c) 2011-2018 The New York Times Company
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
// - Use Arial or Georgia unless you have added your own fonts to the fonts array in the script.
// - Run the script by choosing: File > Scripts > ai2html
// - Go to the folder containing your Illustrator file. Inside will be a folder called ai2html-output.
// - Open the html files in your browser to preview your output.

function main() {
// Enclosing scripts in a named function (and not an anonymous, self-executing
// function) has been recommended as a way to minimise intermittent "MRAP" errors.
// (This advice may be superstitious, need more evidence to decide.)
// See (for example) https://forums.adobe.com/thread/1810764 and
// http://wwwimages.adobe.com/content/dam/Adobe/en/devnet/pdf/illustrator/scripting/Readme.txt




// =================================
// ai2html render function
// =================================

function render(settings, customBlocks) {
  // warn about duplicate artboard names
  validateArtboardNames(docSettings);

  // Fix for issue #50
  // If a text range is selected when the script runs, it interferes
  // with script-driven selection. The fix is to clear this kind of selection.
  if (doc.selection && doc.selection.typename) {
    clearSelection();
  }

  // ================================================
  // Generate HTML, CSS and images for each artboard
  // ================================================
  progressBar = new ProgressBar({name: 'Ai2html progress', steps: calcProgressBarSteps()});
  unlockObjects(); // Unlock containers and clipping masks
  var masks = findMasks(); // identify all clipping masks and their contents
  var fileContentArr = [];

  forEachUsableArtboard(function(activeArtboard, abIndex) {
    var abSettings = getArtboardSettings(activeArtboard);
    var docArtboardName = getDocumentArtboardName(activeArtboard);
    var textFrames, textData, imageData, specialData;
    var artboardContent = {html: '', css: '', js: ''};

    doc.artboards.setActiveArtboardIndex(abIndex);

    // detect videos and other special layers
    specialData = convertSpecialLayers(activeArtboard, settings);
    if (specialData) {
      forEach(specialData.layers, function(lyr) {
        lyr.visible = false;
      });
    }

    // ========================
    // Convert text objects
    // ========================

    if (abSettings.image_only || settings.render_text_as == 'image') {
      // don't convert text objects to HTML
      textFrames = [];
      textData = {html: '', styles: []};
    } else {
      progressBar.setTitle(docArtboardName + ': Generating text...');
      textFrames = getTextFramesByArtboard(activeArtboard, masks, settings);
      textData = convertTextFrames(textFrames, activeArtboard, settings);
    }

    progressBar.step();

    // ==========================
    // Generate artboard image(s)
    // ==========================

    if (isTrue(settings.write_image_files)) {
      progressBar.setTitle(docArtboardName + ': Capturing image...');
      imageData = convertArtItems(activeArtboard, textFrames, masks, settings);
    } else {
      imageData = {html: ''};
    }

    if (specialData) {
      imageData.html = specialData.video + specialData.html_before +
        imageData.html + specialData.html_after;
      forEach(specialData.layers, function(lyr) {
        lyr.visible = true;
      });
      if (specialData.video && !isTrue(settings.png_transparent)) {
        warn('Background videos may be covered up without png_transparent:true');
      }
    }

    progressBar.step();

    //=====================================
    // Finish generating artboard HTML and CSS
    //=====================================

    artboardContent.html += '\r\t<!-- Artboard: ' + getArtboardName(activeArtboard) + ' -->\r' +
       generateArtboardDiv(activeArtboard, settings) +
       imageData.html +
       textData.html +
       '\t</div>\r';

    var abStyles = textData.styles;
    if (specialData && specialData.video) {
      // make videos tap/clickable (so they can be played manually if autoplay
      // is disabled, e.g. in mobile low-power mode).
      abStyles.push('> div { pointer-events: none; }\r');
      abStyles.push('> img { pointer-events: none; }\r');
    }
    artboardContent.css += generateArtboardCss(activeArtboard, abStyles, settings);

    var oname = settings.output == 'one-file' ? getRawDocumentName() : docArtboardName;
    // kludge to identify legacy embed projects
    if (settings.output == 'one-file' &&
        settings.project_type == 'ai2html' &&
        !isTrue(settings.create_json_config_files)) {
      oname = 'index';
    }
    assignArtboardContentToFile(oname, artboardContent, fileContentArr);

  }); // end artboard loop

  if (fileContentArr.length === 0) {
    error('No usable artboards were found');
  }

  //=====================================
  // Output html file(s)
  //=====================================

  forEach(fileContentArr, function(fileContent) {
    addCustomContent(fileContent, customBlocks);
    generateOutputHtml(fileContent, fileContent.name, settings);
  });

  //=====================================
  // Post-output operations
  //=====================================

  if (isTrue(settings.create_json_config_files)) {
    // Create JSON config files, one for each .ai file
    var jsonStr = generateJsonSettingsFileContent(settings);
    var jsonPath = docPath + getRawDocumentName() + '.json';
    saveTextFile(jsonPath, jsonStr);
  } else if (isTrue(settings.create_config_file)) {
    // Create one top-level config.yml file
    // (This is being replaced by multiple JSON config files for NYT projects)
    var yamlPath = docPath + (settings.config_file_path || 'config.yml'),
        yamlStr = generateYamlFileContent(settings);
    checkForOutputFolder(yamlPath.replace(/[^\/]+$/, ''), 'configFileFolder');
    saveTextFile(yamlPath, yamlStr);
  }

  if (settings.cache_bust_token) {
    incrementCacheBustToken(settings);
  }

} // end render()



// =====================================
// ai2html specific utility functions
// =====================================


} // end main() function definition
main();
