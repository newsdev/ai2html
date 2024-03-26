AI2HTML.vars = AI2HTML.vars || {};

(function() {

  // ================================
  // Global variable declarations
  // ================================
  // This can be overridden by settings
  var nameSpace = 'g-';

  // vars to hold warnings and informational messages at the end
  var feedback = [];
  var warnings = [];
  var errors   = [];
  var oneTimeWarnings = [];
  var startTime = +new Date();
  
  var textFramesToUnhide = [];
  var objectsToRelock = [];
  
  var docSettings;
  var textBlockData;
  var doc, docPath, docSlug, docIsSaved;
  var progressBar;
  var JSON;

  AI2HTML.vars = {
    nameSpace: nameSpace,
    feedback: feedback,
    warnings: warnings,
    errors: errors,
    oneTimeWarnings: oneTimeWarnings,
    startTime: startTime,
    textFramesToUnhide: textFramesToUnhide,
    objectsToRelock: objectsToRelock,
    docSettings: docSettings,
    textBlockData: textBlockData,
    doc: doc,
    docPath: docPath,
    docSlug: docSlug,
    docIsSaved: docIsSaved,
    progressBar: progressBar,
    JSON: JSON
  };

})();
