// Path: src/index.js

(function main() {
// Enclosing scripts in a named function (and not an anonymous, self-executing
// function) has been recommended as a way to minimise intermittent "MRAP" errors.
// (This advice may be superstitious, need more evidence to decide.)
// See (for example) https://forums.adobe.com/thread/1810764 and
// http://wwwimages.adobe.com/content/dam/Adobe/en/devnet/pdf/illustrator/scripting/Readme.txt
  
  var log = AI2HTML.logger;
  
  function warn(str) { log.warn(str); }
  function error(str) { log.error(str); }
  function message() { log.message.apply(log, arguments); }
  
  
  // If running in Node.js, export functions for testing and exit
  if (AI2HTML.testing.runningInNode()) {
    AI2HTML.testing.exportFunctionsForTesting();
    return;
  }
  
  // ================================
  // Global variable declarations
  // ================================
  _.extend(AI2HTML, {
    nameSpace: 'g-',
    doc: undefined,
    docPath: undefined,
    docSlug: undefined,
    docIsSaved: false,
    isNYT: false,
  });
  
  // variables that are only used in this file
  var docSettings;
  var progressBar;
  
  AI2HTML.init = function() {
    
    var settings = AI2HTML.settings;
    var ai = AI2HTML.ai;
  
    var startTime = +new Date();
    var textBlockData;
    
    try {
      if (!settings.isTestedIllustratorVersion(app.version)) {
        warn('Ai2html has not been tested on this version of Illustrator.');
      }
      if (!app.documents.length) {
        error('No documents are open');
      }
      
      if (!String(app.activeDocument.fullName)) {
        error('Ai2html is unable to run because Illustrator is confused by this document\'s file path.' +
          ' Does the path contain any forward slashes or other unusual characters?');
      }
      if (!String(app.activeDocument.path)) {
        error('You need to save your Illustrator file before running this script');
      }
      if (app.activeDocument.documentColorSpace != DocumentColorSpace.RGB) {
        error('You should change the document color mode to "RGB" before running ai2html (File>Document Color Mode>RGB Color).');
      }
      if (app.activeDocument.activeLayer.name == 'Isolation Mode') {
        error('Ai2html is unable to run because the document is in Isolation Mode.');
      }
      if (app.activeDocument.activeLayer.name == '<Opacity Mask>' && app.activeDocument.layers.length == 1) {
        // TODO: find a better way to detect this condition (mask can be renamed)
        error('Ai2html is unable to run because you are editing an Opacity Mask.');
      }
      
      // initialize script settings
      this.doc = app.activeDocument;
      this.docPath = this.doc.path + '/';
      
      settings.updateGlobals(); // doc and docPath
      ai.updateGlobals();
      
      this.docIsSaved = this.doc.saved;
      textBlockData = settings.initSpecialTextBlocks();
      docSettings = settings.initDocumentSettings(textBlockData.settings);
      this.nameSpace = docSettings.namespace || this.nameSpace;
      this.docSlug = docSettings.project_name || ai.makeDocumentSlug(ai.getRawDocumentName());
      settings.extendFontList(AI2HTML.defaults.fonts, docSettings.fonts || []);
      this.isNYT = settings.detectTimesFonts();
      
      if (!textBlockData.settings && _.isTrue(docSettings.create_settings_block)) {
        settings.createSettingsBlock(docSettings);
      }
      
      ai.updateGlobals(); // again, in case fonts are updated
      
      // render the document
      this.render(docSettings, textBlockData.code);
      message(settings);
      
    } catch(e) {
      error(log.formatError(e));
    }
    
    settings.restoreDocumentState();
    
    if (progressBar) progressBar.close();

    // ==========================================
    // Save the AI document (if needed)
    // ==========================================
    
    if (this.docIsSaved) {
      // If document was originally in a saved state, reset the document's
      // saved flag (the document goes to unsaved state during the script,
      // because of unlocking / relocking of objects
      this.doc.saved = true;
    } else if (!log.hasErrors()) {
      var saveOptions = new IllustratorSaveOptions();
      saveOptions.pdfCompatible = false;
      this.doc.saveAs(new File(this.docPath + this.doc.name), saveOptions);
      // doc.save(); // why not do this? (why set pdfCompatible = false?)
      message('Your Illustrator file was saved.');
    }

    // =========================================================
    // Show alert box, optionally prompt to generate promo image
    // =========================================================
    if (log.hasErrors()) {
      log.showCompletionAlert();
      
    } else if (_.isTrue(docSettings.show_completion_dialog_box )) {
      message('Script ran in', ((+new Date() - startTime) / 1000).toFixed(1), 'seconds');
      var promptForPromo = _.isTrue(docSettings.write_image_files) && _.isTrue(docSettings.create_promo_image);
      var showPromo = log.showCompletionAlert(promptForPromo);
      if (showPromo) ai.createPromoImage(docSettings);
    }
    
  
  }
  
  AI2HTML.render = function(settings, customBlocks) {
    
    var ai = AI2HTML.ai;
    var that = this;
    
    // warn about duplicate artboard names
    AI2HTML.settings.validateArtboardNames(docSettings);
    
    // Fix for issue #50
    // If a text range is selected when the script runs, it interferes
    // with script-driven selection. The fix is to clear this kind of selection.
    if (this.doc.selection && this.doc.selection.typename) {
      ai.clearSelection();
    }
    
    // ================================================
    // Generate HTML, CSS and images for each artboard
    // ================================================
    progressBar = new ProgressBar({name: 'Ai2html progress', steps: calcProgressBarSteps()});
    ai.unlockObjects(); // Unlock containers and clipping masks
    var masks = ai.findMasks(); // identify all clipping masks and their contents
    var fileContentArr = [];
    
    ai.forEachUsableArtboard(function(activeArtboard, abIndex) {
      var abSettings = ai.getArtboardSettings(activeArtboard);
      var docArtboardName = ai.getDocumentArtboardName(activeArtboard);
      var textFrames, textData, imageData, specialData;
      var artboardContent = {html: '', css: '', js: ''};
      
      that.doc.artboards.setActiveArtboardIndex(abIndex);
      
      // detect videos and other special layers
      specialData = ai.convertSpecialLayers(activeArtboard, settings);
      if (specialData) {
        _.forEach(specialData.layers, function(lyr) {
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
        textFrames = ai.getTextFramesByArtboard(activeArtboard, masks, settings);
        textData = ai.convertTextFrames(textFrames, activeArtboard, settings);
      }
      
      progressBar.step();
      
      // ==========================
      // Generate artboard image(s)
      // ==========================
      
      if (_.isTrue(settings.write_image_files)) {
        progressBar.setTitle(docArtboardName + ': Capturing image...');
        imageData = ai.convertArtItems(activeArtboard, textFrames, masks, settings);
      } else {
        imageData = {html: ''};
      }
      
      if (specialData) {
        imageData.html = specialData.video + specialData.html_before +
          imageData.html + specialData.html_after;
          _.forEach(specialData.layers, function(lyr) {
            lyr.visible = true;
          });
        if (specialData.video && !_.isTrue(settings.png_transparent)) {
          warn('Background videos may be covered up without png_transparent:true');
        }
      }
      
      progressBar.step();
      
      //=====================================
      // Finish generating artboard HTML and CSS
      //=====================================
      
      artboardContent.html += '\r\t<!-- Artboard: ' + ai.getArtboardName(activeArtboard) + ' -->\r' +
        ai.generateArtboardDiv(activeArtboard, settings) +
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
      artboardContent.css += ai.generateArtboardCss(activeArtboard, abStyles, settings);
      
      var oname = settings.output == 'one-file' ? ai.getRawDocumentName() : docArtboardName;
      // kludge to identify legacy embed projects
      if (settings.output == 'one-file' &&
        settings.project_type == 'ai2html' &&
        !_.isTrue(settings.create_json_config_files)) {
        oname = 'index';
      }
      ai.assignArtboardContentToFile(oname, artboardContent, fileContentArr);
      
    }); // end artboard loop
    
    if (fileContentArr.length === 0) {
      error('No usable artboards were found');
    }
    
    //=====================================
    // Output html file(s)
    //=====================================
    
    _.forEach(fileContentArr, function(fileContent) {
      ai.addCustomContent(fileContent, customBlocks);
      progressBar.setTitle('Writing HTML output...');
      ai.generateOutputHtml(fileContent, fileContent.name, settings);
    });
    
    //=====================================
    // Post-output operations
    //=====================================
    
    if (_.isTrue(settings.create_json_config_files)) {
      // Create JSON config files, one for each .ai file
      var jsonStr = ai.generateJsonSettingsFileContent(settings);
      var jsonPath = this.docPath + ai.getRawDocumentName() + '.json';
      ai.saveTextFile(jsonPath, jsonStr);
    } else if (_.isTrue(settings.create_config_file)) {
      // Create one top-level config.yml file
      // (This is being replaced by multiple JSON config files for NYT projects)
      var yamlPath = this.docPath + (settings.config_file_path || 'config.yml'),
        yamlStr = ai.generateYamlFileContent(settings);
      ai.checkForOutputFolder(yamlPath.replace(/[^\/]+$/, ''), 'configFileFolder');
      ai.saveTextFile(yamlPath, yamlStr);
    }
    
    if (settings.cache_bust_token) {
      AI2HTML.settings.incrementCacheBustToken(settings);
    }
    
  } // end render()
  
  
  
  function ProgressBar(opts) {
    opts = opts || {};
    var steps = opts.steps || 0;
    var step = 0;
    var win = new Window("palette", opts.name || "Progress", [150, 150, 600, 260]);
    win.pnl = win.add("panel", [10, 10, 440, 100], "Progress");
    win.pnl.progBar = win.pnl.add("progressbar", [20, 35, 410, 60], 0, 100);
    win.pnl.progBarLabel = win.pnl.add("statictext", [20, 20, 320, 35], "0%");
    win.show();
    
    // function getProgress() {
    //   return win.pnl.progBar.value/win.pnl.progBar.maxvalue;
    // }
    
    function update() {
      win.update();
    }
    
    this.step = function () {
      step = Math.min(step + 1, steps);
      this.setProgress(step / steps);
    };
    
    this.setProgress = function (progress) {
      var max = win.pnl.progBar.maxvalue;
      // progress is always 0.0 to 1.0
      var pct = progress * max;
      win.pnl.progBar.value = pct;
      win.pnl.progBarLabel.text = Math.round(pct) + "%";
      update();
    };
    
    this.setTitle = function (title) {
      win.pnl.text = title;
      update();
    };
    
    this.close = function () {
      win.close();
    };
  }
  
  function calcProgressBarSteps() {
    var n = 0;
    AI2HTML.ai.forEachUsableArtboard(function() {
      n += 2;
    });
    return n;
  }
  
  
  // KICKOFF!
  AI2HTML.init();
  
})();




// get doc references


// ingest settings block from doc and defaults


// parse to json


// parse to html or svelte


// write to file


