
// ==================================
// ai2html utils for testing subfunctions in Node.js
// ==================================

AI2HTML = AI2HTML || {};
AI2HTML.testing = AI2HTML.testing || {};

(function() {
  function runningInNode() {
    return (typeof module != 'undefined') && !!module.exports;
  }
  
  // Add internal functions to module.exports for testing in Node.js
  function exportFunctionsForTesting() {
    
    var ai = AI2HTML.ai;
    var settings = AI2HTML.settings;
    var fs = AI2HTML.fs;
    
    module.exports = {
      testBoundsIntersection: ai.testBoundsIntersection,
      trim: _.trim,
      stringToLines: _.stringToLines,
      contains: _.contains,
      arraySubtract: _.arraySubtract,
      firstBy: _.firstBy,
      zeroPad: _.zeroPad,
      roundTo: _.roundTo,
      pathJoin: _.pathJoin,
      pathSplit: _.pathSplit,
      folderExists: _.folderExists,
      formatCss: ai.formatCss,
      getCssColor: _.getCssColor,
      readGitConfigFile: fs.readGitConfigFile,
      readYamlConfigFile: settings.readYamlConfigFile,
      applyTemplate: _.applyTemplate,
      cleanHtmlText: _.cleanHtmlText,
      encodeHtmlEntities: _.encodeHtmlEntities,
      addEnclosingTag: _.addEnclosingTag,
      stripTag: _.stripTag,
      cleanCodeBlock: settings.cleanCodeBlock,
      findHtmlTag: _.findHtmlTag,
      cleanHtmlTags: html.cleanHtmlTags,
      parseDataAttributes: ai.parseDataAttributes,
      parseObjectName: ai.parseObjectName,
      cleanObjectName: ai.cleanObjectName,
      uniqAssetName: ai.uniqAssetName,
      replaceSvgIds: ai.replaceSvgIds,
      compareVersions: settings.compareVersions
    };
    
  }
  
  AI2HTML.testing = {
    runningInNode: runningInNode,
    exportFunctionsForTesting: exportFunctionsForTesting
  };
  
})();

