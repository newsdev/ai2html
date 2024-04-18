AI2HTML = AI2HTML || {};
/** @global */
AI2HTML.ai = AI2HTML.ai || {};

// ======================================
// Illustrator specific utility functions
// ======================================

(function() {

  var log = AI2HTML.logger;
  
  // import settings from defaults
  var caps = AI2HTML.defaults.caps;
  var align = AI2HTML.defaults.align;
  var blendModes = AI2HTML.defaults.blendModes;
  var cssPrecision = AI2HTML.defaults.cssPrecision;
  
  // globals (though it would be better to parameterize the functions instead)
  var doc, docPath, nameSpace, fonts;
  
  // call this function to update the global variables, they usually don't change
  // eventually this could be done in a cleaner way
  function updateGlobals() {
    doc = AI2HTML.doc;
    docPath = AI2HTML.docPath;
    nameSpace = AI2HTML.nameSpace;
    fonts = AI2HTML.defaults.fonts;
  }
  
  
  
  function warn(str) { log.warn(str); }
  function error(str) { log.error(str); }
  function message() { log.message.apply(log, arguments); }
  
  
  // a, b: coordinate arrays, as from <PathItem>.geometricBounds
  function testBoundsIntersection(a, b) {
    return a[2] >= b[0] && b[2] >= a[0] && a[3] <= b[1] && b[3] <= a[1];
  }
  
  function shiftBounds(bnds, dx, dy) {
    return [bnds[0] + dx, bnds[1] + dy, bnds[2] + dx, bnds[3] + dy];
  }
  
  function clearMatrixShift(m) {
    return app.concatenateTranslationMatrix(m, -m.mValueTX, -m.mValueTY);
  }

  

// ==============================
// ai2html text functions
// ==============================
  
  function textIsRotated(textFrame) {
    var m = textFrame.matrix;
    var angle;
    if (m.mValueA == 1 && m.mValueB === 0 && m.mValueC === 0 && m.mValueD == 1) return false;
    angle = Math.atan2(m.mValueB, m.mValueA) * 180 / Math.PI;
    // Treat text rotated by < 1 degree as unrotated.
    // (It's common to accidentally rotate text and then try to unrotate manually).
    return Math.abs(angle) > 1;
  }
  
  function hideTextFrame(textFrame) {
    textFrame.hidden = true;
  }

// color: a color object, e.g. RGBColor
// opacity (optional): opacity [0-100]
  function convertAiColor(color, opacity) {
    // If all three RBG channels (0-255) are below this value, convert text fill to pure black.
    var rgbBlackThreshold  = 36;
    var o = {};
    var r, g, b;
    if (color.typename == 'SpotColor') {
      color = color.spot.color; // expecting AI to return an RGBColor because doc is in RGB mode.
    }
    if (color.typename == 'RGBColor') {
      r = color.red;
      g = color.green;
      b = color.blue;
      if (r < rgbBlackThreshold && g < rgbBlackThreshold && b < rgbBlackThreshold) {
        r = g = b = 0;
      }
    } else if (color.typename == 'GrayColor') {
      r = g = b = Math.round((100 - color.gray) / 100 * 255);
    } else if (color.typename == 'NoColor') {
      g = 255;
      r = b = 0;
      // warnings are processed later, after ranges of same-style chars are identified
      // TODO: add text-fill-specific warnings elsewhere
      o.warning = 'The text "%s" has no fill. Please fill it with an RGB color. It has been filled with green.';
    } else {
      r = g = b = 0;
      o.warning = 'The text "%s" has ' + color.typename + ' fill. Please fill it with an RGB color.';
    }
    o.color = _.getCssColor(r, g, b, opacity);
    return o;
  }

// Parse an AI CharacterAttributes object
  function getCharStyle(c) {
    var o = convertAiColor(c.fillColor);
    var caps = String(c.capitalization);
    o.aifont = c.textFont.name;
    o.size = Math.round(c.size);
    o.capitalization = caps == 'FontCapsOption.NORMALCAPS' ? '' : caps;
    o.tracking = c.tracking;
    o.superscript = c.baselinePosition == FontBaselineOption.SUPERSCRIPT;
    o.subscript = c.baselinePosition == FontBaselineOption.SUBSCRIPT;
    return o;
  }

// p: an AI paragraph (appears to be a TextRange object with mixed-in ParagraphAttributes)
// opacity: Computed opacity (0-100) of TextFrame containing this pg
  function getParagraphStyle(p) {
    return {
      leading: Math.round(p.leading),
      spaceBefore: Math.round(p.spaceBefore),
      spaceAfter: Math.round(p.spaceAfter),
      justification: String(p.justification) // coerce from object
    };
  }


// Divide a paragraph (TextRange object) into an array of
// data objects describing text strings having the same style.
  function getParagraphRanges(p) {
    var segments = [];
    var currRange;
    var prev, curr, c;
    for (var i=0, n=p.characters.length; i<n; i++) {
      c = p.characters[i];
      curr = getCharStyle(c);
      if (!prev || _.objectDiff(curr, prev)) {
        currRange = {
          text: '',
          aiStyle: curr
        };
        segments.push(currRange);
      }
      if (curr.warning) {
        currRange.warning = curr.warning;
      }
      currRange.text += c.contents;
      prev = curr;
    }
    return segments;
  }


// Convert a TextFrame to an array of data records for each of the paragraphs
//   contained in the TextFrame.
  function importTextFrameParagraphs(textFrame) {
    // The scripting API doesn't give us access to opacity of TextRange objects
    //   (including individual characters). The best we can do is get the
    //   computed opacity of the current TextFrame
    var opacity = getComputedOpacity(textFrame);
    var blendMode = getBlendMode(textFrame);
    var charsLeft = textFrame.characters.length;
    var rotated = textIsRotated(textFrame);
    var data = [];
    var p, plen, d;
    for (var k=0, n=textFrame.paragraphs.length; k<n && charsLeft > 0; k++) {
      // trailing newline in a text block adds one to paragraphs.length, but
      // an error is thrown when such a pg is accessed. charsLeft test is a workaround.
      p = textFrame.paragraphs[k];
      plen = p.characters.length;
      if (plen === 0) {
        d = {
          text: '',
          aiStyle: {},
          ranges: []
        };
      } else {
        d = {
          text: p.contents,
          aiStyle: getParagraphStyle(p),
          ranges: getParagraphRanges(p)
        };
        d.aiStyle.rotated = rotated;
        d.aiStyle.opacity = opacity;
        d.aiStyle.blendMode = blendMode;
        d.aiStyle.frameType = textFrame.kind == TextType.POINTTEXT ? 'point' : 'area';
      }
      data.push(d);
      charsLeft -= (plen + 1); // char count + newline
    }
    
    return data;
  }
  


// Convert a collection of TextFrames to JSON
  function convertTextFrames(textFrames, ab, settings) {
    var data = [];
    var frameData = _.map(textFrames, function(frame) {
      return {
        paragraphs: importTextFrameParagraphs(frame)
      };
    });
    
    deriveTextStyleCss(frameData); // modifies frameData in place
    var idPrefix = nameSpace + 'ai' + getArtboardId(ab) + '-';
    var abBox = convertAiBounds(ab.artboardRect);
    
    _.forEach(frameData, function(obj, i) {
      var frame = textFrames[i];
      var divId = frame.name ? _.makeKeyword(frame.name) : idPrefix  + (i + 1);
      var css = getTextFrameCssProps(frame, abBox, obj.paragraphs, settings);
      data.push({
        id: divId,
        paragraphs: obj.paragraphs,
        classes: css.classes,
        position: css.props
      });
    });
    
    return data;
  }

  // Get artboard data
  function getArtboardData(ab, settings) {
    var fullName = getArtboardFullName(ab, settings);
    var widthRange = getArtboardWidthRange(ab, settings);
    var visibleRange = getArtboardVisibilityRange(ab, settings);
    var bounds = convertAiBounds(ab.artboardRect);
    
    return {
      id: getArtboardId(ab),
      fullName: fullName,
      widthRange: widthRange,
      visibleRange: visibleRange,
      bounds: bounds
    };
  }

// Create class='' and style='' CSS for positioning the label container div
// (This container wraps one or more <p> tags)
  function getTextFrameCssProps(thisFrame, abBox, pgData, settings) {
    var props = {};
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
      props = _.extend(props, getAreaTextPathProps(thisFrame));
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
      props = _.extend(props, getTransformationCssProps(thisFrame, vertAnchorPct));
      // Only center alignment currently works well with rotated text
      // TODO: simplify alignment of rotated text (some logic is in convertAiTextStyle())
      v_align = 'middle';
      alignment = 'center';
      // text-align of point text set to 'center' in convertAiTextStyle()
    }
    
    if (v_align == 'bottom') {
      var bottomPx = abBox.height - (htmlBox.top + htmlBox.height + marginBottomPx);
      props.bottom = formatCssPct(bottomPx, abBox.height) + '';
    } else if (v_align == 'middle') {
      // https://css-tricks.com/centering-in-the-unknown/
      // TODO: consider: http://zerosixthree.se/vertical-align-anything-with-just-3-lines-of-css/
      props.top = formatCssPct(htmlT + marginTopPx + htmlBox.height / 2, abBox.height) + '';
      props['margin-top'] = '-' + _.roundTo(marginTopPx + htmlBox.height / 2, 1) + 'px';
    } else {
      props.top = formatCssPct(htmlT, abBox.height) + '';
      
    }
    if (alignment == 'right') {
      props.right = formatCssPct(abBox.width - (htmlL + htmlBox.width), abBox.width) + '';
    } else if (alignment == 'center') {
      props.left = formatCssPct(htmlL + htmlBox.width / 2, abBox.width) + '';
      
      // setting a negative left margin for horizontal placement of centered text
      // using percent for area text (because area text width uses percent) and pixels for point text
      if (thisFrame.kind == TextType.POINTTEXT) {
        props['margin-left'] = '-' + _.roundTo(htmlW / 2, 1) + 'px';
      } else {
        props['margin-left'] = formatCssPct(-htmlW / 2, abBox.width )+ '';
      }
    } else {
      props.left = formatCssPct(htmlL, abBox.width) + '';
    }
    
    classes = nameSpace + getLayerName(thisFrame.layer) + ' ' + nameSpace + 'aiAbs';
    if (thisFrame.kind == TextType.POINTTEXT) {
      classes += ' ' + nameSpace + 'aiPointText';
      // using pixel width with point text, because pct width causes alignment problems -- see issue #63
      // adding extra pixels in case HTML width is slightly less than AI width (affects alignment of right-aligned text)
      props.width = _.roundTo(htmlW, cssPrecision) + 'px';
    } else if (settings.text_responsiveness == 'fixed') {
      props.width = _.roundTo(htmlW, cssPrecision) + 'px';
    } else {
      // area text uses pct width, so width of text boxes will scale
      // TODO: consider only using pct width with wider text boxes that contain paragraphs of text
      props.width = formatCssPct(htmlW, abBox.width) + '';
    }
    
    return {
      classes: classes,
      props: props
    };
    
  }
  
  
  function formatCssPct(part, whole) {
    return _.roundTo(part / whole * 100, cssPrecision) + '%';
  }
  
  
  


  function textFrameIsRenderable(frame, artboardRect) {
    var good = true;
    if (!testBoundsIntersection(frame.visibleBounds, artboardRect)) {
      good = false;
    } else if (frame.kind != TextType.AREATEXT && frame.kind != TextType.POINTTEXT) {
      good = false;
    } else if (objectIsHidden(frame)) {
      good = false;
    } else if (frame.contents === '') {
      good = false;
    }
    return good;
  }

// Find clipped art objects that are inside an artboard but outside the bounding box
// box of their clipping path
// items: array of PageItems assocated with a clipping path
// clipRect: bounding box of clipping path
// abRect: bounds of artboard to test
//
  function selectMaskedItems(items, clipRect, abRect) {
    var found = [];
    var itemRect, itemInArtboard, itemInMask, maskInArtboard;
    for (var i=0, n=items.length; i<n; i++) {
      itemRect = items[i].geometricBounds;
      // capture items that intersect the artboard but are masked...
      itemInArtboard = testBoundsIntersection(abRect, itemRect);
      maskInArtboard = testBoundsIntersection(abRect, clipRect);
      itemInMask = testBoundsIntersection(itemRect, clipRect);
      if (itemInArtboard && (!maskInArtboard || !itemInMask)) {
        found.push(items[i]);
      }
    }
    return found;
  }

// Find clipped TextFrames that are inside an artboard but outside their
// clipping path (using bounding box of clipping path to approximate clip area)
  function getClippedTextFramesByArtboard(ab, masks) {
    var abRect = ab.artboardRect;
    var frames = [];
    _.forEach(masks, function(o) {
      var clipRect = o.mask.geometricBounds;
      if (_.testSimilarBounds(abRect, clipRect, 5)) {
        // if clip path is masking the current artboard, skip the test
        return;
      }
      if (!testBoundsIntersection(abRect, clipRect)) {
        return; // ignore masks in other artboards
      }
      var texts = o.textframes;
      // var texts = _.filter(o.items, function(item) {return item.typename == 'TextFrame';});
      texts = selectMaskedItems(texts, clipRect, abRect);
      if (texts.length > 0) {
        frames = frames.concat(texts);
      }
    });
    return frames;
  }

// Get array of TextFrames belonging to an artboard, excluding text that
// overlaps the artboard but is hidden by a clipping mask
  function getTextFramesByArtboard(ab, masks, settings) {
    var candidateFrames = findTextFramesToRender(doc.textFrames, ab.artboardRect);
    var excludedFrames = getClippedTextFramesByArtboard(ab, masks);
    candidateFrames = _.arraySubtract(candidateFrames, excludedFrames);
    if (settings.render_rotated_skewed_text_as == 'image') {
      excludedFrames = _.filter(candidateFrames, textIsRotated);
      candidateFrames = _.arraySubtract(candidateFrames, excludedFrames);
    }
    return candidateFrames;
  }
  
  function findTextFramesToRender(frames, artboardRect) {
    var selected = [];
    for (var i=0; i<frames.length; i++) {
      if (textFrameIsRenderable(frames[i], artboardRect)) {
        selected.push(frames[i]);
      }
    }
    // Sort frames top to bottom, left to right.
    selected.sort(
      _.firstBy(function (v1, v2) { return v2.top  - v1.top; })
        .thenBy(function (v1, v2) { return v1.left - v2.left; })
    );
    return selected;
  }

// Extract key: value pairs from the contents of a note attribute
  function parseDataAttributes(note) {
    var o = {};
    var parts;
    if (note) {
      parts = note.split(/[\r\n;,]+/);
      for (var i = 0; i < parts.length; i++) {
        AI2HTML.settings.parseKeyValueString(parts[i], o);
      }
    }
    return o;
  }
  

  function getUntransformedTextBounds(textFrame) {
    var copy = textFrame.duplicate(textFrame.parent, ElementPlacement.PLACEATEND);
    var matrix = clearMatrixShift(textFrame.matrix);
    copy.transform(app.invertMatrix(matrix));
    var bnds = copy.geometricBounds;
    if (textFrame.kind == TextType.AREATEXT) {
      // prevent offcenter problem caused by extra vertical space in text area
      // TODO: de-kludge
      // this would be much simpler if <TextFrameItem>.convertAreaObjectToPointObject()
      // worked correctly (throws MRAP error when trying to remove a converted object)
      var textWidth = (bnds[2] - bnds[0]);
      copy.transform(matrix);
      // Transforming outlines avoids the offcenter problem, but width of bounding
      // box needs to be set to width of transformed TextFrame for correct output
      copy = copy.createOutline();
      copy.transform(app.invertMatrix(matrix));
      bnds = copy.geometricBounds;
      var dx = Math.ceil(textWidth - (bnds[2] - bnds[0])) / 2;
      bnds[0] -= dx;
      bnds[2] += dx;
    }
    copy.remove();
    return bnds;
  }
  
  function getTransformationCssProps(textFrame, vertAnchorPct) {
    var props = {};
    var matrix = clearMatrixShift(textFrame.matrix);
    var horizAnchorPct = 50;
    var transformOrigin = horizAnchorPct + '% ' + vertAnchorPct + '%';
    var transform = 'matrix(' +
      _.roundTo(matrix.mValueA, cssPrecision) + ',' +
      _.roundTo(-matrix.mValueB, cssPrecision) + ',' +
      _.roundTo(-matrix.mValueC, cssPrecision) + ',' +
      _.roundTo(matrix.mValueD, cssPrecision) + ',' +
      _.roundTo(matrix.mValueTX, cssPrecision) + ',' +
      _.roundTo(matrix.mValueTY, cssPrecision) + ')';
    
    // TODO: handle character scaling.
    // One option: add separate CSS transform to paragraphs inside a TextFrame
    var charStyle = textFrame.textRange.characterAttributes;
    var scaleX = charStyle.horizontalScale;
    var scaleY = charStyle.verticalScale;
    if (scaleX != 100 || scaleY != 100) {
      warn('Vertical or horizontal text scaling will be lost. Affected text: ' + _.truncateString(textFrame.contents, 35));
    }
    
    props.transform = transform;
    props.transformOrigin = transformOrigin;
    return props;
    
  }


// Compute the base paragraph style by finding the most common style in frameData
// Side effect: adds cssStyle object alongside each aiStyle object
// frameData: Array of data objects parsed from a collection of TextFrames
// Returns object containing css text style properties of base pg style
  function deriveTextStyleCss(frameData) {
    var pgStyles = [];
    // override detected settings with these style properties

    var currCharStyles;
    
    _.forEach(frameData, function(frame) {
      _.forEach(frame.paragraphs, analyzeParagraphStyle);
    });
    
    // error('pgStyles ' + JSON.stringify(pgStyles));
    
    return true;
    
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
      var key = AI2HTML.settings.getStyleKey(cssStyle);
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
  

  
  
  
  function getAreaTextPathProps(frame) {
    var props = {};
    var path = frame.textPath;
    var obj;
    if (path.stroked || path.filled) {
      props.padding = '6px 6px 6px 7px';
      if (path.filled) {
        obj = convertAiColor(path.fillColor, path.opacity);
        props.backgroundColor = obj.color;
      }
      if (path.stroked) {
        obj = convertAiColor(path.strokeColor, path.opacity);
        props.border = '1px solid ' + obj.color;
      }
    }
    return props;
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


// =================================
// ai2html symbol functions
// =================================

// Return inline CSS for styling a single symbol
// TODO: create classes to capture style properties that are used repeatedly
  function getBasicSymbolCss(geom, style, abBox, opts) {
    var center = geom.center;
    var styles = [];
    // Round fixed-size symbols to integer size, to prevent pixel-snapping from
    // changing squares and circles to rectangles and ovals.
    var precision = opts.scaled ? 1 : 0;
    var width, height;
    var border;
    
    if (geom.type == 'line') {
      precision = 2;
      width = geom.width;
      height = geom.height;
      if (width > height) {
        // kludge to minimize gaps between segments (found using trial and error)
        width += style.strokeWidth * 0.5;
        center[0] += style.strokeWidth * 0.333;
      }
    } else if (geom.type == 'rectangle') {
      width = geom.width;
      height = geom.height;
    } else if (geom.type == 'circle') {
      width = geom.radius * 2;
      height = width;
      // styles.push('border-radius: ' + _.roundTo(geom.radius, 1) + 'px');
      styles.push('border-radius: 50%');
    }
    
    width = _.roundTo(width, precision);
    height = _.roundTo(height, precision);
    
    if (opts.scaled) {
      styles.push('width: ' + formatCssPct(width, abBox.width));
      styles.push('height: ' + formatCssPct(height, abBox.height));
      styles.push('margin-left: ' + formatCssPct(-width / 2, abBox.width));
      // vertical margin pct is calculated as pct of width
      styles.push('margin-top: ' + formatCssPct(-height / 2, abBox.width));
      
    } else {
      styles.push('width: ' + width + 'px');
      styles.push('height: ' + height + 'px');
      styles.push('margin-top: ' + (-height / 2) + 'px');
      styles.push('margin-left: ' + (-width / 2) + 'px');
    }
    
    if (style.stroke) {
      if (geom.type == 'line' && width > height) {
        border = 'border-top';
      } else if (geom.type == 'line') {
        border = 'border-right';
      } else {
        border = 'border';
      }
      styles.push(border + ': ' + style.strokeWidth + 'px solid ' + style.stroke);
    }
    if (style.fill) {
      styles.push('background-color: ' + style.fill);
    }
    if (style.opacity < 1 && style.opacity) {
      styles.push('opacity: ' + style.opacity);
    }
    if (style.multiply) {
      styles.push('mix-blend-mode: multiply');
    }
    styles.push('left: ' + formatCssPct(center[0], abBox.width));
    styles.push('top: ' + formatCssPct(center[1], abBox.height));
    // TODO: use class for colors and other properties
    return 'style="' + styles.join('; ') + ';"';
  }
  
  function getSymbolClass() {
    return nameSpace + 'aiSymbol';
  }
  
  function exportSymbolAsHtml(item, geometries, abBox, opts) {
    var html = '';
    var style = getBasicSymbolStyle(item);
    var properties = item.name ? 'data-name="' + _.makeKeyword(item.name) + '" ' : '';
    var geom, x, y;
    for (var i=0; i<geometries.length; i++) {
      geom = geometries[i];
      // make center coords relative to top,left of artboard
      x = geom.center[0] - abBox.left;
      y = -geom.center[1] - abBox.top;
      geom.center = [x, y];
      html += '\r\t\t\t' + '<div class="' + getSymbolClass() + '" ' + properties +
        getBasicSymbolCss(geom, style, abBox, opts) + '></div>';
    }
    return html;
  }
  
  
  function testEmptyArtboard(ab) {
    return !testLayerArtboardIntersection(null, ab);
  }
  
  function testLayerArtboardIntersection(lyr, ab) {
    if (lyr) {
      return layerIsVisible(lyr);
    } else {
      return some(doc.layers, layerIsVisible);
    }
    
    
    function layerIsVisible(lyr) {
      if (objectIsHidden(lyr)) return false;
      return some(lyr.layers, layerIsVisible) ||
        some(lyr.pageItems, itemIsVisible) ||
        some(lyr.groupItems, groupIsVisible);
    }
    
    function itemIsVisible(item) {
      if (item.hidden || item.guides || item.typename == "GroupItem") return false;
      return testBoundsIntersection(item.visibleBounds, ab.artboardRect);
    }
    
    function groupIsVisible(group) {
      if (group.hidden) return;
      return some(group.pageItems, itemIsVisible) ||
        some(group.groupItems, groupIsVisible);
    }
  }


// Convert paths representing simple shapes to HTML and hide them
  function exportSymbols(lyr, ab, masks, opts) {
    var items = [];
    var abBox = convertAiBounds(ab.artboardRect);
    var html = '';
    forLayer(lyr);
    
    function forLayer(lyr) {
      // if (lyr.hidden) return; // bug -- layers use visible property, not hidden
      if (objectIsHidden(lyr)) return;
      _.forEach(lyr.pageItems, forPageItem);
      _.forEach(lyr.layers, forLayer);
      _.forEach(lyr.groupItems, forGroup);
    }
    
    function forGroup(group) {
      if (group.hidden) return;
      _.forEach(group.pageItems, forPageItem);
      _.forEach(group.groupItems, forGroup);
    }
    
    function forPageItem(item) {
      var singleGeom, geometries;
      if (item.hidden || item.guides || !testBoundsIntersection(item.visibleBounds, ab.artboardRect)) return;
      // try to convert to circle or rectangle
      // note: filled shapes aren't necessarily closed
      if (item.typename != 'PathItem') return;
      singleGeom = getRectangleData(item.pathPoints) || getCircleData(item.pathPoints);
      if (singleGeom) {
        geometries = [singleGeom];
      } else if (opts.scaled && item.stroked && !item.closed) {
        // try to convert to line segment(s)
        geometries = getLineGeometry(item.pathPoints);
      }
      if (!geometries) return; // item is not convertible to an HTML symbol
      html += exportSymbolAsHtml(item, geometries, abBox, opts);
      items.push(item);
      item.hidden = true;
    }
    if (html) {
      html = '\t\t<div class="' + nameSpace + 'symbol-layer ' + nameSpace + getLayerName(lyr) + '">' + html + '\r\t\t</div>\r';
    }
    return {
      html: html,
      items: items
    };
  }
  
  function getBasicSymbolStyle(item) {
    // TODO: handle opacity
    var style = {};
    var stroke, fill;
    style.opacity = _.roundTo(getComputedOpacity(item) / 100, 2);
    if (getBlendMode(item) == BlendModes.MULTIPLY) {
      style.multiply = true;
    }
    if (item.filled) {
      fill = convertAiColor(item.fillColor);
      style.fill = fill.color;
    }
    if (item.stroked) {
      stroke = convertAiColor(item.strokeColor);
      style.stroke = stroke.color;
      // Chrome doesn't consistently render borders that are less than 1px, which
      // can cause lines to disappear or flicker as the window is resized.
      style.strokeWidth = item.strokeWidth < 1 ? 1 : Math.round(item.strokeWidth);
    }
    return style;
  }
  
  function getPathBBox(points) {
    var bbox = [Infinity, Infinity, -Infinity, -Infinity];
    var p;
    for (var i=0, n=points.length; i<n; i++) {
      p = points[i].anchor;
      if (p[0] < bbox[0]) bbox[0] = p[0];
      if (p[0] > bbox[2]) bbox[2] = p[0];
      if (p[1] < bbox[1]) bbox[1] = p[1];
      if (p[1] > bbox[3]) bbox[3] = p[1];
    }
    return bbox;
  }
  
  function getBBoxCenter(bbox) {
    return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
  }

// Return array of line records if path is composed only of vertical and/or
//   horizontal line segments, else return null;
  function getLineGeometry(points) {
    var bbox, w, h, p;
    var lines = [];
    for (var i=0, n=points.length; i<n; i++) {
      p = points[i];
      if (!pathPointIsCorner(p)) {
        return null;
      }
      if (i === 0) continue;
      bbox = getPathBBox([points[i-1], p]);
      w = bbox[2] - bbox[0];
      h = bbox[3] - bbox[1];
      if (w < 1 && h < 1) continue; // double vertex = skip
      if (w > 1 && h > 1) return null; // diagonal line = fail
      lines.push({
        type: 'line',
        center: getBBoxCenter(bbox),
        width: w,
        height: h
      });
    }
    return lines.length > 0 ? lines : null;
  }
  
  function pathPointIsCorner(p) {
    var xy = p.anchor;
    // Vertices of polylines (often) use PointType.SMOOTH. Need to check control points
    //   to determine if the line is curved or not at p
    // if (p.pointType != PointType.CORNER) return false;
    if (xy[0] != p.leftDirection[0] || xy[0] != p.rightDirection[0] ||
      xy[1] != p.leftDirection[1] || xy[1] != p.rightDirection[1]) return false;
    return true;
  }

// If path described by points array looks like a rectangle, return data for rendering
//   as a rectangle; else return null
// points: an array of PathPoint objects
  function getRectangleData(points) {
    var bbox, p, xy;
    // Some rectangles are 4-point closed paths, some are 5-point open paths
    if (points.length < 4 || points.length > 5) return null;
    bbox = getPathBBox(points);
    for (var i=0; i<4; i++) {
      p = points[i];
      xy = p.anchor;
      if (!pathPointIsCorner(p)) return null;
      // point must be a bbox corner
      if (xy[0] != bbox[0] && xy[0] != bbox[2] && xy[1] != bbox[1] && xy[1] != bbox[3]) {
        return null;
      }
    }
    return {
      type: 'rectangle',
      center: getBBoxCenter(bbox),
      width: bbox[2] - bbox[0],
      height: bbox[3] - bbox[1]
    };
  }


// If path described by points array looks like a circle, return data for rendering
//    as a circle; else return null
// Assumes that circles have four anchor points at the top, right, bottom and left
//    positions around the circle.
// points: an array of PathPoint objects
  function getCircleData(points) {
    var bbox, p, xy, edges;
    if (points.length != 4) return null;
    bbox = getPathBBox(points);
    for (var i=0; i<4; i++) {
      p = points[i];
      xy = p.anchor;
      // heuristic for identifying circles:
      // * each vertex is "smooth"
      // * either x or y coord of each vertex is on the bbox
      if (p.pointType != PointType.SMOOTH) return null;
      edges = 0;
      if (xy[0] == bbox[0] || xy[0] == bbox[2]) edges++;
      if (xy[1] == bbox[1] || xy[1] == bbox[3]) edges++;
      if (edges != 1) return null;
    }
    return {
      type: 'circle',
      center: getBBoxCenter(bbox),
      // radius is the average of vertical and horizontal half-axes
      // ellipses are converted to circles
      radius: (bbox[2] - bbox[0] + bbox[3] - bbox[1]) / 4
    };
  }


// =================================
// ai2html image functions
// =================================
  
  function getArtboardImageName(ab, settings) {
    return getArtboardFullName(ab, settings);
  }
  
  function getLayerImageName(lyr, ab, settings) {
    return getArtboardImageName(ab, settings) + '-' + getLayerName(lyr);
  }
  
  function getImageId(imgName) {
    return nameSpace + imgName + '-img';
  }
  
  function uniqAssetName(name, names) {
    var uniqName = name;
    var num = 2;
    while (_.contains(names, uniqName)) {
      uniqName = name + '-' + num;
      num++;
    }
    return uniqName;
  }
  
  function getPromoImageFormat(ab, settings) {
    var fmt = settings.image_format[0];
    if (fmt == 'svg' || !fmt) {
      fmt = 'png';
    } else {
      fmt = resolveArtboardImageFormat(fmt, ab);
    }
    return fmt;
  }

// setting: value from ai2html settings (e.g. 'auto' 'png')
  function resolveArtboardImageFormat(setting, ab) {
    var fmt;
    if (setting == 'auto') {
      fmt = artboardContainsVisibleRasterImage(ab) ? 'jpg' : 'png';
    } else {
      fmt = setting;
    }
    return fmt;
  }
  
  function objectHasLayer(obj) {
    var hasLayer = false;
    try {
      hasLayer = !!obj.layer;
    } catch(e) {
      // trying to access the layer property of a placed item that is used as an opacity mask
      // throws an error (as of Illustrator 2018)
    }
    return hasLayer;
  }
  
  function artboardContainsVisibleRasterImage(ab) {
    function test(item) {
      // Calling objectHasLayer() prevents a crash caused by opacity masks created from linked rasters.
      return objectHasLayer(item) && objectOverlapsArtboard(item, ab) && !objectIsHidden(item);
    }
    // TODO: verify that placed items are rasters
    return _.contains(doc.placedItems, test) || _.contains(doc.rasterItems, test);
  }
  
  function convertSpecialLayers(activeArtboard, settings) {
    var layersData = [];
    
    _.forEach(findTaggedLayers('video'), function(lyr) {
      if (objectIsHidden(lyr)) return;
      var str = getSpecialLayerText(lyr, activeArtboard);
      if (!str) return;
      if (!html) {
        warn('Invalid video URL: ' + str);
      } else {
      
        layersData.push({
          type: 'video',
          url: str,
          layer: lyr
        });
      }
      
    });
    _.forEach(findTaggedLayers('html-before'), function(lyr) {
      if (objectIsHidden(lyr)) return;
      var str = getSpecialLayerText(lyr, activeArtboard);
      if (!str) return;
      
      layersData.push({
        type: 'html-before',
        html: str,
        layer: lyr
      });
      
    });
    _.forEach(findTaggedLayers('html-after'), function(lyr) {
      if (objectIsHidden(lyr)) return;
      var str = getSpecialLayerText(lyr, activeArtboard);
      if (!str) return;
      
      layersData.push({
        type: 'html-after',
        html: str,
        layer: lyr
      });
      
    });
    return layersData;
  }

  
  function getSpecialLayerText(lyr, ab) {
    var text = '';
    _.forEach(lyr.textFrames, eachFrame);
    function eachFrame(frame) {
      if (testBoundsIntersection(frame.visibleBounds, ab.artboardRect)) {
        text = frame.contents;
      }
    }
    return text;
  }

  // Generate images and return art item data. Right now it does it as HTML code
  // but a future version could return more granular image data.
  function convertArtItems(activeArtboard, textFrames, masks, settings) {
    var items = [];
    var imgName = getArtboardImageName(activeArtboard, settings);
    var hideTextFrames = !_.isTrue(settings.testing_mode) && settings.render_text_as != 'image';
    var textFrameCount = textFrames.length;
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
      items.push({
        type: 'symbol',
        html: obj.html,
      });
      hiddenItems = hiddenItems.concat(obj.items);
    });
    
    // Symbols in :div layers are scaled
    _.forEach(findTaggedLayers('div'), function(lyr) {
      var obj = exportSymbols(lyr, activeArtboard, masks, {scaled: true});
      items.push({
        type: 'div',
        html: obj.html,
      });
      hiddenItems = hiddenItems.concat(obj.items);
    });
    
    _.forEach(findTaggedLayers('svg'), function(lyr) {
      var uniqName = uniqAssetName(getLayerImageName(lyr, activeArtboard, settings), uniqNames);
      var layerHtml = exportImage(uniqName, 'svg', activeArtboard, masks, lyr, settings);
      if (layerHtml) {
        uniqNames.push(uniqName);
        items.push({
          type: 'svg',
          html: layerHtml
        });
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
        items.unshift({
          type: 'png',
          html: exportImage(name, fmt, activeArtboard, null, null, opts)
        });
      }
      hiddenLayers.push(lyr); // need to unhide this layer later, after base image is captured
    });
    // placing ab image before other elements
    items.unshift({
      type: 'base',
      html: captureArtboardImage(imgName, activeArtboard, masks, settings)
    });
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
    
    return items;
  }
  
  function findTaggedLayers(tag) {
    function test(lyr) {
      return tag && parseObjectName(lyr.name)[tag];
    }
    return findLayers(doc.layers, test) || [];
  }
  
  function getImageFolder(settings) {
    // return _.pathJoin(docPath, settings.html_output_path, settings.image_output_path);
    return _.pathJoin(docPath, settings.image_output_path);
  }
  
  function getImageFileName(name, fmt) {
    // for file extension, convert png24 -> png; other format names are same as extension
    return name + '.' + fmt.substring(0, 3);
  }
  
  function getLayerOpacityCSS(layer) {
    var o = getComputedOpacity(layer);
    return o < 100 ? 'opacity:' + _.roundTo(o / 100, 2) + ';' : '';
  }

// Capture and save an image to the filesystem and return html embed code
//
  function exportImage(imgName, format, ab, masks, layer, settings) {
    var imgFile = getImageFileName(imgName, format);
    var outputPath = _.pathJoin(getImageFolder(settings), imgFile);
    var imgId = getImageId(imgName);
    // imgClass: // remove artboard size (careful not to remove deduplication annotations)
    var imgClass = imgId.replace(/-[1-9][0-9]+-/, '-');
    // all images are now absolutely positioned (before, artboard images were
    // position:static to set the artboard height)
    var inlineSvg = _.isTrue(settings.inline_svg) || (layer && parseObjectName(layer.name).inline);
    var svgInlineStyle, svgLayersArg;
    var created, html;
    
    imgClass += ' ' + nameSpace + 'aiImg';
    if (format == 'svg') {
      if (layer) {
        svgInlineStyle = getLayerOpacityCSS(layer);
        svgLayersArg = [layer];
      }
      created = exportSVG(outputPath, ab, masks, svgLayersArg, settings);
      if (!created) {
        return ''; // no image was created
      }
      rewriteSVGFile(outputPath, imgId);
      
      if (inlineSvg) {
        html = generateInlineSvg(outputPath, imgClass, svgInlineStyle, settings);
        if (layer) {
          message('Generated inline SVG for layer [' + getLayerName(layer) + ']');
        }
      } else {
        // generate link to external SVG file
        html = generateImageHtml(imgFile, imgId, imgClass, svgInlineStyle, ab, settings);
        if (layer) {
          message('Exported an SVG layer as ' + outputPath.replace(/.*\//, ''));
        }
      }
      
    } else {
      // export raster image & generate link
      exportRasterImage(outputPath, ab, format, settings);
      html = generateImageHtml(imgFile, imgId, imgClass, null, ab, settings);
    }
    
    return html;
  }
  
  function generateInlineSvg(imgPath, imgClass, imgStyle, settings) {
    var svg = AI2HTML.fs.readFile(imgPath) || '';
    var attr = ' class="' + imgClass + '"';
    if (imgStyle) {
      attr += ' style="' + imgStyle + '"';
    }
    svg = svg.replace(/<\?xml.*?\?>/, '');
    svg = svg.replace('<svg', '<svg' + attr);
    svg = replaceSvgIds(svg, settings.svg_id_prefix);
    return svg;
  }

// Replace ids generated by Illustrator with ids that are as close as possible to
// the original names of objects in the document.
// prefix: optional namespace string (to avoid collisions with other ids on the page)
  var svgIds; // index of ids
  function replaceSvgIds(svg, prefix) {
    var idRxp = /id="([^"]+)_[0-9]+_"/g; // matches ids generated by AI
    var hexRxp = /_x([1-7][0-9A-F])_/g;  // matches char codes inserted by AI
    var dupes = [];
    var msg;
    prefix = prefix || '';
    svgIds = svgIds || {};
    svg = svg.replace(idRxp, replaceId);
    if (dupes.length > 0) {
      msg = _.truncateString(dupes.sort().join(', '), 65, true);
      log.warnOnce('Found duplicate SVG ' + (dupes.length == 1 ? 'id' : 'ids') + ': ' + msg);
    }
    return svg;
    
    function replaceId(str, id) {
      var fixedId = id.replace(hexRxp, replaceHexCode);
      var uniqId = uniqify(fixedId);
      return 'id="' + prefix + uniqId + '" data-name="' + fixedId + '"';
    }
    
    function replaceHexCode(str, hex) {
      return String.fromCharCode(parseInt(hex, 16));
    }
    
    // resolve id collisions by appending a string
    function uniqify(origId) {
      var id = origId,
        n = 1;
      while (id in svgIds) {
        n++;
        id = origId + '-' + n;
      }
      if (n == 2) {
        dupes.push(origId);
      }
      svgIds[id] = true;
      return id;
    }
  }

// Finds layers that have an image type annotation in their names (e.g. :png)
//   and passes each tagged layer to a callback, after hiding all other content
// Side effect: Tagged layers remain hidden after the function completes
//   (they have to be unhidden later)
  function forEachImageLayer(imageType, callback) {
    var targetLayers = findTaggedLayers(imageType); // only finds visible layers with a tag
    var hiddenLayers = [];
    if (targetLayers.length === 0) return;
    
    // Hide all visible layers (image export captures entire artboard)
    _.forEach(findLayers(doc.layers), function(lyr) {
      // Except: don't hide layers that are children of a targeted layer
      // (inconvenient to unhide these selectively later)
      if (_.find(targetLayers, function(target) {
        return layerIsChildOf(lyr, target);
      })) return;
      lyr.visible = false;
      hiddenLayers.push(lyr);
    });
    
    _.forEach(targetLayers, function(lyr) {
      // show layer (and any hidden parent layers)
      unhideLayer(lyr);
      callback(lyr);
      lyr.visible = false; // hide again
    });
    
    // Re-show all layers except image layers
    _.forEach(hiddenLayers, function(lyr) {
      if (_.indexOf(targetLayers, lyr) == -1) {
        lyr.visible = true;
      }
    });
  }

// ab: artboard (assumed to be the active artboard)
  function captureArtboardImage(imgName, ab, masks, settings) {
    var formats = settings.image_format;
    var imgHtml;
    
    // This test can be expensive... consider enabling the empty artboard test only if an option is set.
    // if (testEmptyArtboard(ab)) return '';
    
    if (!formats.length) {
      log.warnOnce('No images were created because no image formats were specified.');
      return '';
    }
    
    if (formats[0] != 'auto' && formats[0] != 'jpg' && artboardContainsVisibleRasterImage(ab)) {
      log.warnOnce('An artboard contains a raster image -- consider exporting to jpg instead of ' +
        formats[0] + '.');
    }
    
    _.forEach(formats, function(fmt) {
      var html;
      fmt = resolveArtboardImageFormat(fmt, ab);
      html = exportImage(imgName, fmt, ab, masks, null, settings);
      if (!imgHtml) {
        // use embed code for first of multiple formats
        imgHtml = html;
      }
    });
    return imgHtml;
  }


// Create an <img> tag for the artboard image
  function generateImageHtml(imgFile, imgId, imgClass, imgStyle, ab, settings) {
    var imgDir = settings.image_source_path,
      imgAlt = _.encodeHtmlEntities(settings.image_alt_text || ''),
      html, src;
    
    src = imgDir ? _.pathJoin(imgDir, imgFile) : imgFile;
    if (settings.cache_bust_token) {
      src += '?v=' + settings.cache_bust_token;
    }
    html = '<img id="' + imgId + '" class="' + imgClass + '" alt="' + imgAlt + '"';
    if (imgStyle) {
      html += ' style="' + imgStyle + '"';
    }
    if (_.isTrue(settings.use_lazy_loader)) {
      html += ' data-src="' + src + '"';
      // placeholder while image loads
      // (<img> element requires a src attribute, according to spec.)
      src = 'data:image/gif;base64,R0lGODlhCgAKAIAAAB8fHwAAACH5BAEAAAAALAAAAAAKAAoAAAIIhI+py+0PYysAOw==';
    }
    html += ' src="' + src + '"/>';
    return html;
  }


// Create a promo image from the largest usable artboard
  function createPromoImage(settings) {
    var abIndex = findLargestArtboard();
    if (abIndex == -1) return; // TODO: show error
    var ab = doc.artboards[abIndex],
      format = getPromoImageFormat(ab, settings),
      imgFile = getImageFileName(getDocumentSlug() + '-promo', format),
      outputPath = docPath + imgFile,
      opts = {
        image_width: settings.promo_image_width || 1024,
        jpg_quality: settings.jpg_quality,
        png_number_of_colors: settings.png_number_of_colors,
        png_transparent: false
      };
    doc.artboards.setActiveArtboardIndex(abIndex);
    exportRasterImage(outputPath, ab, format, opts);
    alert('Promo image created\nLocation: ' + outputPath);
  }

// Returns 1 or 2 (corresponding to standard pixel scale and 'retina' pixel scale)
// format: png, png24 or jpg
// doubleres: true/false ('always' option has been removed)
// NOTE: this function used to force single-res for png images > 3 megapixels,
//   because of resource limits on early iphones. This rule has been changed
//   to a warning and the limit increased.
  function getOutputImagePixelRatio(width, height, format, doubleres) {
    var k = _.isTrue(doubleres) ? 2 : 1;
    // thresholds may be obsolete
    var warnThreshold = format == 'jpg' ? 32*1024*1024 : 5*1024*1024; // jpg and png
    var pixels = width * height * k * k;
    if (pixels > warnThreshold) {
      warn('An output image contains ~' + Math.round(pixels / 1e6) + ' million pixels -- this may cause problems on mobile devices');
    }
    return k;
  }

// Exports contents of active artboard as an image (without text, unless in test mode)
// imgPath: full path of output file
// ab: assumed to be active artboard
// format: png, png24, jpg
//
  function exportRasterImage(imgPath, ab, format, settings) {
    // This constant is specified in the Illustrator Scripting Reference under ExportOptionsJPEG.
    var MAX_JPG_SCALE  = 776.19;
    var abPos = convertAiBounds(ab.artboardRect);
    var imageScale, exportOptions, fileType;
    
    if (settings.image_width) { // fixed width (used for promo image output)
      imageScale = 100 * settings.image_width / abPos.width;
    } else {
      imageScale =  100 * getOutputImagePixelRatio(abPos.width, abPos.height, format, settings.use_2x_images_if_possible);
    }
    
    if (format=='png') {
      fileType = ExportType.PNG8;
      exportOptions = new ExportOptionsPNG8();
      exportOptions.colorCount       = settings.png_number_of_colors;
      exportOptions.transparency     = _.isTrue(settings.png_transparent);
      
    } else if (format=='png24') {
      fileType = ExportType.PNG24;
      exportOptions = new ExportOptionsPNG24();
      exportOptions.transparency     = _.isTrue(settings.png_transparent);
      
    } else if (format=='jpg') {
      if (imageScale > MAX_JPG_SCALE) {
        imageScale = MAX_JPG_SCALE;
        warn(imgPath.split('/').pop() + ' was output at a smaller size than desired because of a limit on jpg exports in Illustrator.' +
          ' If the file needs to be larger, change the image format to png which does not appear to have limits.');
      }
      fileType = ExportType.JPEG;
      exportOptions = new ExportOptionsJPEG();
      exportOptions.qualitySetting = settings.jpg_quality;
      
    } else {
      warn('Unsupported image format: ' + format);
      return;
    }
    
    exportOptions.horizontalScale  = imageScale;
    exportOptions.verticalScale    = imageScale;
    exportOptions.artBoardClipping = true;
    exportOptions.antiAliasing     = false;
    app.activeDocument.exportFile(new File(imgPath), fileType, exportOptions);
  }
  
  function makeTmpDocument(doc, ab) {
    // create temp document (pretty slow -- ~1.5s)
    var artboardBounds = ab.artboardRect;
    var doc2 = app.documents.add(DocumentColorSpace.RGB, doc.width, doc.height, 1);
    doc2.pageOrigin = doc.pageOrigin; // not sure if needed
    doc2.rulerOrigin = doc.rulerOrigin;
    // The following caused MRAP
    // doc2.artboards[0].artboardRect = ab.artboardRect;
    doc2.artboards[0].artboardRect = artboardBounds;
    return doc2;
  }


// Copy contents of an artboard to a temporary document, excluding objects
//   that are hidden by masks
// items: Optional argument to copy specific layers or items (default is all layers in the doc)
// Returns a newly-created document containing artwork to export, or null
//   if no image should be created.
//
// TODO: grouped text is copied (but hidden). Avoid copying text in groups, for
//   smaller SVG output.
  function copyArtboardForImageExport(ab, masks, items) {
    var layerMasks = _.filter(masks, function(o) {return !!o.layer;}),
      artboardBounds = ab.artboardRect,
      sourceItems = items || _.toArray(doc.layers),
      destLayer = doc.layers.add(),
      destGroup = doc.groupItems.add(),
      itemCount = 0,
      groupPos, group2, doc2;
    
    destLayer.name = 'ArtboardContent';
    destGroup.move(destLayer, ElementPlacement.PLACEATEND);
    _.forEach(sourceItems, copyLayerOrItem);
    
    // kludge: export empty documents iff items argument is missing (assuming
    //    this is the main artboard image, which is needed to set the container size)
    if (itemCount > 0 || !items) {
      // need to save group position before copying to second document. Oddly,
      // the reported position of the original group changes after duplication
      groupPos = destGroup.position;
      doc2 = makeTmpDocument(doc, ab);
      group2 = destGroup.duplicate(doc2.layers[0], ElementPlacement.PLACEATEND);
      group2.position = groupPos;
    }
    destGroup.remove();
    destLayer.remove();
    return doc2 || null;
    
    function copyLayer(lyr) {
      var mask;
      if (lyr.hidden) return; // ignore hidden layers
      mask = findLayerMask(lyr);
      if (mask) {
        copyMaskedLayerAsGroup(lyr, mask);
      } else {
        _.forEach(getSortedLayerItems(lyr), copyLayerOrItem);
      }
    }
    
    function removeHiddenItems(group) {
      // only remove text frames, for performance
      // TODO: consider checking all item types
      // TODO: consider checking subgroups (recursively)
      // FIX: convert group.textFrames to array to avoid runtime error 'No such element' in _.forEach()
      _.forEach(_.toArray(group.textFrames), removeItemIfHidden);
    }
    
    function removeItemIfHidden(item) {
      if (item.hidden) item.remove();
    }
    
    // Item: Layer (sublayer) or PageItem
    function copyLayerOrItem(item) {
      if (item.typename == 'Layer') {
        copyLayer(item);
      } else {
        copyPageItem(item, destGroup);
      }
    }
    
    // TODO: locked objects in masked layer may not be included in mask.items array
    //   consider traversing layer in this function ...
    //   make sure doubly masked objects aren't copied twice
    function copyMaskedLayerAsGroup(lyr, mask) {
      var maskBounds = mask.mask.geometricBounds;
      var newMask, newGroup;
      if (!testBoundsIntersection(artboardBounds, maskBounds)) {
        return;
      }
      newGroup = doc.groupItems.add();
      newGroup.move(destGroup, ElementPlacement.PLACEATEND);
      _.forEach(mask.items, function(item) {
        copyPageItem(item, newGroup);
      });
      if (newGroup.pageItems.length > 0) {
        // newMask = duplicateItem(mask.mask, destGroup);
        // TODO: refactor
        newMask = mask.mask.duplicate(destGroup, ElementPlacement.PLACEATEND);
        newMask.moveToBeginning(newGroup);
        newGroup.clipped = true;
      } else {
        newGroup.remove();
      }
    }
    
    // Remove opacity and multiply from an item and add to the item's
    // name property (exported as an SVG id). This prevents AI's SVG exporter
    // from converting these items to images. The styles are later parsed out
    // of the SVG id in reapplyEffectsInSVG().
    // Example names: Z--opacity50  Z--multiply--original-name
    // TODO: handle other styles that cause image conversion
    // (This trick does not work for many other effects, like drop shadows and
    //  styles added via the Appearance panel).
    function handleEffects(item) {
      var name = '';
      if (item.opacity && item.opacity < 100) {
        name += '-opacity' + item.opacity;
        item.opacity = 100;
      }
      if (item.blendingMode == BlendModes.MULTIPLY) {
        item.blendingMode = BlendModes.NORMAL;
        name += '-multiply';
      }
      if (name) {
        if (item.name) {
          name += '--' + item.name;
        }
        item.name = 'Z-' + name;
      }
    }
    
    function findLayerMask(lyr) {
      return _.find(layerMasks, function(o) {return o.layer == lyr;});
    }
    
    function copyPageItem(item, dest) {
      var excluded =
        // item.typename == 'TextFrame' || // text objects should be copied if visible
        !testBoundsIntersection(item.geometricBounds, artboardBounds) ||
        objectIsHidden(item) || item.clipping;
      var copy;
      if (!excluded) {
        copy = item.duplicate(dest, ElementPlacement.PLACEATEND); //  duplicateItem(item, dest);
        handleEffects(copy);
        itemCount++;
        if (copy.typename == 'GroupItem') {
          removeHiddenItems(copy);
        }
      }
    }
  }

// Returns true if a file was created or else false (because svg document was empty);
  function exportSVG(ofile, ab, masks, items, settings) {
    // Illustrator's SVG output contains all objects in a document (it doesn't
    //   clip to the current artboard), so we copy artboard objects to a temporary
    //   document for export.
    var exportDoc = copyArtboardForImageExport(ab, masks, items);
    var opts = new ExportOptionsSVG();
    if (!exportDoc) return false;
    
    opts.embedAllFonts         = false;
    opts.fontSubsetting        = SVGFontSubsetting.None;
    opts.compressed            = false;
    opts.documentEncoding      = SVGDocumentEncoding.UTF8;
    opts.embedRasterImages     = _.isTrue(settings.svg_embed_images);
    // opts.DTD                   = SVGDTDVersion.SVG1_1;
    opts.DTD                   = SVGDTDVersion.SVGTINY1_2;
    opts.cssProperties         = SVGCSSPropertyLocation.STYLEATTRIBUTES;
    
    // SVGTINY* DTD variants:
    //  * Smaller file size (50% on one test file)
    //  * Convert raster/vector effects to external .png images (other DTDs use jpg)
    
    exportDoc.exportFile(new File(ofile), ExportType.SVG, opts);
    doc.activate();
    //exportDoc.pageItems.removeAll();
    exportDoc.close(SaveOptions.DONOTSAVECHANGES);
    return true;
  }
  
  function rewriteSVGFile(path, id) {
    var svg = AI2HTML.fs.readFile(path);
    var selector;
    if (!svg) return;
    // replace id created by Illustrator (relevant for inline SVG)
    svg = svg.replace(/id="[^"]*"/, 'id="' + id + '"');
    // reapply opacity and multiply effects
    svg = reapplyEffectsInSVG(svg);
    // prevent SVG strokes from scaling
    // (add element id to selector to prevent inline SVG from affecting other SVG on the page)
    selector = _.map('rect,circle,path,line,polyline,polygon'.split(','), function(name) {
      return '#' + id + ' ' + name;
    }).join(', ');
    svg = injectCSSinSVG(svg, selector + ' { vector-effect: non-scaling-stroke; }');
    // remove images from filesystem and SVG file
    svg = removeImagesInSVG(svg, path);
    AI2HTML.fs.saveTextFile(path, svg);
  }
  
  function reapplyEffectsInSVG(svg) {
    var rxp = /id="Z-(-[^"]+)"/g;
    var opacityRxp = /-opacity([0-9]+)/;
    var multiplyRxp = /-multiply/;
    function replace(a, b) {
      var style = '', retn;
      if (multiplyRxp.test(b)) {
        style += 'mix-blend-mode:multiply;';
        b = b.replace(multiplyRxp, '');
      }
      if (opacityRxp.test(b)) {
        style += 'opacity:' + parseOpacity(b) + ';';
        b = b.replace(opacityRxp, '');
      }
      retn = 'style="' + style + '"';
      if (b.indexOf('--') === 0) {
        // restore original id
        retn = 'id="' + b.substr(2) + '" ' + retn;
      }
      return retn;
    }
    
    function parseOpacity(str) {
      var found = str.match(opacityRxp);
      return parseInt(found[1]) / 100;
    }
    return svg.replace(rxp, replace);
  }
  
  function removeImagesInSVG(content, path) {
    var dir = _.pathSplit(path)[0];
    var count = 0;
    content = content.replace(/<image[^<]+href="([^"]+)"[^<]+<\/image>/gm, function(match, href) {
      count++;
      AI2HTML.fs.deleteFile(_.pathJoin(dir, href));
      return '';
    });
    if (count > 0) {
      log.warnOnce('This document contains images or effects that can\'t be exported to SVG.');
    }
    return content;
  }

// Note: stopped wrapping CSS in CDATA tags (caused problems with NYT cms)
// TODO: check for XML reserved chars
  function injectCSSinSVG(content, css) {
    var style = '<style>\n' + css + '\n</style>';
    return content.replace('</svg>', style + '\n</svg>');
  }

// ======================================
// ai2html AI document reading functions
// ======================================

// Convert bounds coordinates (e.g. artboardRect, geometricBounds) to CSS-style coords
  function convertAiBounds(rect) {
    var x = rect[0],
      y = -rect[1],
      w = Math.round(rect[2] - x),
      h = -rect[3] - y;
    return {
      left: x,
      top: y,
      width: w,
      height: h
    };
  }

// Get numerical index of an artboard in the doc.artboards array
  function getArtboardId(ab) {
    var id = 0;
    forEachUsableArtboard(function(ab2, i) {
      if (ab === ab2) id = i;
    });
    return id;
  }

// Remove any annotations and colon separator from an object name
  function cleanObjectName(name) {
    return _.makeKeyword(name.replace( /^(.+):.*$/, "$1"));
  }

// TODO: prevent duplicate names? or treat duplicate names an an error condition?
// (artboard name is assumed to be unique in several places)
  function getArtboardName(ab) {
    return cleanObjectName(ab.name);
  }
  
  function getLayerName(lyr) {
    return cleanObjectName(lyr.name);
  }
  
  function getDocumentSlug() {
    return AI2HTML.docSlug;
  }
  
  function makeDocumentSlug(rawName) {
    return _.makeKeyword(rawName.replace(/ +/g,"-"));
  }
  
  function getRawDocumentName() {
    return doc.name.replace(/(.+)\.[aieps]+$/,"$1");
  }
  
  function getArtboardFullName(ab, settings) {
    var suffix = '';
    if (settings.grouped_artboards) {
      suffix = "-" + Math.round(convertAiBounds(ab.artboardRect).width);
    }
    return getDocumentArtboardName(ab) + suffix;
  }
  
  function getDocumentArtboardName(ab) {
    return getDocumentSlug() + "-" + getArtboardName(ab);
  }

// return coordinates of bounding box of all artboards
  function getAllArtboardBounds() {
    var rect, bounds;
    for (var i=0, n=doc.artboards.length; i<n; i++) {
      rect = doc.artboards[i].artboardRect;
      if (i === 0) {
        bounds = rect;
      } else {
        bounds = [
          Math.min(rect[0], bounds[0]), Math.max(rect[1], bounds[1]),
          Math.max(rect[2], bounds[2]), Math.min(rect[3], bounds[3])];
      }
    }
    return bounds;
  }

// return the effective width of an artboard (the actual width, overridden by optional setting)
  function getArtboardWidth(ab) {
    var abSettings = getArtboardSettings(ab);
    return abSettings.width || convertAiBounds(ab.artboardRect).width;
  }

// get range of container widths that an ab is visible
  function getArtboardVisibilityRange(ab, settings) {
    var thisWidth = getArtboardWidth(ab);
    var minWidth, nextWidth;
    // find widths of smallest ab and next widest ab (if any)
    _.forEach(getArtboardInfo(settings), function(info) {
      var w = info.effectiveWidth;
      if (w > thisWidth && (!nextWidth || w < nextWidth)) {
        nextWidth = w;
      }
      minWidth = Math.min(w, minWidth || Infinity);
    });
    return [thisWidth == minWidth ? 0 : thisWidth, nextWidth ? nextWidth - 1 : Infinity];
  }

// Get range of widths that an ab can be sized
  function getArtboardWidthRange(ab, settings) {
    var responsiveness = getArtboardResponsiveness(ab, settings);
    var w = getArtboardWidth(ab);
    var visibleRange = getArtboardVisibilityRange(ab, settings);
    if (responsiveness == 'fixed') {
      return [visibleRange[0] === 0 ? 0 : w, w];
    }
    return visibleRange;
  }

// Get [min, max] width range for the graphic (for optional config.yml output)
  function getWidthRangeForConfig(settings) {
    var info = getArtboardInfo(settings);
    var minAB = info[0];
    var maxAB = info[info.length - 1];
    var min, max;
    if (!minAB || !maxAB) return [0, 0];
    min = settings.min_width || minAB.effectiveWidth;
    if (maxAB.responsiveness == 'dynamic') {
      max = settings.max_width || Math.max(maxAB.effectiveWidth, 1600);
    } else {
      max = maxAB.effectiveWidth;
    }
    return [min, max];
  }

// Parse data that is encoded in a name
// This data is appended to the name of an object (layer or artboard).
// Examples: Artboard1:600,fixed  Layer1:svg  Layer2:png
  function parseObjectName(name) {
    // capture portion of name after colon
    var settingsStr = (/:(.*)/.exec(name) || [])[1] || "";
    var settings = {};
    // parse old-style width declaration
    var widthStr = (/^ai2html-(\d+)/.exec(name) || [])[1];
    if (widthStr) {
      settings.width = parseFloat(widthStr);
    }
    // remove suffixes added by copying
    settingsStr = settingsStr.replace(/ copy.*/i, '');
    // parse comma-delimited variables
    _.forEach(settingsStr.split(/ *, */), function(part) {
      var eq = part.indexOf('=');
      var name, value;
      if (/^\d+$/.test(part)) {
        name = 'width';
        value = part;
      } else if (eq > 0) {
        name = part.substr(0, eq);
        value = part.substr(eq + 1);
      } else if (part) {
        // assuming setting is a flag
        name = part;
        value = "true";
      }
      if (name && value) {
        if (/^\d+$/.test(value)) {
          value = parseFloat(value);
        } else if (_.isTrue(value)) {
          value = true;
        }
        settings[name] = value;
      }
    });
    return settings;
  }

// Get artboard-specific settings by parsing the artboard name
// (e.g.  Artboard_1:responsive)
  function getArtboardSettings(ab) {
    return parseObjectName(ab.name);
  }
  
  function getArtboardResponsiveness(ab, settings) {
    var opts = getArtboardSettings(ab);
    var r = settings.responsiveness; // Default to document's responsiveness setting
    if (opts.dynamic) r = 'dynamic'; // ab name has ":dynamic" appended
    if (opts.fixed) r = 'fixed';     // ab name has ":fixed" appended
    return r;
  }

// return array of data records about each usable artboard, sorted from narrow to wide
  function getArtboardInfo(settings) {
    var artboards = [];
    forEachUsableArtboard(function(ab, i) {
      artboards.push({
        effectiveWidth: getArtboardWidth(ab),
        responsiveness: getArtboardResponsiveness(ab, settings),
        id: i
      });
    });
    artboards.sort(function(a, b) {return a.effectiveWidth - b.effectiveWidth;});
    return artboards;
  }
  
  function forEachUsableArtboard(cb) {
    var ab;
    for (var i=0; i<doc.artboards.length; i++) {
      ab = doc.artboards[i];
      if (!/^-/.test(ab.name)) { // exclude artboards with names starting w/ "-"
        cb(ab, i);
      }
    }
  }

// Returns id of artboard with largest area
  function findLargestArtboard() {
    var largestId = -1;
    var largestArea = 0;
    forEachUsableArtboard(function(ab, i) {
      var info = convertAiBounds(ab.artboardRect);
      var area = info.width * info.height;
      if (area > largestArea) {
        largestId = i;
        largestArea = area;
      }
    });
    return largestId;
  }
  
  function findLayers(layers, test) {
    var retn = [];
    _.forEach(layers, function(lyr) {
      var found = null;
      if (objectIsHidden(lyr)) {
        // skip
      } else if (!test || test(lyr)) {
        found = [lyr];
      } else if (lyr.layers.length > 0) {
        // examine sublayers (only if layer didn't test positive)
        found = findLayers(lyr.layers, test);
      }
      if (found) {
        retn = retn ? retn.concat(found) : found;
      }
    });
    // Reverse the order of found layers:
    // Layers seem to be fetched from top to bottom in the AI layer stack...
    // We want separately-rendered layers (like :svg or :symbol) to be
    // converted to HTML from bottom to top
    retn.reverse();
    return retn;
  }
  
  function unhideLayer(lyr) {
    while(lyr.typename == "Layer") {
      lyr.visible = true;
      lyr = lyr.parent;
    }
  }
  
  function layerIsChildOf(lyr, lyr2) {
    if (lyr == lyr2) return false;
    while (lyr.typename == 'Layer') {
      if (lyr == lyr2) return true;
      lyr = lyr.parent;
    }
    return false;
  }
  
  function clearSelection() {
    // setting selection to null doesn't always work:
    // it doesn't deselect text range selection and also seems to interfere with
    // subsequent mask operations using executeMenuCommand().
    // doc.selection = null;
    // the following seems to work reliably.
    app.executeMenuCommand('deselectall');
  }
  
  function objectOverlapsAnArtboard(obj) {
    var hit = false;
    forEachUsableArtboard(function(ab) {
      hit = hit || objectOverlapsArtboard(obj, ab);
    });
    return hit;
  }
  
  function objectOverlapsArtboard(obj, ab) {
    return testBoundsIntersection(ab.artboardRect, obj.geometricBounds);
  }
  
  function objectIsHidden(obj) {
    var hidden = false;
    while (!hidden && obj && obj.typename != "Document"){
      if (obj.typename == "Layer") {
        hidden = !obj.visible;
      } else {
        hidden = obj.hidden;
      }
      // The following line used to throw an MRAP error if the document
      // contained a raster opacity mask... please file a GitHub issue if the
      // problem recurs.
      obj = obj.parent;
    }
    return hidden;
  }
  
  function objectIsLocked(obj) {
    while (obj && obj.typename != "Document") {
      if (obj.locked) {
        return true;
      }
      obj = obj.parent;
    }
    return false;
  }
  
  function unlockObject(obj) {
    // unlock parent first, to avoid "cannot be modified" error
    if (obj && obj.typename != "Document") {
      unlockObject(obj.parent);
      obj.locked = false;
    }
  }
  
  function getComputedOpacity(obj) {
    var opacity = 1;
    while (obj && obj.typename != "Document") {
      opacity *= obj.opacity / 100;
      obj = obj.parent;
    }
    return opacity * 100;
  }


// Return array of layer objects, including both PageItems and sublayers, in z order
  function getSortedLayerItems(lyr) {
    var items = _.toArray(lyr.pageItems).concat(_.toArray(lyr.layers));
    if (lyr.layers.length > 0 && lyr.pageItems.length > 0) {
      // only need to sort if layer contains both layers and page objects
      items.sort(function(a, b) {
        return b.absoluteZOrderPosition - a.absoluteZOrderPosition;
      });
    }
    return items;
  }

// a, b: Layer objects
  function findCommonLayer(a, b) {
    var p = null;
    if (a == b) {
      p = a;
    }
    if (!p && a.parent.typename == 'Layer') {
      p = findCommonLayer(a.parent, b);
    }
    if (!p && b.parent.typename == 'Layer') {
      p = findCommonLayer(a, b.parent);
    }
    return p;
  }
  
  function findCommonAncestorLayer(items) {
    var layers = [],
      ancestorLyr = null,
      item;
    for (var i=0, n=items.length; i<n; i++) {
      item = items[i];
      if (item.parent.typename != 'Layer' || _.contains(layers, item.parent)) {
        continue;
      }
      // remember layer, to avoid redundant searching (is this worthwhile?)
      layers.push(item.parent);
      if (!ancestorLyr) {
        ancestorLyr = item.parent;
      } else {
        ancestorLyr = findCommonLayer(ancestorLyr, item.parent);
        if (!ancestorLyr) {
          // Failed to find a common ancestor
          return null;
        }
      }
    }
    return ancestorLyr;
  }

// Test if a mask can be ignored
// (An optimization -- currently only finds group masks with no text frames)
  function maskIsRelevant(mask) {
    var parent = mask.parent;
    if (parent.typename == "GroupItem") {
      if (parent.textFrames.length === 0) {
        return false;
      }
    }
    return true;
  }

// Get information about masks in the document
// (Used when identifying visible text fields and also when exporting SVG)
  function findMasks() {
    var found = [],
      allMasks, relevantMasks;
    // JS API does not support finding masks -- need to call a menu command for this
    // Assumes clipping paths have been unlocked
    app.executeMenuCommand('Clipping Masks menu item');
    allMasks = _.toArray(doc.selection);
    clearSelection();
    relevantMasks = _.filter(allMasks, maskIsRelevant);
    // Lock all masks; then unlock each mask in turn and identify its contents.
    _.forEach(allMasks, function(mask) {mask.locked = true;});
    _.forEach(relevantMasks, function(mask) {
      var obj = {mask: mask};
      var selection, item;
      
      // Select items in this mask
      mask.locked = false;
      // In earlier AI versions, executeMenuCommand() was more reliable
      // than assigning to a selection... this problem has apparently been fixed
      // app.executeMenuCommand('Clipping Masks menu item');
      doc.selection = [mask];
      // Switch selection to all masked items using a menu command
      app.executeMenuCommand('editMask'); // Object > Clipping Mask > Edit Contents
      
      // stash both objects and textframes
      // (optimization -- addresses poor performance when many objects are masked)
      // //  obj.items = _.toArray(doc.selection || []); // Stash masked items
      storeSelectedItems(obj, doc.selection || []);
      
      if (mask.parent.typename == "GroupItem") {
        obj.group = mask.parent; // Group mask -- stash the group
        
      } else if (mask.parent.typename == "Layer") {
        // Find masking layer -- the common ancestor layer of all masked items is assumed
        // to be the masked layer
        // passing in doc.selection is _much_ faster than obj.items (why?)
        obj.layer = findCommonAncestorLayer(doc.selection || []);
      } else {
        message("Unknown mask type in findMasks()");
      }
      
      // Clear selection and re-lock mask
      // oddly, 'deselectall' sometimes fails here -- using alternate method
      // for clearing the selection
      // app.executeMenuCommand('deselectall');
      mask.locked = true;
      doc.selection = null;
      
      if (obj.items.length > 0 && (obj.group || obj.layer)) {
        found.push(obj);
      }
    });
    // restore masks to unlocked state
    _.forEach(allMasks, function(mask) {mask.locked = false;});
    return found;
  }
  
  function storeSelectedItems(obj, selection) {
    var items = obj.items = [];
    var texts = obj.textframes = [];
    var item;
    for (var i=0, n=selection.length; i<n; i++) {
      item = selection[i];
      items[i] = item; // faster than push() in this JS engine
      if (item.typename == 'TextFrame') {
        texts.push(item);
      }
    }
  }
  
  // uncategorized functions
  
  
  function unlockObjects() {
    _.forEach(doc.layers, unlockContainer);
  }
  
  // Unlock a layer or group if visible and locked, as well as any locked and visible
  //   clipping masks
  // o: GroupItem or Layer
  function unlockContainer(o) {
    var type = o.typename;
    var i, item, pathCount;
    if (o.hidden === true || o.visible === false) return;
    if (o.locked) {
      unlockObject(o);
    }
    
    // unlock locked clipping paths (so contents can be selected later)
    // optimization: Layers containing hundreds or thousands of paths are unlikely
    //    to contain a clipping mask and are slow to scan -- skip these
    pathCount = o.pathItems.length;
    if ((type == 'Layer' && pathCount < 500) || (type == 'GroupItem' && o.clipped)) {
      for (i=0; i<pathCount; i++) {
        item = o.pathItems[i];
        if (!item.hidden && item.clipping && item.locked) {
          unlockObject(item);
          break;
        }
      }
    }
    
    // recursively unlock sub-layers and groups
    _.forEach(o.groupItems, unlockContainer);
    if (o.typename == 'Layer') {
      _.forEach(o.layers, unlockContainer);
    }
  }
  
  
  function getBlendMode(obj) {
    // Limitation: returns first found blending mode, ignores any others that
    //   might be applied a parent object
    while (obj && obj.typename != 'Document') {
      if (obj.blendingMode && obj.blendingMode != BlendModes.NORMAL) {
        return obj.blendingMode;
      }
      obj = obj.parent;
    }
    return null;
  }
  
  
  AI2HTML.ai = {
    testBoundsIntersection: testBoundsIntersection,
    objectIsHidden: objectIsHidden,
    objectOverlapsAnArtboard: objectOverlapsAnArtboard,
    createPromoImage: createPromoImage,
    
    // ai2html text functions
    
    hideTextFrame: hideTextFrame,
    convertTextFrames: convertTextFrames,
    getTextFramesByArtboard: getTextFramesByArtboard,
    parseDataAttributes: parseDataAttributes,
    unlockObject: unlockObject,
    unlockObjects: unlockObjects,
    convertAiTextStyle: convertAiTextStyle,
    
    // ai2html symbol functions
    
    getSymbolClass: getSymbolClass,
    
    // ai2html image functions
    
    uniqAssetName: uniqAssetName,
    convertSpecialLayers: convertSpecialLayers,
    convertArtItems: convertArtItems,
    replaceSvgIds: replaceSvgIds,
    objectIsLocked: objectIsLocked,
    
    // ai2html AI document reading functions
    
    getArtboardId: getArtboardId,
    cleanObjectName: cleanObjectName,
    getArtboardName: getArtboardName,
    makeDocumentSlug: makeDocumentSlug,
    getRawDocumentName: getRawDocumentName,
    getDocumentArtboardName: getDocumentArtboardName,
    getWidthRangeForConfig: getWidthRangeForConfig,
    parseObjectName: parseObjectName,
    getArtboardSettings: getArtboardSettings,
    forEachUsableArtboard: forEachUsableArtboard,
    clearSelection: clearSelection,
    findMasks: findMasks,
    
    getArtboardData: getArtboardData,
    getAllArtboardBounds: getAllArtboardBounds,
    
    formatCssPct: formatCssPct,
    
    // call this when globals change
    
    updateGlobals: updateGlobals
    
  };
  
}());
