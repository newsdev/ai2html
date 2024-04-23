AI2HTML = AI2HTML || {};
/** @global */
AI2HTML.svelte = AI2HTML.svelte || {};

// ======================================
// Utility functions that convert JSON to HTML
// ======================================

(function() {

  var log = AI2HTML.logger;
  
  // import settings from defaults
  var cssPrecision = AI2HTML.defaults.cssPrecision;
  
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
  
  
  function generateArtboardCss(ab, cssRules, settings) {
    var t3 = '\t',
      t4 = t3 + '\t',
      t5 = t4 + '\t',
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
    
    if (_.isTrue(settings.use_container_media_query)) {
      var visibleRange = ab.visibleRange;
      css += t3 + '@container (min-width: ' + visibleRange[0] + 'px) and (max-width: ' + Math.min(visibleRange[1], 99999999) + 'px) {\r';
      css += t4 + abId + ' {\r';
      css += t5 + 'display: block;\r';
      css += t4 + '}\r';
      css += t3 + '}\r';
    }
    
    return css;
  }
  
  
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
      // svelte control of css
      html += ' class:visible={' + visibleRange[0] + ' <= clientWidth && clientWidth <= ' + visibleRange[1] + '}';
    }
    
    html += '>\r';
    // add spacer div
    html += '<div style="' + inlineSpacerStyle + '"></div>\n';
    return html;
  }
  
  function getSvelteJs(html) {
    
    // search HTML for any {text_variables}
    var variables = html.match(/\{[a-zA-Z0-9_]+}/g);
    var js = 'let clientWidth = -1; \r'; // starts below 0 so that the containerCSS triggers first
    var uniqueVariables = []; // To hold unique variables
    
    if (variables) {
      // Loop through variables to remove duplicates
      for (var i = 0; i < variables.length; i++) {
        // Check if the variable is already in the uniqueVariables array
        var isDuplicate = false;
        for (var j = 0; j < uniqueVariables.length; j++) {
          if (variables[i] === uniqueVariables[j]) {
            isDuplicate = true;
            break; // Stop searching, as a duplicate is found
          }
        }
        // If not a duplicate, add to uniqueVariables array
        if (!isDuplicate) {
          uniqueVariables.push(variables[i]);
        }
      }
      
      // Iterate over unique variables to create JS code
      for (var i = 0; i < uniqueVariables.length; i++) {
        js += 'export let ' + uniqueVariables[i].replace(/[{}]/g, '') + ' = "";\r';
        // Assuming feedback is defined elsewhere and is accessible
      }
      
      feedback.push('Svelte variables: ' + uniqueVariables.join(', '));
    }
    return js;
  }



// Wrap content HTML in a <div>, add styles and resizer script, write to a file
  function generateOutputHtml(content, pageName, settings) {
    var linkSrc = settings.clickable_link || '';
    var containerId = nameSpace + pageName + '-box';
    var altTextId = containerId + '-img-desc';
    var textForFile, html, js, css, commentBlock;
    var htmlFileDestinationFolder, htmlFileDestination;
    var containerClasses = 'ai2html';
    var outputPath = settings.svelte_output_path || settings.html_output_path;
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
    html = '<div id="' + containerId + '" class="' + containerClasses + '"' + ariaAttrs + ' bind:clientWidth>\r';
    
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
    js = '\r<script>\r' +
      '  import { onMount } from "svelte";\r' +
      getSvelteJs(html) +
      '  onMount(() => {\r' +
      content.js +
      '  });\r' +
      '\r</script>\r';
    
    textForFile =  '\r' + commentBlock + css + '\r' + html + '\r' + js +
      '<!-- End ai2html' + ' - ' + _.getDateTimeStamp() + ' -->\r';
    
    textForFile = _.applyTemplate(textForFile, settings);
    htmlFileDestinationFolder = docPath + outputPath;
    AI2HTML.fs.checkForOutputFolder(htmlFileDestinationFolder, 'html_output_path');
    htmlFileDestination = htmlFileDestinationFolder + (settings.svelte_output_file_name || pageName + '.svelte');
    
    // 'index' is assigned upstream now (where applicable)
    // if (settings.output == 'one-file' && settings.project_type == 'ai2html') {
    //   htmlFileDestination = htmlFileDestinationFolder + 'index' + settings.html_output_extension;
    // }
    
    // write file
    AI2HTML.fs.saveTextFile(htmlFileDestination, textForFile);
    
    // TODO different preview file
    // process local preview template if appropriate
    if (settings.local_preview_template !== '') {
      // TODO: may have missed a condition, need to compare with original version
      var previewFileDestination = htmlFileDestinationFolder + pageName + '.preview.html';
      AI2HTML.fs.outputLocalPreviewPage(textForFile, previewFileDestination, settings);
    }
  }
  
  
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
    var preload = isTrue(settings.use_lazy_loader) ? 'preload="metadata"' : 'preload="auto"';
    return '<video ' + 'src="' + url + '" ' + preload + ' autoplay muted loop playsinline style="top:0; width:100%; object-fit:contain; position:absolute"></video>';
  }


// Get CSS styles that are common to all generated content
  function generatePageCss(containerId, settings) {
    var css = '';
    var t2 = '\t';
    var t3 = '\r\t\t';
    // var blockStart = t2 + '#' + containerId + ' ';
    var blockStart = t2;
    var blockEnd = '\r' + t2 + '}\r';
    
    css += blockStart + '#' + containerId + ' {';
    if (_.isTrue(settings.use_container_media_query)) {
      css += t3 + 'container-type: inline-size;';
    }
    if (settings.max_width) {
      css += t3 + 'max-width:' + settings.max_width + 'px;';
    }
      css += blockEnd;
    
    if (_.isTrue(settings.center_html_output)) {
      css += blockStart + '#' + containerId + ', ' + '.' + nameSpace + 'artboard {';
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
    
    // artboard visibility on resize, svelte
    css += blockStart + '.' + nameSpace + 'artboard {';
    css += t3 + 'display: none;'; // for svelte visibility via css class
    css += blockEnd;
    
    css += blockStart + '.visible' + ' {';
    css += t3 + 'display: block;';
    css += blockEnd;
    
    // TODO container query
    
    return css;
  }
  
  
  function formatCssPct(part, whole) {
    return ai.formatCssPct(part, whole);
  }
  
  
  AI2HTML.svelte = {
    
    generateArtboardCss: generateArtboardCss,
    generateArtboardDiv: generateArtboardDiv,
    generateOutputHtml: generateOutputHtml,

    // call this when globals change
    updateGlobals: updateGlobals
    
  };
  
}());
