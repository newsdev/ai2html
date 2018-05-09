### v0.72.0
- Use IntersectionObserver api in the resizer script, so artboard images are only loaded when they are visible in the browser viewport.

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
