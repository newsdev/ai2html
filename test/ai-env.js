
var fs = require('fs'),
    path = require('path');

// Add to global context of modules that require this module
Folder = _Folder;
File = _File;

function _Folder(path) {
  addGetter(this, 'exists', function() {
    var exists = false;
    try {
      exists = fs.statSync(path).isDirectory();
    } catch(e) {}
    return exists;
  });

  this.create = function() {
    // stub
  };
}

function _File(path) {
  var content,
      lineRxp;

  addGetter(this, 'exists', function() {
    var exists = false;
    try {
      exists = fs.statSync(path).isFile();
    } catch(e) {}
    return exists;
  });

  addGetter(this, 'eof', function() {
    return !lineRxp;
  });

  this.open = function(mode) {
    content = fs.readFileSync(path, 'utf8');
    lineRxp = /([^\n\r]*)(?:\r\n|\r|\n)?/g;
  };

  this.readln = function() {
    var match = lineRxp.exec(content);
    var retn = match[1];
    if (lineRxp.lastIndex >= content.length || !match || match[0].length === 0) {
      reset();
    }
    return match ? match[1] : "";
  };

  this.read = function() {
    this.open('r');
    return content;
  };

  this.close = function() {
    reset();
  };

  function reset() {
    content = null;
    lineRxp = null;
  }
}


function addGetter(o, name, func) {
  Object.defineProperty(o, name, {get: func});
}


module.exports = {
  Folder: Folder,
  File: File
};
