

// ==================================
// ai2html program state and settings
// ==================================

AI2HTML = AI2HTML || {};
/** @global */
AI2HTML.settings = AI2HTML.settings || {};

(function() {
  
  var log = AI2HTML.logger;
  var defaults = AI2HTML.defaults;
  var textFramesToUnhide = [];
  var objectsToRelock = [];
  
  // globals (though it would be better to parameterize the functions instead)
  var doc, docPath;
  
  // call this function to update the global variables, they usually don't change
  function updateGlobals() {
    doc = AI2HTML.doc;
    docPath = AI2HTML.docPath;
  }
  
  function warn(str) { log.warn(str); }
  function error(str) { log.error(str); }
  function message() { log.message.apply(log, arguments); }
  
  
  function isTestedIllustratorVersion(version) {
    var majorNum = parseInt(version);
    return majorNum >= 18 && majorNum <= 28; // Illustrator CC 2014 through 2024
  }
  
  function validateArtboardNames(settings) {
    var names = [];
    AI2HTML.ai.forEachUsableArtboard(function (ab) {
      var name = AI2HTML.ai.getArtboardName(ab);
      var isDupe = _.contains(names, name);
      if (isDupe) {
        // kludge: modify settings if same-name artboards are found
        // (used to prevent duplicate image names)
        settings.grouped_artboards = true;
        if (settings.output == 'one-file') {
          log.warnOnce("Artboards should have unique names. \"" + name + "\" is duplicated.");
        } else {
          log.warnOnce("Found a group of artboards named \"" + name + "\".");
        }
        
      }
      names.push(name);
    });
  }
  
  function detectTimesFonts() {
    var found = false;
    try {
      found = !!(app.textFonts.getByName('NYTFranklin-Medium') && app.textFonts.getByName('NYTCheltenham-Medium'));
    } catch (e) {
    }
    return found;
  }
  
  function getScriptDirectory() {
    return new File($.fileName).parent;
  }
  
  function temporarilyHideTextFrame(textFrame) {
    textFramesToUnhide.push(textFrame);
    AI2HTML.ai.hideTextFrame(textFrame);
  }
  
  function temporarilyUnlockObject(obj) {
    objectsToRelock.push(obj);
    AI2HTML.ai.unlockObject(obj);
  }
  
  // Import program settings and custom html, css and js code from specially
  //   formatted text blocks
  function initSpecialTextBlocks() {
    var rxp = /^ai2html-(css|js|html|settings|text|html-before|html-after)\s*$/;
    var settings = null;
    var code = {};
    _.forEach(doc.textFrames, function (thisFrame) {
      // var contents = thisFrame.contents; // caused MRAP error in AI 2017
      var type = null;
      var match, lines;
      if (thisFrame.lines.length > 1) {
        match = rxp.exec(thisFrame.lines[0].contents);
        type = match ? match[1] : null;
      }
      if (!type) return; // not a special block
      if (AI2HTML.ai.objectIsHidden(thisFrame)) {
        if (type == 'settings') {
          error('Found a hidden ai2html-settings text block. Either delete or hide this settings block.');
        }
        warn('Skipping a hidden ' + match[0] + ' settings block.');
        return;
      }
      lines = _.stringToLines(thisFrame.contents);
      lines.shift(); // remove header
      // Reset the name of any non-settings text boxes with name ai2html-settings
      if (type != 'settings' && thisFrame.name == 'ai2html-settings') {
        thisFrame.name = '';
      }
      if (type == 'settings' || type == 'text') {
        settings = settings || {};
        if (type == 'settings') {
          // set name of settings block, so it can be found later using getByName()
          thisFrame.name = 'ai2html-settings';
        }
        parseSettingsEntries(lines, settings);
        
      } else { // import custom js, css and html blocks
        code[type] = code[type] || [];
        code[type].push(cleanCodeBlock(type, lines.join('\r')));
      }
      if (AI2HTML.ai.objectOverlapsAnArtboard(thisFrame)) {
        // An error will be thrown if trying to hide a text frame inside a
        // locked layer. Solution: unlock any locked parent layers.
        if (AI2HTML.ai.objectIsLocked(thisFrame)) {
          temporarilyUnlockObject(thisFrame);
        }
        temporarilyHideTextFrame(thisFrame);
      }
    });
    
    var htmlBlockCount = (code.html || []).length + (code['html-before'] || []).length +
      (code['html-after'] || []).length;
    if (code.css) {
      message("Custom CSS blocks: " + code.css.length);
    }
    // if (code.html) {message("Custom HTML blocks: " + code.html.length);}
    if (htmlBlockCount > 0) {
      message("Custom HTML blocks: " + htmlBlockCount);
    }
    if (code.js) {
      message("Custom JS blocks: " + code.js.length);
    }
    
    return {code: code, settings: settings};
  }
  
  // Derive ai2html program settings by merging default settings and overrides.
  function initDocumentSettings(textBlockSettings) {
    var settings = _.extend({}, defaults.defaultSettings); // copy default settings
    
    if (detectTimesEnv(textBlockSettings)) {
      // NYT settings are only applied in an NYTimes CMS context
      applyTimesSettings(settings, textBlockSettings);
    }
    
    // merge config file settings into @settings
    // TODO: handle inconsistent settings in text block and local config file
    // (currently the text block settings override config file settings... but
    //  this could result in default settings overriding custom settings)
    extendSettings(settings, readConfigFileSettings());
    
    // merge settings from text block
    // TODO: consider parsing strings to booleans when relevant, (e.g. "false" -> false)
    if (textBlockSettings) {
      for (var key in textBlockSettings) {
        if (key in settings === false) {
          warn("Settings block contains an unused parameter: " + key);
        }
        settings[key] = textBlockSettings[key];
      }
    }
    
    validateDocumentSettings(settings);
    return settings;
  }
  
  
  // Trigger errors and warnings for some common problems
  function validateDocumentSettings(settings) {
    if (_.isTrue(settings.include_resizer_classes)) {
      error("The include_resizer_classes option was removed. Please file a GitHub issue if you need this feature.");
    }
    
    if (!(settings.responsiveness == 'fixed' || settings.responsiveness == 'dynamic')) {
      warn('Unsupported "responsiveness" setting: ' + (settings.responsiveness || '[]'));
    }
  }
  
  function detectTimesEnv(blockSettings) {
    var nytFonts = detectTimesFonts();
    var nytProjectEnv = detectAiFolder() && (detectConfigYml() || detectBirdkitEnv());
    var nytEnv = nytFonts && nytProjectEnv;
    
    if (nytFonts && !nytProjectEnv) {
      if (confirm("You seem to be running ai2html outside of a NYT graphics project.\nContinue in non-NYT mode?", true)) {
        nytEnv = false;
      } else {
        error("Make sure your Illustrator file is inside the \u201Cai\u201D folder of a Preview or Birdkit project.");
      }
    }
    
    if (!nytFonts && nytProjectEnv) {
      if (confirm("Your system is missing the NYT fonts.\nContinue?", true)) {
        nytEnv = true;
      } else {
        error("Install the NYT Fonts and then re-run ai2html.");
      }
    }
    
    // detect incompatibility between text block settings and current context
    if (nytEnv && blockSettings && detectUnTimesianSettings(blockSettings)) {
      error('The settings block is incompatible with NYT Preview. Delete it and re-run ai2html.');
    }
    
    return nytEnv;
  }
  
  function detectBirdkitEnv() {
    var configPath = docPath + '../birdkit.config.js';
    return _.fileExists(configPath);
  }
  
  function applyBirdkitSettings(settings, projectType) {
    var packagePath = _.pathJoin(docPath, '..', 'package.json');
    var pkg = _.fileExists(packagePath) ? readJSONFile(packagePath) : {};
    
    // Is this a docless birdkit project? (assumes birdkit detected)
    var isEmbed = projectType == 'ai2html' || // manual setting from text block
      pkg.projectTemplate == '@newsdev/template-ai2html' ||
      // (deprecated) read from local ai2html-config.json file
      readConfigFileSettings().project_type == 'ai2html' ||
      // (deprecated) presence of 'config.yml' file indicates an embed
      detectConfigYml() ||
      // another test, to work around permissions issue preventing file reading
      !_.folderExists(docPath + '../src/');
    
    if (isEmbed) {
      extendSettings(settings, defaults.nytBirdkitEmbedSettings);
      // early versions of birdkit still used config.yml for embed settings
      if (pkg.version && compareVersions(pkg.version, '1.4.0') < 0) {
        settings.create_json_config_files = false;
        settings.create_config_file = true;
        settings.config_file_path = "../config.yml";
      }
    } else {
      extendSettings(settings, defaults.nytBirdkitSettings);
    }
  }
  
  // assumes three-part version, e.g. 1.5.0
  function compareVersions(a, b) {
    a = _.map(a.split('.'), parseFloat);
    b = _.map(b.split('.'), parseFloat);
    var diff = a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || 0;
    return (diff < 0 && -1) || (diff > 0 && 1) || 0;
  }
  
  function detectAiFolder() {
    return /\/ai\/?$/.test(docPath);
  }
  
  function detectConfigYml() {
    return _.fileExists(docPath + '../config.yml');
  }
  
  function detectUnTimesianSettings(o) {
    return o.html_output_path == defaults.defaultSettings.html_output_path;
  }
  
  function applyTimesSettings(settings, blockSettings) {
    var yamlConfig = readYamlConfigFile(docPath + '../config.yml') || null;
    // project type can be set manually in the text block settings
    var projectType = blockSettings && blockSettings.project_type || null;
    extendSettings(settings, defaults.nytOverrideSettings);
    
    if (detectBirdkitEnv()) {
      applyBirdkitSettings(settings, projectType);
      
    } else if (detectConfigYml()) {
      // assume this is a legacy preview project
      if (!yamlConfig) {
        warn('ai2html is unable to read the contents of config.yml');
      }
      if (projectType == 'ai2html' || (yamlConfig && yamlConfig.project_type == 'ai2html')) {
        extendSettings(settings, defaults.nytPreviewEmbedSettings);
      } else {
        extendSettings(settings, defaults.nytPreviewSettings);
      }
      if (yamlConfig && yamlConfig.scoop_slug) {
        settings.scoop_slug_from_config_yml = yamlConfig.scoop_slug;
      }
      // Read .git/config file to get preview slug
      var gitConfig = readGitConfigFile(docPath + "../.git/config") || {};
      if (gitConfig.url) {
        settings.preview_slug = gitConfig.url.replace(/^[^:]+:/, "").replace(/\.git$/, "");
      }
    }
    
    if (!_.folderExists(docPath + '../public/')) {
      error("Your project seems to be missing a \u201Cpublic\u201D folder.");
    }
    
    if (!settings.project_type) {
      error("ai2html is unable to determine the type of this project.");
    } else if (settings.project_type != 'ai2html' && !_.folderExists(docPath + '../src/')) {
      error("This seems to be a " + settings.project_type + " type project, but it is missing the expected \u201Csrc\u201D folder.");
    }
  }
  
  function extendSettings(settings, moreSettings) {
    var tmp = settings.fonts || [];
    _.extend(settings, moreSettings);
    // merge fonts, don't replace them
    if (moreSettings.fonts) {
      extendFontList(tmp, moreSettings.fonts);
    }
    settings.fonts = tmp;
  }
  
  // Looks for settings file in the ai2html script directory and/or the .ai document directory
  function readConfigFileSettings() {
    var settingsFile = 'ai2html-config.json';
    var globalPath = _.pathJoin(getScriptDirectory(), settingsFile);
    var localPath = _.pathJoin(docPath, settingsFile);
    var globalSettings = _.fileExists(globalPath) ? readSettingsFile(globalPath) : {};
    var localSettings = _.fileExists(localPath) ? readSettingsFile(localPath) : {};
    return _.extend({}, globalSettings, localSettings);
  }
  
  function stripSettingsFileComments(str) {
    var rxp = /\/\/.*/g;
    return str.replace(rxp, '');
  }
  
  // Expects that @path points to a text file containing a JavaScript object
  // with settings to override the default ai2html settings.
  function readSettingsFile(path) {
    var o = {}, str;
    try {
      str = stripSettingsFileComments(AI2HTML.ai.readTextFile(path));
      o = JSON.parse(str);
    } catch (e) {
      warn('Error reading settings file ' + path + ': [' + e.message + ']');
    }
    return o;
  }
  
  function extendFontList(a, b) {
    var index = {};
    _.forEach(a, function (o, i) {
      index[o.aifont] = i;
    });
    _.forEach(b, function (o) {
      if (o.aifont && o.aifont in index) {
        a[index[o.aifont]] = o; // replace
      } else {
        a.push(o); // add
      }
    });
  }
  
  
  // Clean the contents of custom JS, CSS and HTML blocks
  // (e.g. undo Illustrator's automatic quote conversion, where applicable)
  function cleanCodeBlock(type, raw) {
    var clean = '';
    if (type.indexOf('html') >= 0) {
      clean = _.cleanHtmlText(_.straightenCurlyQuotesInsideAngleBrackets(raw));
    } else if (type == 'js') {
      // TODO: consider preserving curly quotes inside quoted strings
      clean = _.straightenCurlyQuotes(raw);
      clean = _.addEnclosingTag('script', clean);
    } else if (type == 'css') {
      clean = _.straightenCurlyQuotes(raw);
      clean = _.stripTag('style', clean);
    }
    return clean;
  }
  
  function createSettingsBlock(settings) {
    var bounds = getAllArtboardBounds();
    var fontSize = 15;
    var leading = 19;
    var extraLines = 6;
    var width = 400;
    var left = bounds[0] - width - 50;
    var top = bounds[1];
    var settingsLines = ["ai2html-settings"];
    var layer, rect, textArea, height;
    
    _.forEach(settings.settings_block, function (key) {
      settingsLines.push(key + ": " + settings[key]);
    });
    
    try {
      layer = doc.layers.getByName("ai2html-settings");
      layer.locked = false;
    } catch (e) {
      layer = doc.layers.add();
      layer.zOrder(ZOrderMethod.BRINGTOFRONT);
      layer.name = "ai2html-settings";
    }
    
    height = leading * (settingsLines.length + extraLines);
    rect = layer.pathItems.rectangle(top, left, width, height);
    textArea = layer.textFrames.areaText(rect);
    textArea.textRange.autoLeading = false;
    textArea.textRange.characterAttributes.leading = leading;
    textArea.textRange.characterAttributes.size = fontSize;
    textArea.contents = settingsLines.join('\n');
    textArea.name = 'ai2html-settings';
    message("A settings text block was created to the left of all your artboards.");
    return textArea;
  }
  
  // Update an entry in the settings text block (or add a new entry if not found)
  function updateSettingsEntry(key, value) {
    var block = doc.textFrames.getByName('ai2html-settings');
    var entry = key + ': ' + value;
    var updated = false;
    var lines;
    if (!block) return;
    lines = _.stringToLines(block.contents);
    // one alternative to splitting contents into lines is to iterate
    //   over paragraphs, but an error is thrown when accessing an empty pg
    _.forEach(lines, function (line, i) {
      var data = parseSettingsEntry(line);
      if (!updated && data && data[0] == key) {
        lines[i] = entry;
        updated = true;
      }
    });
    if (!updated) {
      // entry not found; adding new entry at the top of the list,
      // so it will be visible if the content overflows the text frame
      lines.splice(1, 0, entry);
    }
    AI2HTML.docIsSaved = false; // doc has changed, need to save
    block.contents = lines.join('\n');
  }
  
  function parseSettingsEntry(str) {
    var entryRxp = /^([\w-]+)\s*:\s*(.*)$/;
    var match = entryRxp.exec(_.trim(str));
    if (!match) return null;
    return [match[1], _.straightenCurlyQuotesInsideAngleBrackets(match[2])];
  }
  
  // Add ai2html settings from a text block to a settings object
  function parseSettingsEntries(entries, settings) {
    _.forEach(entries, function (str) {
      var match = parseSettingsEntry(str);
      var key, value;
      if (!match) {
        if (str) warn("Malformed setting, skipping: " + str);
        return;
      }
      key = match[0];
      value = match[1];
      if (key == 'output') {
        // replace values from old versions of script with current values
        if (value == 'one-file-for-all-artboards' || value == 'preview-one-file') {
          value = 'one-file';
        }
        if (value == 'one-file-per-artboard' || value == 'preview-multiple-files') {
          value = 'multiple-files';
        }
      }
      if (key == "image_format") {
        value = parseAsArray(value);
      }
      settings[key] = value;
    });
  }
  
  function parseAsArray(str) {
    str = _.trim(str).replace(/[\s,]+/g, ',');
    return str.length === 0 ? [] : str.split(',');
  }
  
  
  function restoreDocumentState() {
    var i;
    for (i = 0; i < textFramesToUnhide.length; i++) {
      textFramesToUnhide[i].hidden = false;
    }
    for (i = objectsToRelock.length - 1; i >= 0; i--) {
      objectsToRelock[i].locked = true;
    }
  }
  
  
  
  function readYamlConfigFile(path) {
    return _.fileExists(path) ? parseYaml(AI2HTML.ai.readTextFile(path)) : null;
  }
  
  // Very simple Yaml parsing. Does not implement nested properties, arrays and other features
  // (This is adequate for reading a few top-level properties from NYT's config.yml file)
  function parseYaml(str) {
    // TODO: strip comments // var comment = /\s*/
    var o = {};
    var lines = _.stringToLines(str);
    for (var i = 0; i < lines.length; i++) {
      parseKeyValueString(lines[i], o);
    }
    return o;
  }
  
  
  function parseKeyValueString(str, o) {
    var dqRxp = /^"(?:[^"\\]|\\.)*"$/;
    var parts = str.split(':');
    var k, v;
    if (parts.length > 1) {
      k = _.trim(parts.shift());
      v = _.trim(parts.join(':'));
      if (dqRxp.test(v)) {
        v = JSON.parse(v); // use JSON library to parse quoted strings
      }
      o[k] = v;
    }
  }
  
  
  function readJSONFile(fpath) {
    var content = AI2HTML.ai.readTextFile(fpath);
    var json = null;
    if (!content) {
      // removing for now to avoid double warnings
      // warn('Unable to read contents of file: ' + fpath);
      return {};
    }
    try {
      json = JSON.parse(content);
    } catch(e) {
      error('Error parsing JSON from ' + fpath + ': [' + e.message + ']');
    }
    return json;
  }
  
  
  function incrementCacheBustToken(settings) {
    var c = settings.cache_bust_token;
    if (parseInt(c) != +c) {
      warn('cache_bust_token should be a positive integer');
    } else {
      updateSettingsEntry('cache_bust_token', +c + 1);
    }
  }
  
  AI2HTML.settings = {
    isTestedIllustratorVersion: isTestedIllustratorVersion,
    validateArtboardNames: validateArtboardNames,
    detectTimesFonts: detectTimesFonts,
    getScriptDirectory: getScriptDirectory,
    initSpecialTextBlocks: initSpecialTextBlocks,
    initDocumentSettings: initDocumentSettings,
    validateDocumentSettings: validateDocumentSettings,
    detectTimesEnv: detectTimesEnv,
    detectBirdkitEnv: detectBirdkitEnv,
    applyBirdkitSettings: applyBirdkitSettings,
    compareVersions: compareVersions,
    detectAiFolder: detectAiFolder,
    detectConfigYml: detectConfigYml,
    detectUnTimesianSettings: detectUnTimesianSettings,
    applyTimesSettings: applyTimesSettings,
    extendSettings: extendSettings,
    readConfigFileSettings: readConfigFileSettings,
    stripSettingsFileComments: stripSettingsFileComments,
    readSettingsFile: readSettingsFile,
    extendFontList: extendFontList,
    cleanCodeBlock: cleanCodeBlock,
    createSettingsBlock: createSettingsBlock,
    updateSettingsEntry: updateSettingsEntry,
    parseSettingsEntry: parseSettingsEntry,
    parseSettingsEntries: parseSettingsEntries,
    parseAsArray: parseAsArray,
    restoreDocumentState: restoreDocumentState,
    readYamlConfigFile: readYamlConfigFile,
    parseKeyValueString: parseKeyValueString,
    incrementCacheBustToken: incrementCacheBustToken,
    updateGlobals: updateGlobals
  };
  
}());
