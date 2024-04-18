// ==================================
// ai2html feedback
// ==================================

AI2HTML = AI2HTML || {};
/** @global */
AI2HTML.logger = AI2HTML.logger || {};

(function() {
  
  var oneTimeWarnings = [];
  var feedback = [];
  var warnings = [];
  var errors = [];
  
  function formatError(e) {
    var msg;
    if (e.name == 'UserError') return e.message; // triggered by error() function
    msg = 'RuntimeError';
    if (e.line) msg += ' on line ' + e.line;
    if (e.message) msg += ': ' + e.message;
    return msg;
  }

// display debugging message in completion alert box
// (in debug mode)
  function message() {
    feedback.push(concatMessages(arguments));
  }
  
  function concatMessages(args) {
    var msg = '', arg;
    for (var i=0; i<args.length; i++) {
      arg = args[i];
      if (msg.length > 0) msg += ' ';
      if (typeof arg == 'object') {
        try {
          // json2.json implementation throws error if object contains a cycle
          // and many Illustrator objects have cycles.
          msg += JSON.stringify(arg);
        } catch(e) {
          msg += String(arg);
        }
      } else {
        msg += arg;
      }
    }
    return msg;
  }
  
  
  function warn(msg) {
    warnings.push(msg);
  }
  
  function error(msg) {
    var e = new Error(msg);
    e.name = 'UserError';
    AI2HTML.settings.restoreDocumentState();
    throw e;
  }

// id: optional identifier, for cases when the text for this type of warning may vary.
  function warnOnce(msg, id) {
    id = id || msg;
    if (!_.contains(oneTimeWarnings, id)) {
      warn(msg);
      oneTimeWarnings.push(id);
    }
  }
  
  function hasErrors() {
    return errors.length > 0;
  }
  
  
  // Show alert or prompt; return true if promo image should be generated
  function showCompletionAlert(showPrompt) {
    var rule = "\n================\n";
    var alertText, alertHed, makePromo;
    
    if (hasErrors()) {
      alertHed = "The Script Was Unable to Finish";
    } else if (AI2HTML.isNYT) {
      alertHed = "Actually, that\u2019s not half bad :)"; // &rsquo;
    } else {
      alertHed = "Nice work!";
    }
    alertText = makeList(errors, "Error", "Errors");
    alertText += makeList(warnings, "Warning", "Warnings");
    alertText += makeList(feedback, "Information", "Information");
    alertText += "\n";
    if (showPrompt) {
      alertText += rule + "Generate promo image?";
      // confirm(<msg>, false) makes "Yes" the default (at Baden's request).
      makePromo = confirm(alertHed + alertText, false);
    } else {
      alertText += rule + "ai2html v" + AI2HTML.defaults.scriptVersion;
      alert(alertHed + alertText);
      makePromo = false;
    }
    
    function makeList(items, singular, plural) {
      var list = "";
      if (items.length > 0) {
        list += "\r" + (items.length == 1 ? singular : plural) + rule;
        for (var i = 0; i < items.length; i++) {
          list += "\u2022 " + items[i] + "\r";
        }
      }
      return list;
    }
    
    return makePromo;
  }

  AI2HTML.logger = {
    message: message,
    warn: warn,
    error: error,
    warnOnce: warnOnce,
    formatError: formatError,
    hasErrors: hasErrors,
    showCompletionAlert: showCompletionAlert
  }


})();
