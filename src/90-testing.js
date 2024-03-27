
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
    
    module.exports = {
      testBoundsIntersection: testBoundsIntersection,
      trim: trim,
      stringToLines: stringToLines,
      contains: contains,
      arraySubtract: arraySubtract,
      firstBy: firstBy,
      zeroPad: zeroPad,
      roundTo: roundTo,
      pathJoin: pathJoin,
      pathSplit: pathSplit,
      folderExists: folderExists,
      formatCss: formatCss,
      getCssColor: getCssColor,
      readGitConfigFile: readGitConfigFile,
      readYamlConfigFile: readYamlConfigFile,
      applyTemplate: applyTemplate,
      cleanHtmlText: cleanHtmlText,
      encodeHtmlEntities: encodeHtmlEntities,
      addEnclosingTag: addEnclosingTag,
      stripTag: stripTag,
      cleanCodeBlock: cleanCodeBlock,
      findHtmlTag: findHtmlTag,
      cleanHtmlTags: cleanHtmlTags,
      parseDataAttributes: parseDataAttributes,
      parseObjectName: parseObjectName,
      cleanObjectName: cleanObjectName,
      uniqAssetName: uniqAssetName,
      replaceSvgIds: replaceSvgIds,
      compareVersions: compareVersions
    };
    
  }
  
  AI2HTML.testing = {
    runningInNode: runningInNode,
    exportFunctionsForTesting: exportFunctionsForTesting
  };
  
})();

