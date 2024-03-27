// adds Globally namespaced utility functions


/** @global */
var AI2HTML= {};

// adds JSON.stringify and JSON.parse to the global scope
function initJSON() {
  // Minified json2.js from https://github.com/douglascrockford/JSON-js
  // This code is in the public domain.
  // eslint-disable-next-line
  if(typeof JSON!=="object"){JSON={}}(function(){"use strict";var rx_one=/^[\],:{}\s]*$/;var rx_two=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;var rx_three=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;var rx_four=/(?:^|:|,)(?:\s*\[)+/g;var rx_escapable=/[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;var rx_dangerous=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;function f(n){return n<10?"0"+n:n}function this_value(){return this.valueOf()}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null};Boolean.prototype.toJSON=this_value;Number.prototype.toJSON=this_value;String.prototype.toJSON=this_value}var gap;var indent;var meta;var rep;function quote(string){rx_escapable.lastIndex=0;return rx_escapable.test(string)?'"'+string.replace(rx_escapable,function(a){var c=meta[a];return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+string+'"'}function str(key,holder){var i;var k;var v;var length;var mind=gap;var partial;var value=holder[key];if(value&&typeof value==="object"&&typeof value.toJSON==="function"){value=value.toJSON(key)}if(typeof rep==="function"){value=rep.call(holder,key,value)}switch(typeof value){case"string":return quote(value);case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null"}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==="[object Array]"){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||"null"}v=partial.length===0?"[]":gap?"[\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"]":"["+partial.join(",")+"]";gap=mind;return v}if(rep&&typeof rep==="object"){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==="string"){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}v=partial.length===0?"{}":gap?"{\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"}":"{"+partial.join(",")+"}";gap=mind;return v}}if(typeof JSON.stringify!=="function"){meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"};JSON.stringify=function(value,replacer,space){var i;gap="";indent="";if(typeof space==="number"){for(i=0;i<space;i+=1){indent+=" "}}else if(typeof space==="string"){indent=space}rep=replacer;if(replacer&&typeof replacer!=="function"&&(typeof replacer!=="object"||typeof replacer.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":value})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k;var v;var value=holder[key];if(value&&typeof value==="object"){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v}else{delete value[k]}}}}return reviver.call(holder,key,value)}text=String(text);rx_dangerous.lastIndex=0;if(rx_dangerous.test(text)){text=text.replace(rx_dangerous,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(rx_one.test(text.replace(rx_two,"@").replace(rx_three,"]").replace(rx_four,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}})(); // jshint ignore:line
}
initJSON();


// Simple interface to help find performance bottlenecks. Usage:
// T.start('<label>');
// ...
// T.stop('<label>'); // prints a message in the final popup window
//
/** @global */
var T = {
  times: {},
  start: function(key) {
    if (key in T.times) return;
    T.times[key] = +new Date();
  },
  stop: function(key) {
    var startTime = T.times[key];
    var elapsed = roundTo((+new Date() - startTime) / 1000, 1);
    delete T.times[key];
    message(key + ' - ' + elapsed + 's');
  }
};



// =================================
// JS utility functions, not underscore or lodash but using the namespace "_"
// =================================

/** @global */
var _ = {};

// html entity substitution
_.basicCharacterReplacements = [["\x26", "&amp;"], ["\x22", "&quot;"], ["\x3C", "&lt;"], ["\x3E", "&gt;"]];
_.extraCharacterReplacements = [["\xA0", "&nbsp;"], ["\xA1", "&iexcl;"], ["\xA2", "&cent;"], ["\xA3", "&pound;"], ["\xA4", "&curren;"], ["\xA5", "&yen;"], ["\xA6", "&brvbar;"], ["\xA7", "&sect;"], ["\xA8", "&uml;"], ["\xA9", "&copy;"], ["\xAA", "&ordf;"], ["\xAB", "&laquo;"], ["\xAC", "&not;"], ["\xAD", "&shy;"], ["\xAE", "&reg;"], ["\xAF", "&macr;"], ["\xB0", "&deg;"], ["\xB1", "&plusmn;"], ["\xB2", "&sup2;"], ["\xB3", "&sup3;"], ["\xB4", "&acute;"], ["\xB5", "&micro;"], ["\xB6", "&para;"], ["\xB7", "&middot;"], ["\xB8", "&cedil;"], ["\xB9", "&sup1;"], ["\xBA", "&ordm;"], ["\xBB", "&raquo;"], ["\xBC", "&frac14;"], ["\xBD", "&frac12;"], ["\xBE", "&frac34;"], ["\xBF", "&iquest;"], ["\xD7", "&times;"], ["\xF7", "&divide;"], ["\u0192", "&fnof;"], ["\u02C6", "&circ;"], ["\u02DC", "&tilde;"], ["\u2002", "&ensp;"], ["\u2003", "&emsp;"], ["\u2009", "&thinsp;"], ["\u200C", "&zwnj;"], ["\u200D", "&zwj;"], ["\u200E", "&lrm;"], ["\u200F", "&rlm;"], ["\u2013", "&ndash;"], ["\u2014", "&mdash;"], ["\u2018", "&lsquo;"], ["\u2019", "&rsquo;"], ["\u201A", "&sbquo;"], ["\u201C", "&ldquo;"], ["\u201D", "&rdquo;"], ["\u201E", "&bdquo;"], ["\u2020", "&dagger;"], ["\u2021", "&Dagger;"], ["\u2022", "&bull;"], ["\u2026", "&hellip;"], ["\u2030", "&permil;"], ["\u2032", "&prime;"], ["\u2033", "&Prime;"], ["\u2039", "&lsaquo;"], ["\u203A", "&rsaquo;"], ["\u203E", "&oline;"], ["\u2044", "&frasl;"], ["\u20AC", "&euro;"], ["\u2111", "&image;"], ["\u2113", ""], ["\u2116", ""], ["\u2118", "&weierp;"], ["\u211C", "&real;"], ["\u2122", "&trade;"], ["\u2135", "&alefsym;"], ["\u2190", "&larr;"], ["\u2191", "&uarr;"], ["\u2192", "&rarr;"], ["\u2193", "&darr;"], ["\u2194", "&harr;"], ["\u21B5", "&crarr;"], ["\u21D0", "&lArr;"], ["\u21D1", "&uArr;"], ["\u21D2", "&rArr;"], ["\u21D3", "&dArr;"], ["\u21D4", "&hArr;"], ["\u2200", "&forall;"], ["\u2202", "&part;"], ["\u2203", "&exist;"], ["\u2205", "&empty;"], ["\u2207", "&nabla;"], ["\u2208", "&isin;"], ["\u2209", "&notin;"], ["\u220B", "&ni;"], ["\u220F", "&prod;"], ["\u2211", "&sum;"], ["\u2212", "&minus;"], ["\u2217", "&lowast;"], ["\u221A", "&radic;"], ["\u221D", "&prop;"], ["\u221E", "&infin;"], ["\u2220", "&ang;"], ["\u2227", "&and;"], ["\u2228", "&or;"], ["\u2229", "&cap;"], ["\u222A", "&cup;"], ["\u222B", "&int;"], ["\u2234", "&there4;"], ["\u223C", "&sim;"], ["\u2245", "&cong;"], ["\u2248", "&asymp;"], ["\u2260", "&ne;"], ["\u2261", "&equiv;"], ["\u2264", "&le;"], ["\u2265", "&ge;"], ["\u2282", "&sub;"], ["\u2283", "&sup;"], ["\u2284", "&nsub;"], ["\u2286", "&sube;"], ["\u2287", "&supe;"], ["\u2295", "&oplus;"], ["\u2297", "&otimes;"], ["\u22A5", "&perp;"], ["\u22C5", "&sdot;"], ["\u2308", "&lceil;"], ["\u2309", "&rceil;"], ["\u230A", "&lfloor;"], ["\u230B", "&rfloor;"], ["\u2329", "&lang;"], ["\u232A", "&rang;"], ["\u25CA", "&loz;"], ["\u2660", "&spades;"], ["\u2663", "&clubs;"], ["\u2665", "&hearts;"], ["\u2666", "&diams;"]];


_.forEach = function(arr, cb) {
  for (var i=0, n=arr.length; i<n; i++) {
    cb(arr[i], i);
  }
}

_.map = function(arr, cb) {
  var arr2 = [];
  for (var i=0, n=arr.length; i<n; i++) {
    arr2.push(cb(arr[i], i));
  }
  return arr2;
}

_.filter = function(arr, test) {
  var filtered = [];
  for (var i=0, n=arr.length; i<n; i++) {
    if (test(arr[i], i)) {
      filtered.push(arr[i]);
    }
  }
  return filtered;
}

// obj: value or test function
_.indexOf = function(arr, obj) {
  var test = typeof obj == 'function' ? obj : null;
  for (var i=0, n=arr.length; i<n; i++) {
    if (test ? test(arr[i]) : arr[i] === obj) {
      return i;
    }
  }
  return -1;
}

_.find = function(arr, obj) {
  var i = _.indexOf(arr, obj);
  return i == -1 ? null : arr[i];
}

_.contains = function(arr, obj) {
  return _.indexOf(arr, obj) >= 0;
}

// alias for contains()
_.some = function(arr, cb) {
  return _.indexOf(arr, cb) >= 0;
}

_.extend = function(o) {
  for (var i=1; i<arguments.length; i++) {
    forEachProperty(arguments[i], add);
  }
  function add(v, k) {
    o[k] = v;
  }
  return o;
}

_.forEachProperty = function(o, cb) {
  for (var k in o) {
    if (o.hasOwnProperty(k)) {
      cb(o[k], k);
    }
  }
}

// Return new object containing properties of a that are missing or different in b
// Return null if output object would be empty
// a, b: JS objects
_.objectDiff = function(a, b) {
  var diff = null;
  for (var k in a) {
    if (a[k] != b[k] && a.hasOwnProperty(k)) {
      diff = diff || {};
      diff[k] = a[k];
    }
  }
  return diff;
}

// return elements in array "a" but not in array "b"
_.arraySubtract = function(a, b) {
  var diff = [],
    alen = a.length,
    blen = b.length,
    i, j;
  for (i=0; i<alen; i++) {
    diff.push(a[i]);
    for (j=0; j<blen; j++) {
      if (a[i] === b[j]) {
        diff.pop();
        break;
      }
    }
  }
  return diff;
}

// Copy elements of an array-like object to an array
_.toArray = function(obj) {
  var arr = [];
  for (var i=0, n=obj.length; i<n; i++) {
    arr[i] = obj[i]; // about 2x faster than push() (apparently)
    // arr.push(obj[i]);
  }
  return arr;
}

// multiple key sorting function based on https://github.com/Teun/thenBy.js
// first by length of name, then by population, then by ID
// data.sort(
//     firstBy(function (v1, v2) { return v1.name.length - v2.name.length; })
//     .thenBy(function (v1, v2) { return v1.population - v2.population; })
//     .thenBy(function (v1, v2) { return v1.id - v2.id; });
// );
_.firstBy = function(f1, f2) {
  var compare = f2 ? function(a, b) {return f1(a, b) || f2(a, b);} : f1;
  compare.thenBy = function(f) {return _.firstBy(compare, f);};
  return compare;
}

// Remove whitespace from beginning and end of a string
_.trim = function(s) {
  return s.replace(/^[\s\uFEFF\xA0\x03]+|[\s\uFEFF\xA0\x03]+$/g, '');
}

// splits a string into non-empty lines
_.stringToLines = function(str) {
  var empty = /^\s*$/;
  return _.filter(str.split(/[\r\n\x03]+/), function(line) {
    return !empty.test(line);
  });
}

_.zeroPad = function(val, digits) {
  var str = String(val);
  while (str.length < digits) str = '0' + str;
  return str;
}

_.truncateString = function(str, maxlen, useEllipsis) {
  // TODO: add ellipsis, truncate at word boundary
  if (str.length > maxlen) {
    str = str.substr(0, maxlen);
    if (useEllipsis) str += '...';
  }
  return str;
}

_.makeKeyword = function(text) {
  return text.replace( /[^A-Za-z0-9_-]+/g , '_' );
}

// TODO: don't convert ampersand in pre-existing entities (e.g. "&quot;" -> "&amp;quot;")
_.encodeHtmlEntities = function(text) {
  return _.replaceChars(text, _.basicCharacterReplacements.concat(_.extraCharacterReplacements));
}

_.cleanHtmlText = function(text) {
  // Characters "<>& are not replaced
  return _.replaceChars(text, _.extraCharacterReplacements);
}

_.replaceChars = function(str, replacements) {
  var charCode;
  for (var i=0, n=replacements.length; i < n; i++) {
    charCode = replacements[i];
    if (str.indexOf(charCode[0]) > -1) {
      str = str.replace(new RegExp(charCode[0],'g'), charCode[1]);
    }
  }
  return str;
}

_.straightenCurlyQuotesInsideAngleBrackets = function(text) {
  // This function's purpose is to fix quoted properties in HTML tags that were
  // typed into text blocks (Illustrator tends to automatically change single
  // and double quotes to curly quotes).
  // thanks to jashkenas
  // var quoteFinder = /[\u201C‘’\u201D]([^\n]*?)[\u201C‘’\u201D]/g;
  var tagFinder = /<[^\n]+?>/g;
  return text.replace(tagFinder, function(tag){
    return _.straightenCurlyQuotes(tag);
  });
}

_.straightenCurlyQuotes = function(str) {
  return str.replace( /[\u201C\u201D]/g , '"' ).replace( /[‘’]/g , "'" );
}

// Not very robust -- good enough for printing a warning
_.findHtmlTag = function(str) {
  var match;
  if (str.indexOf('<') > -1) { // bypass regex check
    match = /<(\w+)[^>]*>/.exec(str);
  }
  return match ? match[1] : null;
}

_.addEnclosingTag = function(tagName, str) {
  var openTag = '<' + tagName;
  var closeTag = '</' + tagName + '>';
  if ((new RegExp(openTag)).test(str) === false) {
    str = openTag + '>\r' + str;
  }
  if ((new RegExp(closeTag)).test(str) === false) {
    str = str + '\r' + closeTag;
  }
  return str;
}

_.stripTag = function(tagName, str) {
  var open = new RegExp('<' + tagName + '[^>]*>', 'g');
  var close = new RegExp('</' + tagName + '>', 'g');
  return str.replace(open, '').replace(close, '');
}

// precision: number of decimals in rounded number
_.roundTo = function(number, precision) {
  var d = Math.pow(10, precision || 0);
  return Math.round(number * d) / d;
}

_.getDateTimeStamp = function() {
  var d     = new Date();
  var year  = d.getFullYear();
  var date  = zeroPad(d.getDate(),2);
  var month = zeroPad(d.getMonth() + 1,2);
  var hour  = zeroPad(d.getHours(),2);
  var min   = zeroPad(d.getMinutes(),2);
  return year + '-' + month + '-' + date + ' ' + hour + ':' + min;
}

// obj: JS object containing css properties and values
// indentStr: string to use as block CSS indentation
_.formatCss = function(obj, indentStr) {
  var css = '';
  var isBlock = !!indentStr;
  for (var key in obj) {
    if (isBlock) {
      css += '\r' + indentStr;
    }
    css += key + ':' + obj[key]+ ';';
  }
  if (css && isBlock) {
    css += '\r';
  }
  return css;
}

_.getCssColor = function(r, g, b, opacity) {
  var col, o;
  if (opacity > 0 && opacity < 100) {
    o = roundTo(opacity / 100, 2);
    col = 'rgba(' + r + ',' + g + ',' + b + ',' + o + ')';
  } else {
    col = 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  return col;
}

// Test if two rectangles are the same, to within a given tolerance
// a, b: two arrays containing AI rectangle coordinates
// maxOffs: maximum pixel deviation on any side
_.testSimilarBounds = function(a, b, maxOffs) {
  if (maxOffs >= 0 === false) maxOffs = 1;
  for (var i=0; i<4; i++) {
    if (Math.abs(a[i] - b[i]) > maxOffs) return false;
  }
  return true;
}

// Apply very basic string substitution to a template
_.applyTemplate = function(template, replacements) {
  var keyExp = '([_a-zA-Z][\\w-]*)';
  var mustachePattern = new RegExp('\\{\\{\\{? *' + keyExp + ' *\\}\\}\\}?','g');
  var ejsPattern = new RegExp('<%=? *' + keyExp + ' *%>','g');
  var replace = function(match, name) {
    var lcname = name.toLowerCase();
    if (name in replacements) return replacements[name];
    if (lcname in replacements) return replacements[lcname];
    return match;
  };
  return template.replace(mustachePattern, replace).replace(ejsPattern, replace);
}

// Similar to Node.js path.join()
_.pathJoin = function() {
  var path = '';
  _.forEach(arguments, function(arg) {
    if (!arg) return;
    arg = String(arg);
    arg = arg.replace(/^\/+/, '').replace(/\/+$/, '');
    if (path.length > 0) {
      path += '/';
    }
    path += arg;
  });
  return path;
}

// Split a full path into directory and filename parts
_.pathSplit = function(path) {
  var parts = path.split('/');
  var filename = parts.pop();
  return [parts.join('/'), filename];
}



// accept inconsistent true/yes setting value
_.isTrue = function(val) {
  return val == 'true' || val == 'yes' || val === true;
}

// accept inconsistent false/no setting value
_.isFalse = function(val) {
  return val == 'false' || val == 'no' || val === false;
}

