AI2HTML = AI2HTML || {};
/** @global */
AI2HTML.html = AI2HTML.html || {};

// ======================================
// Utility functions that convert JSON to HTML
// ======================================

(function() {

  var log = AI2HTML.logger;
  
  // import settings from defaults
  var caps = AI2HTML.defaults.caps;
  var align = AI2HTML.defaults.align;
  var blendModes = AI2HTML.defaults.blendModes;
  var cssPrecision = AI2HTML.defaults.cssPrecision;
  var cssTextStyleProperties = AI2HTML.defaults.cssTextStyleProperties;
  
  // globals (though it would be better to parameterize the functions instead)
  var doc, docPath, nameSpace, fonts, ai;
  
  // call this function to update the global variables, they usually don't change
  // eventually this could be done in a cleaner way
  function updateGlobals() {
    doc = AI2HTML.doc;
    docPath = AI2HTML.docPath;
    nameSpace = AI2HTML.nameSpace;
    fonts = AI2HTML.defaults.fonts;
    ai = AI2HTML.ai;
  }
  
  function warn(str) { log.warn(str); }
  function error(str) { log.error(str); }
  function message() { log.message.apply(log, arguments); }
  
  function convertSpecialData(layersData, settings) {
    var data = {
      layers: [],
      html_before: '',
      html_after: '',
      video: ''
    };
    // the data supports multiple videos, but the current export code does not
    var video = _.filter(layersData, function(d) { return d.type === 'video'; })[0];
    
    if (video) {
      var html = makeVideoHtml(video.url, settings);
      if (html) {
        data.video = html;
        data.layers.push(video.layer);
      }
    }
    
    var htmlBefore = _.filter(layersData, function(d) { return d.type === 'html-before'; })[0];
    if (htmlBefore) {
      data.html_before = htmlBefore.html;
      data.layers.push(htmlBefore.layer);
    }
    
    var htmlAfter = _.filter(layersData, function(d) { return d.type === 'html-after'; })[0];
    if (htmlAfter) {
      data.html_after = htmlAfter.html;
      data.layers.push(htmlAfter.layer);
    }
    
    return data.layers.length === 0 ? null : data;
  }
  
  
  function makeVideoHtml(url, settings) {
    url = _.trim(url);
    if (!/^https:/.test(url) || !/\.mp4$/.test(url)) {
      return '';
    }
    var srcName = _.isTrue(settings.use_lazy_loader) ? 'data-src' : 'src';
    return '<video ' + srcName + '="' + url + '" autoplay muted loop playsinline style="top:0; width:100%; object-fit:contain; position:absolute"></video>';
  }
  
  // Convert a collection of TextFrames to HTML and CSS
  // TKTK
  function convertTextData(textData) {
    var pgStyles = [];
    var charStyles = [];
    var baseStyle = deriveTextStyleCss(textData);
    var divs = _.map(textData, function(obj, i) {
      var divId = obj.id;
      var positionCss = 'class="' + obj.classes + '" style="' + propsToCss(obj.styles) + '"';
      return '\t\t<div id="' + divId + '" ' + positionCss + '>' +
        generateTextFrameHtml(obj.paragraphs, baseStyle, pgStyles, charStyles) + '\r\t\t</div>\r';
    });

    var allStyles = pgStyles.concat(charStyles);
    var cssBlocks = _.map(allStyles, function(obj) {
      return '.' + obj.classname + ' {' + formatCss(obj.style, '\t\t') + '\t}\r';
    });
    if (divs.length > 0) {
      cssBlocks.unshift('p {' + formatCss(baseStyle, '\t\t') + '\t}\r');
    }

    return {
      styles: cssBlocks,
      html: divs.join('')
    };
  }
  
  
  function generateTextFrameHtml(paragraphs, baseStyle, pStyles, cStyles) {
    var html = '';
    for (var i=0; i<paragraphs.length; i++) {
      html += '\r\t\t\t' + generateParagraphHtml(paragraphs[i], baseStyle, pStyles, cStyles);
    }
    return html;
  }
  
  
  function generateParagraphHtml(pData, baseStyle, pStyles, cStyles) {
    var html, diff, range, rangeHtml;
    if (pData.text.length === 0) { // empty pg
      // TODO: Calculate the height of empty paragraphs and generate
      // CSS to preserve this height (not supported by Illustrator API)
      return '<p>&nbsp;</p>';
    }
    diff = _.objectDiff(pData.cssStyle, baseStyle);
    // Give the pg a class, if it has a different style than the base pg class
    if (diff) {
      html = '<p class="' + getTextStyleClass(diff, pStyles, 'pstyle') + '">';
    } else {
      html = '<p>';
    }
    for (var j=0; j<pData.ranges.length; j++) {
      range = pData.ranges[j];
      rangeHtml = _.cleanHtmlText(cleanHtmlTags(range.text));
      diff = _.objectDiff(range.cssStyle, pData.cssStyle);
      if (diff) {
        rangeHtml = '<span class="' +
          getTextStyleClass(diff, cStyles, 'cstyle') + '">' + rangeHtml + '</span>';
      }
      html += rangeHtml;
    }
    html += '</p>';
    return html;
  }
  
  function cleanHtmlTags(str) {
    var tagName = _.findHtmlTag(str);
    // only warn for certain tags
    if (tagName && _.contains('i,span,b,strong,em'.split(','), tagName.toLowerCase())) {
      log.warnOnce('Found a <' + tagName + '> tag. Try using Illustrator formatting instead.');
    }
    return tagName ? _.straightenCurlyQuotesInsideAngleBrackets(str) : str;
  }
  
  
  
  // takes a props object and makes an inline css string out of it
  function propsToCss(props) {
    var css = '';
    for (var key in props) {
      css += key + ':' + props[key] + ';';
    }
    return css;
  }
  
  function getTextStyleClass(style, classes, name) {
    var key = getStyleKey(style);
    var cname = nameSpace + (name || 'style');
    var o, i;
    for (i=0; i<classes.length; i++) {
      o = classes[i];
      if (o.key == key) {
        return o.classname;
      }
    }
    o = {
      key: key,
      style: style,
      classname: cname + i
    };
    classes.push(o);
    return o.classname;
  }


// Create class='' and style='' CSS for positioning the label container div
// (This container wraps one or more <p> tags)
  function getTextFrameCss(thisFrame, abBox, pgData, settings) {
    var styles = '';
    var classes = '';
    // Using AI style of first paragraph in TextFrame to get information about
    // tracking, justification and top padding
    // TODO: consider positioning paragraphs separately, to handle pgs with different
    //   justification in the same text block
    var firstPgStyle = pgData[0].aiStyle;
    var lastPgStyle = pgData[pgData.length - 1].aiStyle;
    var isRotated = firstPgStyle.rotated;
    var aiBounds = isRotated ? getUntransformedTextBounds(thisFrame) : thisFrame.geometricBounds;
    var htmlBox = convertAiBounds(shiftBounds(aiBounds, -abBox.left, abBox.top));
    var thisFrameAttributes = parseDataAttributes(thisFrame.note);
    // estimated space between top of HTML container and character glyphs
    // (related to differences in AI and CSS vertical positioning of text blocks)
    var marginTopPx = (firstPgStyle.leading - firstPgStyle.size) / 2 + firstPgStyle.spaceBefore;
    // estimated space between bottom of HTML container and character glyphs
    var marginBottomPx = (lastPgStyle.leading - lastPgStyle.size) / 2 + lastPgStyle.spaceAfter;
    // var trackingPx = firstPgStyle.size * firstPgStyle.tracking / 1000;
    var htmlL = htmlBox.left;
    var htmlT = Math.round(htmlBox.top - marginTopPx);
    var htmlW = htmlBox.width;
    var htmlH = htmlBox.height + marginTopPx + marginBottomPx;
    var alignment, v_align, vertAnchorPct;
    
    if (firstPgStyle.justification == 'Justification.LEFT') {
      alignment = 'left';
    } else if (firstPgStyle.justification == 'Justification.RIGHT') {
      alignment = 'right';
    } else if (firstPgStyle.justification == 'Justification.CENTER') {
      alignment = 'center';
    }
    
    if (thisFrame.kind == TextType.AREATEXT) {
      v_align = 'top'; // area text aligned to top by default
      // EXPERIMENTAL feature
      // Put a box around the text, if the text frame's textPath is styled
      styles += convertAreaTextPath(thisFrame);
    } else {  // point text
      // point text aligned to midline (sensible default for chart y-axes, map labels, etc.)
      v_align = 'middle';
      htmlW += 22; // add a bit of extra width to try to prevent overflow
    }
    
    if (thisFrameAttributes.valign && !isRotated) {
      // override default vertical alignment, unless text is rotated (TODO: support other )
      v_align = thisFrameAttributes.valign;
      if (v_align == 'center') {
        v_align = 'middle';
      }
    }
    
    if (isRotated) {
      vertAnchorPct = (marginTopPx + htmlBox.height * 0.5 + 1) / (htmlH) * 100; // TODO: de-kludge
      styles += getTransformationCss(thisFrame, vertAnchorPct);
      // Only center alignment currently works well with rotated text
      // TODO: simplify alignment of rotated text (some logic is in convertAiTextStyle())
      v_align = 'middle';
      alignment = 'center';
      // text-align of point text set to 'center' in convertAiTextStyle()
    }
    
    if (v_align == 'bottom') {
      var bottomPx = abBox.height - (htmlBox.top + htmlBox.height + marginBottomPx);
      styles += 'bottom:' + formatCssPct(bottomPx, abBox.height) + ';';
    } else if (v_align == 'middle') {
      // https://css-tricks.com/centering-in-the-unknown/
      // TODO: consider: http://zerosixthree.se/vertical-align-anything-with-just-3-lines-of-css/
      styles += 'top:' + formatCssPct(htmlT + marginTopPx + htmlBox.height / 2, abBox.height) + ';';
      styles += 'margin-top:-' + _.roundTo(marginTopPx + htmlBox.height / 2, 1) + 'px;';
    } else {
      styles += 'top:' + formatCssPct(htmlT, abBox.height) + ';';
    }
    if (alignment == 'right') {
      styles += 'right:' + formatCssPct(abBox.width - (htmlL + htmlBox.width), abBox.width) + ';';
    } else if (alignment == 'center') {
      styles += 'left:' + formatCssPct(htmlL + htmlBox.width / 2, abBox.width) + ';';
      // setting a negative left margin for horizontal placement of centered text
      // using percent for area text (because area text width uses percent) and pixels for point text
      if (thisFrame.kind == TextType.POINTTEXT) {
        styles += 'margin-left:-' + _.roundTo(htmlW / 2, 1) + 'px;';
      } else {
        styles += 'margin-left:' + formatCssPct(-htmlW / 2, abBox.width )+ ';';
      }
    } else {
      styles += 'left:' + formatCssPct(htmlL, abBox.width) + ';';
    }
    
    classes = nameSpace + getLayerName(thisFrame.layer) + ' ' + nameSpace + 'aiAbs';
    if (thisFrame.kind == TextType.POINTTEXT) {
      classes += ' ' + nameSpace + 'aiPointText';
      // using pixel width with point text, because pct width causes alignment problems -- see issue #63
      // adding extra pixels in case HTML width is slightly less than AI width (affects alignment of right-aligned text)
      styles += 'width:' + _.roundTo(htmlW, cssPrecision) + 'px;';
    } else if (settings.text_responsiveness == 'fixed') {
      styles += 'width:' + _.roundTo(htmlW, cssPrecision) + 'px;';
    } else {
      // area text uses pct width, so width of text boxes will scale
      // TODO: consider only using pct width with wider text boxes that contain paragraphs of text
      styles += 'width:' + formatCssPct(htmlW, abBox.width) + ';';
    }
    return 'class="' + classes + '" style="' + styles + '"';
    
    // TK include prefix support for
    //   '-webkit-transform: ' + transform + '-webkit-transform-origin: ' + transformOrigin +
    //   '-ms-transform: ' + transform + '-ms-transform-origin: ' + transformOrigin;
    
  }




// Wrap content HTML in a <div>, add styles and resizer script, write to a file
  function generateOutputHtml(content, pageName, settings) {
    var linkSrc = settings.clickable_link || '';
    var responsiveJs = '';
    var containerId = nameSpace + ai.makeDocumentSlug(pageName) + '-box';
    var altTextId = containerId + '-img-desc';
    var textForFile, html, js, css, commentBlock;
    var htmlFileDestinationFolder, htmlFileDestination;
    var containerClasses = 'ai2html';
    
    // accessibility features
    var ariaAttrs = '';
    if (settings.aria_role) {
      ariaAttrs += ' role="' + settings.aria_role + '"';
    }
    if (settings.alt_text) {
      ariaAttrs += ' aria-describedby="' + altTextId + '"';
    }
    
    if (_.isTrue(settings.include_resizer_script)) {
      responsiveJs  = getResizerScript(containerId);
      containerClasses += ' ai2html-responsive';
    }
    
    // comments
    commentBlock = '<!-- Generated by ai2html v' + settings.scriptVersion + ' - ' +
      _.getDateTimeStamp() + ' -->\r' + '<!-- ai file: ' + doc.name + ' -->\r';
    
    if (settings.preview_slug) {
      commentBlock += '<!-- preview: ' + settings.preview_slug + ' -->\r';
    }
    if (settings.scoop_slug_from_config_yml) {
      commentBlock += '<!-- scoop: ' + settings.scoop_slug_from_config_yml + ' -->\r';
    }
    
    // HTML
    html = '<div id="' + containerId + '" class="' + containerClasses + '"' + ariaAttrs + '>\r';
    
    if (settings.alt_text) {
      html += '<div class="' + nameSpace + 'aiAltText" id="' + altTextId + '">' +
        _.encodeHtmlEntities(settings.alt_text) + '</div>';
    }
    if (linkSrc) {
      // optional link around content
      html += '\t<a class="' + nameSpace + 'ai2htmlLink" href="' + linkSrc + '">\r';
    }
    html += content.html;
    if (linkSrc) {
      html += '\t</a>\r';
    }
    html += '\r</div>\r';
    
    // CSS
    css = '<style media="screen,print">\r' +
      generatePageCss(containerId, settings) +
      content.css +
      '\r</style>\r';
    
    // JS
    js = content.js + responsiveJs;
    
    textForFile =  '\r' + commentBlock + css + '\r' + html + '\r' + js +
      '<!-- End ai2html' + ' - ' + _.getDateTimeStamp() + ' -->\r';
    
    textForFile = _.applyTemplate(textForFile, settings);
    htmlFileDestinationFolder = docPath + settings.html_output_path;
    AI2HTML.fs.checkForOutputFolder(htmlFileDestinationFolder, 'html_output_path');
    htmlFileDestination = htmlFileDestinationFolder + pageName + settings.html_output_extension;
    
    // 'index' is assigned upstream now (where applicable)
    // if (settings.output == 'one-file' && settings.project_type == 'ai2html') {
    //   htmlFileDestination = htmlFileDestinationFolder + 'index' + settings.html_output_extension;
    // }
    
    // write file
    AI2HTML.fs.saveTextFile(htmlFileDestination, textForFile);
    
    // process local preview template if appropriate
    if (settings.local_preview_template !== '') {
      // TODO: may have missed a condition, need to compare with original version
      var previewFileDestination = htmlFileDestinationFolder + pageName + '.preview.html';
      AI2HTML.fs.outputLocalPreviewPage(textForFile, previewFileDestination, settings);
    }
  }
  
  
  
  function assignArtboardContentToFile(name, abData, outputArr) {
    var obj = _.find(outputArr, function(o) {return o.name == name;});
    if (!obj) {
      obj = {name: name, html: '', js: '', css: ''};
      outputArr.push(obj);
    }
    obj.html += abData.html;
    obj.js += abData.js;
    obj.css += abData.css;
  }
  
  
  function addCustomContent(content, customBlocks) {
    if (customBlocks.css) {
      content.css += '\r\t/* Custom CSS */\r\t' + customBlocks.css.join('\r\t') + '\r';
    }
    if (customBlocks['html-before']) {
      content.html = '<!-- Custom HTML -->\r' + customBlocks['html-before'].join('\r') + '\r' + content.html + '\r';
    }
    if (customBlocks['html-after']) {
      content.html += '\r<!-- Custom HTML -->\r' + customBlocks['html-after'].join('\r') + '\r';
    }
    // deprecated
    if (customBlocks.html) {
      content.html += '\r<!-- Custom HTML -->\r' + customBlocks.html.join('\r') + '\r';
    }
    // TODO: assumed JS contained in <script> tag -- verify this?
    if (customBlocks.js) {
      content.js += '\r<!-- Custom JS -->\r' + customBlocks.js.join('\r') + '\r';
    }
  }


// Generate images and return HTML embed code
  function convertArtItemsToHtml(activeArtboard, textFrames, masks, settings) {
    var imgName = getArtboardImageName(activeArtboard, settings);
    var hideTextFrames = !_.isTrue(settings.testing_mode) && settings.render_text_as != 'image';
    var textFrameCount = textFrames.length;
    var html = '';
    var uniqNames = [];
    var hiddenItems = [];
    var hiddenLayers = [];
    var i;
    
    AI2HTML.fs.checkForOutputFolder(getImageFolder(settings), 'image_output_path');
    
    if (hideTextFrames) {
      for (i=0; i<textFrameCount; i++) {
        textFrames[i].hidden = true;
      }
    }
    
    // WIP
    // _.forEach(findTaggedLayers('svg-symbol'), function(lyr) {
    //   var obj = exportSvgSymbols(lyr, activeArtboard, masks);
    //   html += obj.html;
    //   hiddenItems = hiddenItems.concat(obj.items);
    // });
    
    // Symbols in :symbol layers are not scaled
    _.forEach(findTaggedLayers('symbol'), function(lyr) {
      var obj = exportSymbols(lyr, activeArtboard, masks, {scaled: false});
      html += obj.html;
      hiddenItems = hiddenItems.concat(obj.items);
    });
    
    // Symbols in :div layers are scaled
    _.forEach(findTaggedLayers('div'), function(lyr) {
      var obj = exportSymbols(lyr, activeArtboard, masks, {scaled: true});
      html += obj.html;
      hiddenItems = hiddenItems.concat(obj.items);
    });
    
    _.forEach(findTaggedLayers('svg'), function(lyr) {
      var uniqName = uniqAssetName(getLayerImageName(lyr, activeArtboard, settings), uniqNames);
      var layerHtml = exportImage(uniqName, 'svg', activeArtboard, masks, lyr, settings);
      if (layerHtml) {
        uniqNames.push(uniqName);
        html += layerHtml;
      }
      lyr.visible = false;
      hiddenLayers.push(lyr);
    });
    
    // Embed images tagged :png as separate images
    // Inside this function, layers are hidden and unhidden as needed
    forEachImageLayer('png', function(lyr) {
      var opts = _.extend({}, settings, {png_transparent: true});
      var name = getLayerImageName(lyr, activeArtboard, settings);
      var fmt = _.contains(settings.image_format || [], 'png24') ? 'png24' : 'png';
      // This test prevents empty images, but is expensive when a layer contains many art objects...
      // consider only testing if an option is set by the user.
      if (testLayerArtboardIntersection(lyr, activeArtboard)) {
        html = exportImage(name, fmt, activeArtboard, null, null, opts) + html;
      }
      hiddenLayers.push(lyr); // need to unhide this layer later, after base image is captured
    });
    // placing ab image before other elements
    html = captureArtboardImage(imgName, activeArtboard, masks, settings) + html;
    // unhide hidden layers (if any)
    _.forEach(hiddenLayers, function(lyr) {
      lyr.visible = true;
    });
    
    // unhide text frames
    if (hideTextFrames) {
      for (i=0; i<textFrameCount; i++) {
        textFrames[i].hidden = false;
      }
    }
    
    // unhide items exported as symbols
    _.forEach(hiddenItems, function(item) {
      item.hidden = false;
    });
    
    return {html: html};
  }



// ===================================
// ai2html output generation functions
// ===================================
  
  function generateArtboardDiv(data, settings) {
    var id = nameSpace + data.fullName;
    var classname = nameSpace + 'artboard';
    var widthRange = data.widthRange;
    var visibleRange = data.visibleRange;
    var abBox = data.bounds;
    var aspectRatio = abBox.width / abBox.height;
    var inlineStyle = '';
    var inlineSpacerStyle = '';
    var html = '';
    
    // Set size of graphic using inline CSS
    if (widthRange[0] == widthRange[1]) {
      // fixed width
      // inlineSpacerStyle += "width:" + abBox.width + "px; height:" + abBox.height + "px;";
      inlineStyle += 'width:' + abBox.width + 'px; height:' + abBox.height + 'px;';
    } else {
      // Set height of dynamic artboards using vertical padding as a %, to preserve aspect ratio.
      inlineSpacerStyle = 'padding: 0 0 ' + formatCssPct(abBox.height, abBox.width) + ' 0;';
      if (widthRange[0] > 0) {
        inlineStyle += 'min-width: ' + widthRange[0] + 'px;';
      }
      if (widthRange[1] < Infinity) {
        inlineStyle += 'max-width: ' + widthRange[1] + 'px;';
        inlineStyle += 'max-height: ' + Math.round(widthRange[1] / aspectRatio) + 'px';
      }
    }
    
    html += '\t<div id="' + id + '" class="' + classname + '" style="' + inlineStyle + '"';
    html += ' data-aspect-ratio="' + _.roundTo(aspectRatio, 3) + '"';
    if (_.isTrue(settings.include_resizer_widths)) {
      html += ' data-min-width="' + visibleRange[0] + '"';
      if (visibleRange[1] < Infinity) {
        html +=  ' data-max-width="' + visibleRange[1] + '"';
      }
    }
    html += '>\r';
    // add spacer div
    html += '<div style="' + inlineSpacerStyle + '"></div>\n';
    return html;
  }
  
  function generateArtboardCss(ab, cssRules, settings) {
    var t3 = '\t',
      t4 = t3 + '\t',
      abId = '#' + nameSpace + ab.fullName,
      css = '';
    css += t3 + abId + ' {\r';
    css += t4 + 'position:relative;\r';
    css += t4 + 'overflow:hidden;\r';
    css += t3 + '}\r';
    
    // classes for paragraph and character styles
    _.forEach(cssRules, function(cssBlock) {
      css += t3 + abId + ' ' + cssBlock;
    });
    return css;
  }

// Get CSS styles that are common to all generated content
  function generatePageCss(containerId, settings) {
    var css = '';
    var t2 = '\t';
    var t3 = '\r\t\t';
    var blockStart = t2 + '#' + containerId + ' ';
    var blockEnd = '\r' + t2 + '}\r';
    
    if (settings.max_width) {
      css += blockStart + '{';
      css += t3 + 'max-width:' + settings.max_width + 'px;';
      css += blockEnd;
    }
    if (_.isTrue(settings.center_html_output)) {
      css += blockStart + ',\r' + blockStart + '.' + nameSpace + 'artboard {';
      css += t3 + 'margin:0 auto;';
      css += blockEnd;
    }
    if (settings.alt_text) {
      css += blockStart + ' .' + nameSpace + 'aiAltText {';
      css += t3 + 'position: absolute;';
      css += t3 + 'left: -10000px;';
      css += t3 + 'width: 1px;';
      css += t3 + 'height: 1px;';
      css += t3 + 'overflow: hidden;';
      css += t3 + 'white-space: nowrap;';
      css += blockEnd;
    }
    if (settings.clickable_link !== '') {
      css += blockStart + ' .' + nameSpace + 'ai2htmlLink {';
      css += t3 + 'display: block;';
      css += blockEnd;
    }
    // default <p> styles
    css += blockStart + 'p {';
    css += t3 + 'margin:0;';
    if (_.isTrue(settings.testing_mode)) {
      css += t3 + 'color: rgba(209, 0, 0, 0.5) !important;';
    }
    css += blockEnd;
    
    css += blockStart + '.' + nameSpace + 'aiAbs {';
    css += t3 + 'position:absolute;';
    css += blockEnd;
    
    css += blockStart + '.' + nameSpace + 'aiImg {';
    css += t3 + 'position:absolute;';
    css += t3 + 'top:0;';
    css += t3 + 'display:block;';
    css += t3 + 'width:100% !important;';
    css += blockEnd;
    
    css += blockStart + '.' + ai.getSymbolClass() + ' {';
    css += t3 + 'position: absolute;';
    css += t3 + 'box-sizing: border-box;';
    css += blockEnd;
    
    css += blockStart + '.' + nameSpace + 'aiPointText p { white-space: nowrap; }\r';
    return css;
  }
  
  
  // obj: JS object containing css properties and values
  // indentStr: string to use as block CSS indentation
  function formatCss(obj, indentStr) {
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
  
  
  function formatCssPct(part, whole) {
    return ai.formatCssPct(part, whole);
  }
  
  
  function getResizerScript(containerId) {
    // The resizer function is embedded in the HTML page -- external variables must
    // be passed in.
    //
    // TODO: Consider making artboard images position:absolute and setting
    //   height as a padding % (calculated from the aspect ratio of the graphic).
    //   This will correctly set the initial height of the graphic before
    //   an image is loaded.
    //
    var resizer = function (containerId, opts) {
      var nameSpace = opts.namespace || '';
      var containers = findContainers(containerId);
      containers.forEach(resize);
      
      function resize(container) {
        var onResize = throttle(update, 200);
        var waiting = !!window.IntersectionObserver;
        var observer;
        update();
        
        document.addEventListener('DOMContentLoaded', update);
        window.addEventListener('resize', onResize);
        
        // NYT Scoop-specific code
        if (opts.setup) {
          opts.setup(container).on('cleanup', cleanup);
        }
        
        function cleanup() {
          document.removeEventListener('DOMContentLoaded', update);
          window.removeEventListener('resize', onResize);
          if (observer) observer.disconnect();
        }
        
        function update() {
          var artboards = selectChildren('.' + nameSpace + 'artboard[data-min-width]', container),
            width = Math.round(container.getBoundingClientRect().width);
          
          // Set artboard visibility based on container width
          artboards.forEach(function(el) {
            var minwidth = el.getAttribute('data-min-width'),
              maxwidth = el.getAttribute('data-max-width');
            if (+minwidth <= width && (+maxwidth >= width || maxwidth === null)) {
              if (!waiting) {
                selectChildren('.' + nameSpace + 'aiImg', el).forEach(updateImgSrc);
                selectChildren('video', el).forEach(updateVideoSrc);
              }
              el.style.display = 'block';
            } else {
              el.style.display = 'none';
            }
          });
          
          // Initialize lazy loading on first call
          if (waiting && !observer) {
            if (elementInView(container)) {
              waiting = false;
              update();
            } else {
              observer = new IntersectionObserver(onIntersectionChange, {});
              observer.observe(container);
            }
          }
        }
        
        function onIntersectionChange(entries) {
          // There may be multiple entries relating to the same container
          // (captured at different times)
          var isIntersecting = entries.reduce(function(memo, entry) {
            return memo || entry.isIntersecting;
          }, false);
          if (isIntersecting) {
            waiting = false;
            // update: don't remove -- we need the observer to trigger an update
            // when a hidden map becomes visible after user interaction
            // (e.g. when an accordion menu or tab opens)
            // observer.disconnect();
            // observer = null;
            update();
          }
        }
      }
      
      function findContainers(id) {
        // support duplicate ids on the page
        return selectChildren('.ai2html-responsive', document).filter(function(el) {
          if (el.getAttribute('id') != id) return false;
          if (el.classList.contains('ai2html-resizer')) return false;
          el.classList.add('ai2html-resizer');
          return true;
        });
      }
      
      // Replace blank placeholder image with actual image
      function updateImgSrc(img) {
        var src = img.getAttribute('data-src');
        if (src && img.getAttribute('src') != src) {
          img.setAttribute('src', src);
        }
      }
      
      function updateVideoSrc(el) {
        var src = el.getAttribute('data-src');
        if (src && !el.hasAttribute('src')) {
          el.setAttribute('src', src);
        }
      }
      
      function elementInView(el) {
        var bounds = el.getBoundingClientRect();
        return bounds.top < window.innerHeight && bounds.bottom > 0;
      }
      
      function selectChildren(selector, parent) {
        return parent ? Array.prototype.slice.call(parent.querySelectorAll(selector)) : [];
      }
      
      // based on underscore.js
      function throttle(func, wait) {
        var timeout = null, previous = 0;
        function run() {
          previous = Date.now();
          timeout = null;
          func();
        }
        return function() {
          var remaining = wait - (Date.now() - previous);
          if (remaining <= 0 || remaining > wait) {
            clearTimeout(timeout);
            run();
          } else if (!timeout) {
            timeout = setTimeout(run, remaining);
          }
        };
      }
    };
    
    var optStr = '{namespace: "' + nameSpace + '", setup: window.setupInteractive || window.getComponent}';
    
    // convert resizer function to JS source code
    var resizerJs = '(' +
      _.trim(resizer.toString().replace(/ {2}/g, '\t')) + // indent with tabs
      ')("' + containerId + '", ' + optStr + ');';
    return '<script type="text/javascript">\r\t' + resizerJs + '\r</script>\r';
  }


// Compute the base paragraph style by finding the most common style in frameData
// Side effect: adds cssStyle object alongside each aiStyle object
// frameData: Array of data objects parsed from a collection of TextFrames
// Returns object containing css text style properties of base pg style
  function deriveTextStyleCss(frameData) {
    var pgStyles = [];
    var baseStyle = {};
    // override detected settings with these style properties
    var defaultCssStyle = {
      'text-align': 'left',
      'text-transform': 'none',
      'padding-bottom': 0,
      'padding-top': 0,
      'mix-blend-mode': 'normal',
      'font-style': 'normal',
      'height': 'auto',
      'position': 'static' // 'relative' also used (to correct baseline misalignment)
    };
    var defaultAiStyle = {
      opacity: 100 // given as AI style because opacity is converted to several CSS properties
    };
    var currCharStyles;
    
    _.forEach(frameData, function(frame) {
      _.forEach(frame.paragraphs, analyzeParagraphStyle);
    });
    
    // initialize the base <p> style to be equal to the most common pg style
    if (pgStyles.length > 0) {
      pgStyles.sort(compareCharCount);
      _.extend(baseStyle, pgStyles[0].cssStyle);
    }
    // override certain base style properties with default values
    _.extend(baseStyle, defaultCssStyle, convertAiTextStyle(defaultAiStyle));
    return baseStyle;
    
    function compareCharCount(a, b) {
      return b.count - a.count;
    }
    function analyzeParagraphStyle(pdata) {
      currCharStyles = [];
      _.forEach(pdata.ranges, convertRangeStyle);
      if (currCharStyles.length > 0) {
        // add most common char style to the pg style, to avoid applying
        // <span> tags to all the text in the paragraph
        currCharStyles.sort(compareCharCount);
        _.extend(pdata.aiStyle, currCharStyles[0].aiStyle);
      }
      pdata.cssStyle = analyzeTextStyle(pdata.aiStyle, pdata.text, pgStyles);
      if (pdata.aiStyle.blendMode && !pdata.cssStyle['mix-blend-mode']) {
        log.warnOnce('Missing a rule for converting ' + pdata.aiStyle.blendMode + ' to CSS.');
      }
    }
    
    function convertRangeStyle(range) {
      range.cssStyle = analyzeTextStyle(range.aiStyle, range.text, currCharStyles);
      if (range.warning) {
        warn(range.warning.replace('%s', _.truncateString(range.text, 35)));
      }
      if (range.aiStyle.aifont && !range.cssStyle['font-family']) {
        log.warnOnce('Missing a rule for converting font: ' + range.aiStyle.aifont +
          '. Sample text: ' + _.truncateString(range.text, 35), range.aiStyle.aifont);
      }
    }
    
    function analyzeTextStyle(aiStyle, text, stylesArr) {
      var cssStyle = convertAiTextStyle(aiStyle);
      var key = getStyleKey(cssStyle);
      var o;
      if (text.length === 0) {
        return {};
      }
      for (var i=0; i<stylesArr.length; i++) {
        if (stylesArr[i].key == key) {
          o = stylesArr[i];
          break;
        }
      }
      if (!o) {
        o = {
          key: key,
          aiStyle: aiStyle,
          cssStyle: cssStyle,
          count: 0
        };
        stylesArr.push(o);
      }
      o.count += text.length;
      // o.count++; // each occurence counts equally
      return cssStyle;
    }
  }



// convert an object containing parsed AI text styles to an object containing CSS style properties
  function convertAiTextStyle(aiStyle) {
    var cssStyle = {};
    var fontSize = aiStyle.size;
    var fontInfo, tmp;
    if (aiStyle.aifont) {
      fontInfo = findFontInfo(aiStyle.aifont);
      if (fontInfo.family) {
        cssStyle['font-family'] = fontInfo.family;
      }
      if (fontInfo.weight) {
        cssStyle['font-weight'] = fontInfo.weight;
      }
      if (fontInfo.style) {
        cssStyle['font-style'] = fontInfo.style;
      }
    }
    if ('leading' in aiStyle) {
      cssStyle['line-height'] = aiStyle.leading + 'px';
      // Fix for line height error affecting point text in Chrome/Safari at certain browser zooms.
      if (aiStyle.frameType == 'point') {
        cssStyle.height = cssStyle['line-height'];
      }
    }
    // if (('opacity' in aiStyle) && aiStyle.opacity < 100) {
    if ('opacity' in aiStyle) {
      cssStyle.opacity = _.roundTo(aiStyle.opacity / 100, cssPrecision);
    }
    if (aiStyle.blendMode && (tmp = getBlendModeCss(aiStyle.blendMode))) {
      cssStyle['mix-blend-mode'] = tmp;
      // TODO: consider opacity fallback for IE
    }
    if (aiStyle.spaceBefore > 0) {
      cssStyle['padding-top'] = aiStyle.spaceBefore + 'px';
    }
    if (aiStyle.spaceAfter > 0) {
      cssStyle['padding-bottom'] = aiStyle.spaceAfter + 'px';
    }
    if ('tracking' in aiStyle) {
      cssStyle['letter-spacing'] = _.roundTo(aiStyle.tracking / 1000, cssPrecision) + 'em';
    }
    if (aiStyle.superscript) {
      fontSize = _.roundTo(fontSize * 0.7, 1);
      cssStyle['vertical-align'] = 'super';
    }
    if (aiStyle.subscript) {
      fontSize = _.roundTo(fontSize * 0.7, 1);
      cssStyle['vertical-align'] = 'sub';
    }
    if (fontSize > 0) {
      cssStyle['font-size'] = fontSize + 'px';
    }
    // kludge: text-align of rotated text is handled as a special case (see also getTextFrameCss())
    if (aiStyle.rotated && aiStyle.frameType == 'point') {
      cssStyle['text-align'] = 'center';
    } else if (aiStyle.justification && (tmp = getJustificationCss(aiStyle.justification))) {
      cssStyle['text-align'] = tmp;
    }
    if (aiStyle.capitalization && (tmp = getCapitalizationCss(aiStyle.capitalization))) {
      cssStyle['text-transform'] = tmp;
    }
    if (aiStyle.color) {
      cssStyle.color = aiStyle.color;
    }
    // applying vshift only to point text
    // (based on experience with NYTFranklin)
    if (aiStyle.size > 0 && fontInfo.vshift && aiStyle.frameType == 'point') {
      cssStyle.top = vshiftToPixels(fontInfo.vshift, aiStyle.size);
      cssStyle.position = 'relative';
    }
    return cssStyle;
  }
  
  // s: object containing CSS text properties
  function getStyleKey(s) {
    var key = '';
    for (var i=0, n=cssTextStyleProperties.length; i<n; i++) {
      key += '~' + (s[cssTextStyleProperties[i]] || '');
    }
    return key;
  }



// Lookup an AI font name in the font table
  function findFontInfo(aifont) {
    var info = null;
    for (var k=0; k<fonts.length; k++) {
      if (aifont == fonts[k].aifont) {
        info = fonts[k];
        break;
      }
    }
    if (!info) {
      // font not found... parse the AI font name to give it a weight and style
      info = {};
      if (aifont.indexOf('Italic') > -1) {
        info.style = 'italic';
      }
      if (aifont.indexOf('Bold') > -1) {
        info.weight = 700;
      } else {
        info.weight = 500;
      }
    }
    return info;
  }



// ai: AI justification value
  function getJustificationCss(ai) {
    for (var k=0; k<align.length; k++) {
      if (ai == align[k].ai) {
        return align[k].html;
      }
    }
    return 'initial'; // CSS default
  }

// ai: AI capitalization value
  function getCapitalizationCss(ai) {
    for (var k=0; k<caps.length; k++) {
      if (ai == caps[k].ai) {
        return caps[k].html;
      }
    }
    return '';
  }
  
  function getBlendModeCss(ai) {
    for (var k=0; k<blendModes.length; k++) {
      if (ai == blendModes[k].ai) {
        return blendModes[k].html;
      }
    }
    return '';
  }
  
  
  
  function vshiftToPixels(vshift, fontSize) {
    var i = vshift.indexOf('%');
    var pct = parseFloat(vshift);
    var px = fontSize * pct / 100;
    if (!px || i==-1) return '0';
    return _.roundTo(px, 1) + 'px';
  }
  
  
  AI2HTML.html = {
    
    convertSpecialData: convertSpecialData,
    convertTextData: convertTextData,
    generateOutputHtml: generateOutputHtml,
    assignArtboardContentToFile: assignArtboardContentToFile,
    addCustomContent: addCustomContent,
    convertArtItemsToHtml: convertArtItemsToHtml,
    generateArtboardDiv: generateArtboardDiv,
    generateArtboardCss: generateArtboardCss,
    cleanHtmlTags: cleanHtmlTags,
    // call this when globals change
    updateGlobals: updateGlobals
    
  };
  
}());
