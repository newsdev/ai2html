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
  function convertTextData(textData, artboardData, settings) {
    // var frameData = _.map(textFrames, function(frame) {
    //   return {
    //     paragraphs: importTextFrameParagraphs(frame)
    //   };
    // });
    // var pgStyles = [];
    // var charStyles = [];
    // var baseStyle = deriveTextStyleCss(frameData);
    // var idPrefix = nameSpace + 'ai' + getArtboardId(ab) + '-';
    // var abBox = convertAiBounds(ab.artboardRect);
    // var divs = _.map(frameData, function(obj, i) {
    //   var frame = textFrames[i];
    //   var divId = frame.name ? _.makeKeyword(frame.name) : idPrefix  + (i + 1);
    //   var positionCss = getTextFrameCss(frame, abBox, obj.paragraphs, settings);
    //   return '\t\t<div id="' + divId + '" ' + positionCss + '>' +
    //     generateTextFrameHtml(obj.paragraphs, baseStyle, pgStyles, charStyles) + '\r\t\t</div>\r';
    // });
    //
    // var allStyles = pgStyles.concat(charStyles);
    // var cssBlocks = _.map(allStyles, function(obj) {
    //   return '.' + obj.classname + ' {' + formatCss(obj.style, '\t\t') + '\t}\r';
    // });
    // if (divs.length > 0) {
    //   cssBlocks.unshift('p {' + formatCss(baseStyle, '\t\t') + '\t}\r');
    // }
    //
    // return {
    //   styles: cssBlocks,
    //   html: divs.join('')
    // };
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
  
  
  function getTextStyleClass(style, classes, name) {
    var key = ai.getStyleKey(style);
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
    var containerId = nameSpace + makeDocumentSlug(pageName) + '-box';
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
  
  
  
  AI2HTML.html = {
    
    convertSpecialData: convertSpecialData,
    
    
    // call this when globals change
    updateGlobals: updateGlobals
    
  };
  
}());
