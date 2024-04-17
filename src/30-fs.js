// ==================================
// fs - file manupulation
// ==================================

AI2HTML = AI2HTML || {};
/** @global */
AI2HTML.fs = AI2HTML.fs || {};

(function() {
  
  var log = AI2HTML.logger;
  
  function warn(str) { log.warn(str); }
  function error(str) { log.error(str); }
  function message() { log.message.apply(log, arguments); }
  
  // instead of the usual updateGlobals pattern, since it's sparsely used
  function getDocPath() {
    return AI2HTML.docPath;
  }
  
  function checkForOutputFolder(folderPath, nickname) {
    var outputFolder = new Folder( folderPath );
    if (!outputFolder.exists) {
      var outputFolderCreated = outputFolder.create();
      if (outputFolderCreated) {
        message('The ' + nickname + ' folder did not exist, so the folder was created.');
      } else {
        warn('The ' + nickname + ' folder did not exist and could not be created.');
      }
    }
  }
  
  
  // Write an HTML page to a file for NYT Preview
  function outputLocalPreviewPage(textForFile, localPreviewDestination, settings) {
    var localPreviewTemplateText = readTextFile(getDocPath() + settings.local_preview_template);
    settings.ai2htmlPartial = textForFile; // TODO: don't modify global settings this way
    var localPreviewHtml = _.applyTemplate(localPreviewTemplateText, settings);
    saveTextFile(localPreviewDestination, localPreviewHtml);
  }

  // output json file
  function saveOutputJson(jsonData, pageName, settings) {
    var textForFile;
    var jsonFileDestinationFolder, jsonFileDestination;
    
    textForFile = JSON.stringify(jsonData, null, 2);
    jsonFileDestinationFolder = getDocPath() + settings.html_output_path;
    checkForOutputFolder(jsonFileDestinationFolder, 'html_output_path');
    jsonFileDestination = jsonFileDestinationFolder + pageName + '.json';
    
    // write file
    saveTextFile(jsonFileDestination, textForFile);
    
  }
  
  
  function deleteFile(path) {
    var file = new File(path);
    if (file.exists) {
      file.remove();
    }
  }
  
  
  
  // TODO: improve
  // (currently ignores bracketed sections of the config file)
  function readGitConfigFile(path) {
    var file = new File(path);
    var o = null;
    var parts;
    if (file.exists) {
      o = {};
      file.open('r');
      while(!file.eof) {
        parts = file.readln().split('=');
        if (parts.length > 1) {
          o[_.trim(parts[0])] = _.trim(parts[1]);
        }
      }
      file.close();
    }
    return o;
  }
  
  function readFile(fpath, enc) {
    var content = null;
    var file = new File(fpath);
    if (file.exists) {
      if (enc) {
        file.encoding = enc;
      }
      file.open('r');
      if (file.error) {
        // (on macos) restricted permissions will cause an error here
        warn('Unable to open ' + file.fsName + ': [' + file.error + ']');
        return null;
      }
      content = file.read();
      file.close();
      // (on macos) 'file.length' triggers a file operation that returns -1 if unable to access file
      if (!content && (file.length > 0 || file.length == -1)) {
        warn('Unable to read from ' + file.fsName + ' (reported size: ' + file.length + ' bytes)');
      }
    } else {
      warn(fpath + ' could not be found.');
    }
    return content;
  }
  
  function readTextFile(fpath) {
    // This function used to use File#eof and File#readln(), but
    // that failed to read the last line when missing a final newline.
    return readFile(fpath, 'UTF-8') || '';
  }
  
  function saveTextFile(dest, contents) {
    var fd = new File(dest);
    fd.open('w', 'TEXT', 'TEXT');
    fd.lineFeed = 'Unix';
    fd.encoding = 'UTF-8';
    fd.writeln(contents);
    fd.close();
  }
  
  
  function generateJsonSettingsFileContent(settings) {
    var o = getCommonOutputSettings(settings);
    _.forEach(settings.config_file, function(key) {
      var val = String(settings[key]);
      if (_.isTrue(val)) val = true;
      else if (_.isFalse(val)) val = false;
      o[key] = val;
    });
    return JSON.stringify(o, null, 2);
  }

// Create a settings file (optimized for the NYT Scoop CMS)
  function generateYamlFileContent(settings) {
    var o = getCommonOutputSettings(settings);
    var lines = [];
    lines.push('ai2html_version: ' + settings.scriptVersion);
    if (settings.project_type) {
      lines.push('project_type: ' + settings.project_type);
    }
    lines.push('type: ' + o.type);
    lines.push('tags: ' + o.tags);
    lines.push('min_width: ' + o.min_width);
    lines.push('max_width: ' + o.max_width);
    if (_.isTrue(settings.dark_mode_compatible)) {
      // kludge to output YAML array value for one setting
      lines.push('display_overrides:\n  - DARK_MODE_COMPATIBLE');
    }
    
    _.forEach(settings.config_file, function(key) {
      var value = _.trim(String(settings[key]));
      var useQuotes = value === '' || /\s/.test(value);
      if (key == 'show_in_compatible_apps') {
        // special case: this setting takes quoted 'yes' or 'no'
        useQuotes = true; // assuming value is 'yes' or 'no';
        value = _.isTrue(value) ? 'yes' : 'no';
      }
      if (useQuotes) {
        value = JSON.stringify(value); // wrap in quotes and escape internal quotes
      } else if (_.isTrue(value) || _.isFalse(value)) {
        // use standard values for boolean settings
        value = _.isTrue(value) ? 'true' : 'false';
      }
      lines.push(key + ': ' + value);
    });
    return lines.join('\n');
  }
  
  
  
  AI2HTML.fs = {
    checkForOutputFolder: checkForOutputFolder,
    outputLocalPreviewPage: outputLocalPreviewPage,
    saveOutputJson: saveOutputJson,
    deleteFile: deleteFile,
    readGitConfigFile: readGitConfigFile,
    readFile: readFile,
    readTextFile: readTextFile,
    saveTextFile: saveTextFile,
    generateJsonSettingsFileContent: generateJsonSettingsFileContent,
    generateYamlFileContent: generateYamlFileContent
  
  }
  

})();
