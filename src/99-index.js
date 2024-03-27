// Path: src/index.js
/** @global */
AI2HTML = AI2HTML || {};

function main() {
// Enclosing scripts in a named function (and not an anonymous, self-executing
// function) has been recommended as a way to minimise intermittent "MRAP" errors.
// (This advice may be superstitious, need more evidence to decide.)
// See (for example) https://forums.adobe.com/thread/1810764 and
// http://wwwimages.adobe.com/content/dam/Adobe/en/devnet/pdf/illustrator/scripting/Readme.txt
  
  
  
  // If running in Node.js, export functions for testing and exit
  if (AI2HTML.testing.runningInNode()) {
    AI2HTML.testing.exportFunctionsForTesting();
    return;
  }
  
  // ================================
  // Global variable declarations
  // ================================
  AI2HTML = {
    // This can be overridden by settings
    nameSpace: nameSpace = 'g-',
    // vars to hold warnings and informational messages at the end
    startTime: +new Date(),
    textFramesToUnhide: [],
    objectsToRelock: [],
    docSettings: undefined,
    textBlockData: undefined,
    doc: undefined,
    docPath: undefined,
    docSlug: undefined,
    docIsSaved: undefined,
    progressBar: undefined,
    JSON: undefined
  };
  
  AI2HTML.init = function() {
    
    try {
      if (!isTestedIllustratorVersion(app.version)) {
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
      this.docPath = doc.path + '/';
      this.docIsSaved = doc.saved;
      this.textBlockData = initSpecialTextBlocks();
      this.docSettings = initDocumentSettings(textBlockData.settings);
      this.docSlug = docSettings.project_name || makeDocumentSlug(getRawDocumentName());
      this.nameSpace = docSettings.namespace || nameSpace;
      extendFontList(fonts, this.docSettings.fonts || []);
      
      if (!textBlockData.settings && _.isTrue(docSettings.create_settings_block)) {
        createSettingsBlock(docSettings);
      }
      
      // render the document
      render(docSettings, textBlockData.code);
    } catch(e) {
      errors.push(formatError(e));
    }
    
    restoreDocumentState();
    if (progressBar) progressBar.close();

    // ==========================================
    // Save the AI document (if needed)
    // ==========================================
    
    if (docIsSaved) {
      // If document was originally in a saved state, reset the document's
      // saved flag (the document goes to unsaved state during the script,
      // because of unlocking / relocking of objects
      doc.saved = true;
    } else if (errors.length === 0) {
      var saveOptions = new IllustratorSaveOptions();
      saveOptions.pdfCompatible = false;
      doc.saveAs(new File(docPath + doc.name), saveOptions);
      // doc.save(); // why not do this? (why set pdfCompatible = false?)
      message('Your Illustrator file was saved.');
    }

    // =========================================================
    // Show alert box, optionally prompt to generate promo image
    // =========================================================
    if (errors.length > 0) {
      showCompletionAlert();
      
    } else if (_.isTrue(docSettings.show_completion_dialog_box )) {
      message('Script ran in', ((+new Date() - startTime) / 1000).toFixed(1), 'seconds');
      var promptForPromo = _.isTrue(docSettings.write_image_files) && _.isTrue(docSettings.create_promo_image);
      var showPromo = showCompletionAlert(promptForPromo);
      if (showPromo) createPromoImage(docSettings);
    }
    
    
    
    
    // get doc references
    
    
    // ingest settings block from doc and defaults
    
    
    // parse to json
    
    
    // parse to html or svelte
    
    
    // write to file
  
  }
  
  
  
  
  
}

main();

