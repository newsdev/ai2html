
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
    console.log('Exporting functions for testing');
    
    var ai = AI2HTML.ai;
    var settings = AI2HTML.settings;
    
    var testBoundsIntersection = ai.testBoundsIntersection;
    var trim = _.trim;
    var stringToLines = _.stringToLines;
    var contains = _.contains;
    var arraySubtract = _.arraySubtract;
    var firstBy = _.firstBy;
    var zeroPad = _.zeroPad;
    var roundTo = _.roundTo;
    var pathJoin = _.pathJoin;
    var pathSplit = _.pathSplit;
    var folderExists = ai.folderExists;
    var formatCss = _.formatCss;
    var getCssColor = _.getCssColor;
    var readGitConfigFile = ai.readGitConfigFile;
    var readYamlConfigFile = ai.readYamlConfigFile;
    var applyTemplate = _.applyTemplate;
    var cleanHtmlText = _.cleanHtmlText;
    var encodeHtmlEntities = _.encodeHtmlEntities;
    var addEnclosingTag = _.addEnclosingTag;
    var stripTag = _.stripTag;
    var cleanCodeBlock = settings.cleanCodeBlock;
    var findHtmlTag = _.findHtmlTag;
    var cleanHtmlTags = ai.cleanHtmlTags;
    var parseDataAttributes = ai.parseDataAttributes;
    var parseObjectName = ai.parseObjectName;
    var cleanObjectName = ai.cleanObjectName;
    var uniqAssetName = ai.uniqAssetName;
    var replaceSvgIds = ai.replaceSvgIds;
    var compareVersions = settings.compareVersions;
    
    [ testBoundsIntersection,
      trim,
      stringToLines,
      contains,
      arraySubtract,
      firstBy,
      zeroPad,
      roundTo,
      pathJoin,
      pathSplit,
      folderExists,
      formatCss,
      getCssColor,
      readGitConfigFile,
      readYamlConfigFile,
      applyTemplate,
      cleanHtmlText,
      encodeHtmlEntities,
      addEnclosingTag,
      stripTag,
      cleanCodeBlock,
      findHtmlTag,
      cleanHtmlTags,
      parseDataAttributes,
      parseObjectName,
      cleanObjectName,
      uniqAssetName,
      replaceSvgIds,
      compareVersions
    ].forEach(function(f) {
      module.exports[f.name] = f;
    });
  }
  
  AI2HTML.testing = {
    runningInNode: runningInNode,
    exportFunctionsForTesting: exportFunctionsForTesting
  };
  
})();

