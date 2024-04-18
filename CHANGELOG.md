### v0.121.0
- MAJOR refactor, splitting the script into multiple files for better organization and maintainability. The split is not perfect, and there's some awkward globalisms, but it's a big step. 
- Added a bin/build.js script that concatenates the files into a single file for distribution.
- Broke ai2html into two steps: first an exportable JSON data file, then conversion to HTML. This allows for multiple export paths in the future.
- Fixed a bug if the majority of the text is bold or italics, all text would inherit that style.
- Artboard comment names are now just the artboard name instead of repeating the namespace/filename
- Allow for space characters in extra data (e.g. :600, fixed) in artboard names
- Removed the -webkit-transform and -ms-transform from the inline CSS output. It's 2024.
- TK bug: it's getting one extra mask somehow..

### v0.120.0
- Use the literal .ai document name as the default HTML output file name (stop replacing spaces and other characters with underscores and hyphens).
- Mark as tested in Illustrator 2024

### v0.119.0
- Bug fixes
- Added "create_text_block" option, which prevents creation of a settings text block when set to false in an `ai2html-config.json` settings file.
- Added "text_responsiveness" setting, to control whether blocks of text expand and contract when the graphic is resized.


### v0.118.1
- New way to detect NYT Birdkit embed projects

### v0.118.0
- New setting: "create_json_config_files" (alternative to generating config.yml)

### v0.117.5
- Workaround for Safari video bug.

### v0.117.0
- Improved support for embedded graphics in NYT Birdkit.
- More accessibility metadata for NYT graphics.

### v0.116.0
- Updated the list of options displayed in the settings text block.
- Added support for Layer:svg,inline notation to render an SVG layer as inline SVG (an alternative to setting the inline_svg option).
- Added support for NYT birdkit.

### v0.115.5
- Bug fix.

### v0.115.4
- Added lazy loading for videos. (Videos are added by putting a single text field containing the video URL in a layer with a ":video" suffix appended to the layer name.)
- Made videos tappable on mobile devices.

### v0.115.3
- Fixed the webfont name of an NYT font (nyt-magsans).

### v0.115.2
- Removed the untested version warning for AI 2023.
- Addressed a run-time error thrown when trying to modify a settings text block that is hidden or locked.

### v0.115.1
- Added "playsinline" attribute to video underlays, to fix a mobile Safari issue.

### v0.115.0
- Added :video :html-before and :html-after annotations for layer names. These special layers should have a single text object over one or more artboards, containing either the URL of a video (for video layers) or freeform HTML (for html-before and html-after layers).

### v0.114.0
- Change a setting name for NYT embedded ai2html graphics from DARK_MODE_INCOMPATIBLE to DARK_MODE_COMPATIBLE.

### v0.113.0
- Added support for ai2html-html-before and ai2html-html-after text blocks in the AI doc.
- Deprecated ai2html-html text blocks.

### v0.112.0
- Added DARK_MODE_INCOMPATIBLE setting to NYT embedded ai2html type graphics.
- Added "namespace" option, to support overriding the default g- prefix used for naming CSS classes and ids.

### v0.111.0
- Remove test to check for empty background images (too expensive on large complex files).

### v0.110.0
- Avoid generating empty background images and single-layer images.

### v0.109.0
- Detect and convert subscripted text.

### v0.108.1
- Individual layers tagged :png are now exported as 24-bit pngs if the image_format setting is "png24"

### v0.108.0
- Added a targetable classname to images.

### v0.107.0
- Fixed a bug affecting image generation from layers tagged with :png

### v0.106.0
- Updated resizer script to support multiple instances of the same graphic on a page.

### v0.105.0
- Remove obsolete IE8 fallback CSS.

### v0.104.0
- Remove warning message when using Illustrator 2022 (v26).

### v0.103.0
- Added 'type: embeddedinteractive' to relevant NYT config.yml files.

### v0.102.1
- Round fixed-size symbol width and height to prevent distortion from pixel snapping.
- Fix for stroke scaling of SVG polygons.

### v0.102.0
- Detect if the settings block is incompatible with NYT Preview.
- Detect if an NYTimes user is missing the required fonts.

### v0.101.0
- Remove "untested" warning for Illustrator 2021.

### v0.100.0
- Remove image size limits related to obsolete resource limits in IOS.

### v0.99.2
- Fix for guide shapes being rendered in :div and :symbol layers.

### v0.99.1
- Fix an issue causing a graphic sometimes not to resize after becoming visible by
to user interaction (e.g. if the graphic is on a tab or in an accordion).

### v0.99.0
- Show an appropriate error if Illustrator is confused by the document's file path (the scripting API is unable to read the document path if it contains a forward slash, preventing ai2html from saving any files).

### v0.98.1
- More performance improvements.

### v0.98.0
- Improve performance with documents containing many masked art objects.

### v0.97.0
- Remove untested warning for Illustrator 2020 (v24)

### v0.96.1
- Fixed bug causing image lazy-loading to occasionally fail.

### v0.96.0
- Add fix for NYT Scoop min-width problem.

### v0.95.0
- Detect superscript text.

### v0.94.1
- Scope all CSS classes to the outermost container (only a few weren't before).
- Fix for max_width setting in generated config.yml file

### v0.94.0
- Fix for a bug that caused fixed artboards to scale

### v0.93.0
- Fixed a centering bug when both max_width and center_html_output options were set.

### v0.92.0
- The resize function now displays the narrowest artboard when the graphic is displayed at an even narrower width.
- Fix for issue #120

### v0.91.2
- Bug fix

### v0.91.0
- Added support for per-artboard responsiveness by appending :dynamic and :fixed to the artboard name.
- Removed "include_resizer_classes" option.

### v0.90.0
- Added .eslintrc.json file
- Added the ability to export a layer as a transparent 8-bit png by appending :png to the layer name.

### v0.89.0
- Added NYT Scoop-specific cleanup code to resizer function.
- Text rotated < 1 degree is treated as unrotated.

### v0.88.0
- Added NYTImperial to NYT font list.

### v0.87.0
- Fixed center alignment of area text.

### v0.86.0
- Refactored the resizer/lazy loader.

### v0.85.0
- Fixed a problem where rotated text would shift away from its anchor point in dynamic layouts.

### v0.84.0
- Add 'vshift' option for font table entries, to correct for differences in vertical placement between fonts in Illustrator and their web font equivalents.

### v0.83.0
- Support alpha transparency and multiply in exported SVG. 

### v0.82.1
- Added "size: full" setting to NYT settings to work around a sizing issue in Scoop.

### v0.82.0
- Added "render_text_as" setting, which takes "html" (the default) or "image"

### v0.81.6
- Fixed misleading output message for inline SVG layer output

### v0.81.5
- Removed log message from resizer function
- Removed "not tested" message for AI 2019

### v0.81.4
- NYT bug fix: image output directory

### v0.81.3
- NYT bug fix: fixed html output directory

### v0.81.2
- NYT bug fix: show_in_compatible apps should be exported as "yes" or "no"

### v0.81.1
- Fix settings bug causing some images to be low-res.

### v0.81.0
- Group same-named together; keep groups together when "out" setting is "multiple-files".

### v0.80.1
- Fix for image_format setting error.

### v0.80.0
- Changed the format of the program settings object in ai2html.js to match the format of external ai2html-config.json config files.

### v0.79.0
- Added alt attribute to artboard images.

### v0.78.1
- Change sort order of option fields.

### v0.78.0
- Fix a crash when the document contains an opacity mask created from a linked raster.

### v0.77.0
- Read settings from config file named "ai2html-config.json", if present in the script directory and/or the .ai document directory.

### v0.76.1
- Fix for error when exporting artboards as SVG.

### v0.76.0
- Opacity applied to :svg layers is reflected in the HTML output.
- Fix for a layer stacking bug introduced in v0.75.0 (symbol/div layers were hidden behind artboard images).

### v0.75.0
- Set the dimensions of each artboard using CSS, so the graphic has the correct size even before the artboard image loads.
- Added NYT-specify interactive_size setting.

### v0.74.0
- Minor NYT-specific output changes.

### v0.73.0
- Added data-name= properties to div symbols if they are named in Illustrator.

### v0.72.3
- Added class containing layer name to symbol layer containers.

### v0.72.2
- Fix glitches with rendering to divs (flickering lines, rectangle detection).
- Added support for npm publish

### v0.72.1
- Load artboard image immediately if it intersects the browser viewport.

### v0.72.0
- Use IntersectionObserver api in the resizer function, so artboard images are only loaded when they are visible in the browser viewport.

### v0.71.2
- Support converting multi-segment lines to divs inside :div layers. (Segments must be horizontal or vertical).

### v0.71.1
- Render horizontal and vertical lines as divs inside layers with :div suffix.

### v0.71.0
- Render rectangles and circles as scaling divs if they have a parent layer with the :div suffix in its name.

### v0.70.0
- Render rectangles and circles as non-scaling divs if they have a parent layer with the :symbol suffix in its name.

### v0.69.1
- Bug fix

### v0.69.0
- Improved ids of inline SVG elements (based on original Illustrator object names, but unique within a document)
- Added "svg-id-prefix" setting for namespacing the ids of inline SVG elements to avoid collisions with other elements on the page
- Added "data-name" attribute to inline SVG elements, containing the original name of the Illustrator art object

### v0.68.1
- Bug fix

### v0.68.0
- Added 'inline_svg' setting, which inserts SVG output directly into the HTML output

### v0.67.3
- Added 'promo_image_width' setting, with 1024 as default

### v0.67.2
- Added 'data-aspect-ratio' property to artboard divs

### v0.67.1
- Remove fancy quotes from custom CSS and JS blocks. (AI likes to auto-convert regular double and single quotes to fancy quotes.)
- Try to fix some other errors in custom CSS, JS and HTML blocks.

### v0.67.0
- Switched to more compact SVGTINY format for SVG output.
- Show warning if SVG output includes linked images (Illustrator converts path effects into images during SVG export).
- Delete images created by Illustrator during SVG output.
- Remove "untested" warning when using Illustrator CC 2018.

### v0.66.4
- Fix for slight rightward shift of centered point text (Issue #84).

### v0.66.3
- Fix for bug causing misalignment of columns of text at some browser zooms, affecting Chrome and Safari (Issue #83).

### v0.66.2
- Fix: Prevent creation of single-layer image files with duplicate names.
- Prevent export of single-layer SVG files containing no artwork.

### v0.66.1
- Prevent scaling of line and polyline objects in exported SVG files.

### v0.66.0
- Export content of layers with ":svg" appended to their layer name as SVG files.

### v0.65.6
- Prevent paths in SVG output from scaling by adding CSS to the .svg file.

### v0.65.5
- Made "Yes" the default when prompting to create a promo image.

### v0.65.4
- Use separate CSS, HTML and JS blocks for compatibility with NYT vi system.

### v0.65.3
- Added NYTCheltenhamCond-BoldXC
- Improved performance on documents containing many masked images.

### v0.65.2
- Auto-detect output image format if image_format is set to "auto". (Uses jpg if a placed image is visible, otherwise uses png.)
- Detect NYT context by looking for proprietary Times fonts.
- Display a prompt when Times users run ai2html outside of a Preview project (the previous warming message was often overlooked).

### v0.65.1
- Change default use_lazy_loader setting to "yes" for NYT environment.

### v0.65.0
- Promote `ai2html-beta.js` to `ai2html.js`, rename old `ai2html.js` to `ai2html-legacy.js`

### v0.64.1 (ai2html-beta.js)
- Point text is valign:middle by default

### v0.64.0 (ai2html-beta.js)
- Character styles applied to text inside a paragraph are now preserved (e.g. a bolded phrase).
- Users are prompted to generate promo images when relevant (previously, promo images were automatically generated).
- Promo images are smaller than before, for performance (1024px instead of >3000px wide).
- Text fields hidden behind rectangular masks are no longer rendered.
- Opacity of text blocks is now calculated by combining the opacity of all parent groups and layers.
- "Multiply" blending mode is supported for text using CSS (works in current browsers, except IE).
- Improved SVG export (only visible objects that intersect the current artboard are included in the output file).
- Automatic detection of NYT Preview context (by checking for public/_assets directory).
- Added the ability to render text in the artboard image by appending `:image_only` to the artboard's name in Illustrator's Artboards panel.
- Fixed template rendering bug (issue #43).
- Fixed "can't paste type" error (issue #50).
- Fixed Isolation Mode runtime error (issue #35).
- Fixed inaccurate placement of rotated text with large leading (issue #58).
- Adding warnings for a range of potential problems.
- Improved display of runtime errors, including number of the source code line where an error occured.
- Added unit testing using Node.js and Mocha.
- Refactored source code.

### v0.63
- Fixed a bug that sometimes caused a graphic to disappear if the browser reported a fractional container width. This bug was discovered using Chrome 56 with the browser window zoomed.

### v0.62
- Changed the default value of `use_lazy_loader` to "no".
- Force double res if value of `use_2x_images_if_possible` is "always".
- Added additional variants of the NYTCheltenham typeface to the font table.

### v0.61
- Fixed: Clickable promo bug (issue #36).

### v0.60
- Added new NYT resizer script (p.r. #32).

### v0.59
- Added "summary" setting.

### v0.58
- Added "xxlarge" artboard width.

### v0.57
- Added progress bar.

### v0.56
- Added “write_image_files” setting.
- Added “show_completion_dialog_box” setting.
- Added automatic measuring of breakpoints based on artboard widths
- Allowed disabling of resizer widths using include_resizer_widths
- Added “project_name” setting 
- Made rounding to pctPrecision smarter (don't add decimals if number is already round)
- Fixed HTML rendering of rotated and skewed text 
- Set default value for “render_rotated_skewed_text_as“ to "html"
- Hiding elements outside of artboard on SVG export

### v0.55
- Removed nyt5 attribute from fonts array and added instructions on how to add custom fonts.

### v0.54
- Added docName var to docSettings to make it easy to refer to filename.

### v0.53
- Change png_transparency default to "no" because transparency degrades the quality of the images too much.
- Change a few other defaults.
- Change var name ai2htmlStub to ai2htmlPartial for consistency.
- Remove Google Analytics option in NYT mode.

### v0.52
- In non-NYT mode, export files using defaults even if no settings block exists.
- Fix error with image path on NYT projects where the html files are being written to the src folder.

### v0.51
- Change settings from two vars to one (consolidated ai2html and yml into a single settings object).
- Create a new settings block type called ai2html-text for things that get put into variables, but don't want to be considered the main settings block.
- Fix min and max width values in the yml.
- Trap for limits in the size of the image (specifically promo images for extreme aspect ratios). Illustrator jpg export has a vertical scaling limit of 776.19.
- Prevent promo images from being generated that are too large.
- Find a better way to recurse the regex to look for curly quotes inside angle brackets.
- Check that output folders exist, if not, create them.
- Get rid of artboard warnings in non-NYT modes and preview and scoop slugs from header output.
- Get rid of ymlSettings object and replace with docSettings.
- Add classes and tweak id’s to overall html stub and to artboards to allow easier custom targeting.
- Add option to center artboard/html output on page.
- Change how custom sizes are added to artboard names. Use the convention ":300" to indicate the pixel width of the container to begin showing that artboard.
- Base artboard id's only on the artboard name and not on the ai artboard number. This is so that if you have specific css tied to an artboard, changing the order of the artboards in Illustrator will not affect your targeting of it.

### v0.50
- If text frame or object has name, then make that name the ID of object.
- If text color is darker than #231f20 or something slightly lighter than that, force it to #000 so blacks come out black.
- Add image format options for png24 and svg (but svg is for testing only -- it's not quite ready for primetime yet).
- Added max width override into settings.
- Added display_for_promotion_only, show_in_compatible_apps, environment and other new NYT5 preview settings to yml.
- Add ability to change path and file extension of output. NOTE: The path is only customizable if the preview project type is NOT ai2html. Otherwise the output is forced to be in public/index.html.
- If project type is ai2html, then don't use the custom html path. Add information alert if so.
- Replace curly quotes inside <> tags and with straight quotes inside text blocks. Only searches up to 8 instances of curly quotes inside angle brackets. [Need to make a more elegant solution for this.]
- Add testing mode that renders all text in image and makes text 50% opaque to see how will things are placed.
- Force promo to have no transparency and be png instead of png24.
- Added 'width:100% !important;' to image style to fix NYT5 css bug/feature for IE.
- Add ability to output straight file without resizer responsiveness.
    - use_lazy_loader determines if <img> are loaded with placeholders at first, or the src specifies the real images.
    - include_resizer_css_js determines whether references to the resizer css and js are added to the html output.
    - include_resizer_classes determines if the g-show classes get added to the artboard divs.
    - Perhaps set these up so that if they are not specified in settings, then the script uses settings that are determined by the file context. It only overrides the auto settings if the setting is explicitly set in the settings block.
- If responsiveness is static and the max_width has not been specified, then it should be set by the size of the largest artboard.
- Templating can now use ejs/erb notation, as well as mustache notation, or both at the same time. The script will substitute both.
- Add local export and previewing in custom local template.
- Add ability to write config.yml to custom path and filename.
- Add option to add google analytics.

### v0.49
- Changed promo image size to super large.
- Force png promo images to not be transparent, even if the graphic png is tranparent.

### v0.48
- Added all justification modes even though they won't justify last line correctly.
- Change options for multifile export to "one file" or "multiple files" instead of other mumbo-jumbo.
- Add options to make png's transparent and change png and jpg quality.
- Auto adjust setting block to height of all settings.
- Add mustache templating for all variables in settings. You can also add additional variables into the setting block that become available to you in the template.
- Add aifile, scoop and preview slugs to project header.
- In dynamic mode, make area text width vary by pct.
- Added vertical alignment ability (top and bottom) by entering "valign:bottom" in the notes field in the attributes palette.
- Added custom id's for text frames if you just name the text object in the layers palete.
- Add support for Stymie fonts. Right now nyt5 only has Stymie extra bold.

### v0.47
- Add option to export separate files for every artboard.
- Add update date to yml settings.
- Add lazy load of images.
- Fix problem with duplicate named artboards (problem with naming image files on export).
- Fix id's so that they are really unique.
- Allow forcing scaling to be 100% for images.
- Add export of large promo image.
- Add option to export separate files for every artboard. Also add option to have unified css for all exported files.
- Normally the maxwidth in the yml is written to correspond with the width of the largest artboard. Thus dynamic graphics will not go any larger than the largest artboard. If you want to override this, you need to name the largest artboard so that it has an "ai2html-" in front of the viewport width that you want that artboard to start showing at. In this case, the artboard will scale all the way up to 1050.

### v0.46
- Simplified messages for preview project folder structure errors.
- Fixed order of unhiding, unlocking and saving.
- Exclude hidden text from the html by looking up the document tree to see if any parent objects are hidden.
- Script will work whether or not anything is are locked.
- Script will trudge through any text frames that are not RGB or Grayscale filled.

### v0.45
- Fixed file saving without pdf compatibilty to minimize ai file size.
- Added dynamic/fixed resizing of graphic. responsiveness=dynamic means graphic and text positions scales to width of outer div. For artboards that you want to be dynamic, you will need to specify the min and max viewport sizes you want it to appear in by naming the artboard like this: ai2html-600-945, where 600 is the minimum width that artboard will be used and 945 is the max.

### v0.44
- Added check for project_type: ai2html to prevent overwriting yml on embed projects.

### v0.43
- Added "preview-embed" mode to create html snippet to embed in Preview projects.
- Fixed problem with adding classes for small viewports that have no native artboards.

### v0.42
- Added tags to yml, removed dummy hed and intro from yml.
- Made unix line feeds for index.html.

### v0.40
- Restored double res logic for image export.
- Fix image width exports.

### v0.39
- Added more checks: settings file, valid file location within preview project
- Create settings text block if none is there.

### v0.38
- Restored check for rgb.
- Made file output UTF-8.

### v0.37
- Initial release of nyt5 abilities.

### v0.27
- Added 970 and 600 template previews.

### v0.27c
- Added multi-artboard responsive output.

### v0.26
- Sort output top to bottom, left to right.
- Added basic opacity support.

### v0.25
- Added pct output option.
- Changed double res image output threshold for jpgs to allow for larger 32 megapixel size limit.

### v0.24
- Fixed order of substituting html character codes so the &amp; is last (otherwise the & gets subbed out on all previous codes).
- Fixed problem where centered area text was getting it's left margin offset by -10.
- Change output filename to graphic name + time stamp.
- Output double res image only if less than 3,145,728 pixels so it remains visible on old iPhones.
- Added warning if single res image is too large.
- Added ability to add custom css, html and js blocks to the output from the ai file.

### v0.23
- Added support for nyt-franklin

### v0.22
- Added search/replace for all html character codes. Should replace all non-standard characters with their html character code.

### v0.21
- Added more explicit namespacing of the overall div so that css from multiple ai2html graphics on one page don't override each other.
- Added double-res image export by default.
- Added export of jpg and png8 versions of image.

### v0.20
- Added search for additional possible minus sign (\u2212) which is not an en dash.
- Added class for containing layer.
