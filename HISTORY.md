## Table of contents

- [Change log](#change-log)
- [To do](#to-do)


## Change log

- v59
  - Added "summary" setting.
- v58
  - Added "xxlarge" artboard width.
- v57
  - Added progress bar.
- v56
  - Added “write_image_files” setting.
  - Added “show_completion_dialog_box” setting.
  - Added automatic measuring of breakpoints based on artboard widths
  - Allowed disabling of resizer widths using include_resizer_widths
  - Added “project_name” setting 
  - Made rounding to pctPrecision smarter (don't add decimals if number is already round)
  - Fixed HTML rendering of rotated and skewed text 
  - Set default value for “render_rotated_skewed_text_as“ to "html"
  - Hiding elements outside of artboard on SVG export
- v55
  - Removed nyt5 attribute from fonts array and added instructions on how to add custom fonts.
- v54
  - Added docName var to docSettings to make it easy to refer to filename.
- v53
  - Change png_transparency default to "no" because transparency degrades the quality of the images too much.
  - Change a few other defaults.
  - Change var name ai2htmlStub to ai2htmlPartial for consistency.
  - Remove Google Analytics option in NYT mode.
- v52
  - In non-NYT mode, export files using defaults even if no settings block exists.
  - Fix error with image path on NYT projects where the html files are being written to the src folder.
- v51
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
- v50
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
- v49
  - Changed promo image size to super large.
  - Force png promo images to not be transparent, even if the graphic png is tranparent.
- v48
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
- v47
  - Add option to export separate files for every artboard.
  - Add update date to yml settings.
  - Add lazy load of images.
  - Fix problem with duplicate named artboards (problem with naming image files on export).
  - Fix id's so that they are really unique.
  - Allow forcing scaling to be 100% for images.
  - Add export of large promo image.
  - Add option to export separate files for every artboard. Also add option to have unified css for all exported files.
  - Normally the maxwidth in the yml is written to correspond with the width of the largest artboard. Thus dynamic graphics will not go any larger than the largest artboard. If you want to override this, you need to name the largest artboard so that it has an "ai2html-" in front of the viewport width that you want that artboard to start showing at. In this case, the artboard will scale all the way up to 1050.
- v46
  - Simplified messages for preview project folder structure errors.
  - Fixed order of unhiding, unlocking and saving.
  - Exclude hidden text from the html by looking up the document tree to see if any parent objects are hidden.
  - Script will work whether or not anything is are locked.
  - Script will trudge through any text frames that are not RGB or Grayscale filled.
- v45
  - Fixed file saving without pdf compatibilty to minimize ai file size.
  - Added dynamic/fixed resizing of graphic. responsiveness=dynamic means graphic and text positions scales to width of outer div. For artboards that you want to be dynamic, you will need to specify the min and max viewport sizes you want it to appear in by naming the artboard like this: ai2html-600-945, where 600 is the minimum width that artboard will be used and 945 is the max.
- v44
  - Added check for project_type: ai2html to prevent overwriting yml on embed projects.
- v43
  - Added "preview-embed" mode to create html snippet to embed in Preview projects.
  - Fixed problem with adding classes for small viewports that have no native artboards.
- v42
  - Added tags to yml, removed dummy hed and intro from yml.
  - Made unix line feeds for index.html.
- v40
  - Restored double res logic for image export.
  - Fix image width exports.
- v39
  - Added more checks: settings file, valid file location within preview project
  - Create settings text block if none is there.
- v38
  - Restored check for rgb.
  - Made file output UTF-8.
- v37
  - Initial release of nyt5 abilities.
- v27
  - Added 970 and 600 template previews.
- v27c
  - Added multi-artboard responsive output.
- v26
  - Sort output top to bottom, left to right.
  - Added basic opacity support.
- v25
  - Added pct output option.
  - Changed double res image output threshold for jpgs to allow for larger 32 megapixel size limit.
- v24
  - Fixed order of substituting html character codes so the &amp; is last (otherwise the & gets subbed out on all previous codes).
  - Fixed problem where centered area text was getting it's left margin offset by -10.
  - Change output filename to graphic name + time stamp.
  - Output double res image only if less than 3,145,728 pixels so it remains visible on old iPhones.
  - Added warning if single res image is too large.
  - Added ability to add custom css, html and js blocks to the output from the ai file.
- v23
  - Added support for nyt-franklin
- v22
  - Added search/replace for all html character codes. Should replace all non-standard characters with their html character code.
- v21
  - Added more explicit namespacing of the overall div so that css from multiple ai2html graphics on one page don't override each other.
  - Added double-res image export by default.
  - Added export of jpg and png8 versions of image.
- v20
  - Added search for additional possible minus sign (\u2212) which is not an en dash.
  - Added class for containing layer.

## To do

(Will move these to issues at some point.)

##### General
- Change docSettings.output to only look for multiple-files so otherwise will default to one file.
- Make legacy settings function that substitutes current names for legacy ones.
- Get rid of namespacing on classes added from layer names -- or maybe not -- need to think this thru again.
- Add a settings version check.
- Add data information for min and max widths to show artboard.
- Add a warning to the user that there are artboards with duplicate names.
- Add a warning about text within graph items not being rendered in html.

##### NYT5
- Insert css from css file in a fixed location in the preview project. This way we can put NYT5 fixes in a standard location in the preview project and have those "hacks" automatically included in every preview project.
- Add option to enclose html in <a> so can make it a clickable promo.
- In ai2html base preview project, change yml so it only has one line: project_type: ai2html
- In ai2html base preview project, add NYT5 css hacks page to insert into every project and insert into html css if exists.
- Come up with better solution for writing the image path into the html for non-ai2html preview projects. Right now it's hardcoding

##### Graphics and SVG
- Export SVG from layers named "ai2html-svg" and place them in the document in the stacking order with text.
  - Loop thru SVG files and use "<text.+display:none.+>.+</text>\r" to remove hidden text from files.
  - SVG output includes everything that is not on the artboard -- figure out how to get rid of it.
- Go thru and draw any rectangles and vertical or horizontal lines as divs (so that rules always stay the same width no matter the scale)

##### Interface
- Add gui dialog at beginning if no settings block is in the doc so the user choose how many settings to show, which mode (ai2html, preview standard).

##### Errors and warnings
- Add check for version of the settings block.
- Add error if html and image output paths do not exist.
- Add warning if headline is missing.
- Add warning about using Franklin light.
- Check for duplicate id's and artboard names and give warning.
- On multifile export, will have to trap for artboards with same name.
- write error if text is stoked or has effects
- check for spot colors and decode them into rgb. Until then, add error message at end to inform user about possible errors.

##### Text output
- Change line-height to ratio instead of pixels.
- Inline resizer css and resizer js.
- Add option to burn text into image by adding attribute to text frame (instead of using rotation).
- traverse document stack to see if text box has opacity setting, then use
- Add classes for all parent layers of text frame.
- Add classes to all things with ids (namely the overall box) so that they can be targeted as a group.
- Make paragraph alignment an element style instead of a paragraph style
- If headline and intro fields are blank, don't add them to yml -- but if they have a "" then, send a blank hed and intro.
- Add ability to add html blocks to each artboards output.
- Add back in the extrawidthpct=3 for area text but need to check for edge of artboard to eliminate overflows.
- Figure out what to do with no fill text -- display:none? <br>?
- style empty lines in between things. fix problem with getting styles for blank lines (to determine proper leading)
- if line begins with a space, change it to a nbsp
- determine span styles for character styles within a paragraph
- if last character(s) in a paragraph is/are space(s) then ignore them for styling.
- set styling of paragraph to most used style in paragraph instead of last character.
- make option to set height of text box and set overflow to hidden
- store stacking order and set z-index
- This is to make it easier to edit once and make sure you have made those edits everywhere that is necessary. The order of the text blocks in the ai2html-text block should be sorted to make editing easier, perhaps with short grafs and long grafs grouped together.

##### Dynamic behavior
- Make sense of when dynamic behavior kicks in. Seems like it is also dependent on when artboard sizing is specified.
- Allow setting of upper and lower bounds for artboards. Also, allow better naming of artboards.

##### Bugs
- text in double-nested groups seemed to render twice: once in the image, once as web text. (dwtkns) Duplicate text rendering in image may be caused by grouped text in which the text object is the only thing in the group.
- Don't crash when file is not saved. Give warning.

##### Image output
- Generate images at the 1x or 2x the largest size they may appear, instead of the artboard size.
- Change double res image filtering to only affect images that would show up on iPhone.
- Add warning about slow performance if outputing preview image if not an ai2html project.

##### Overall functionality
- Add ability to specify which artboards to attach custom css/js/html.
- Add support for rotated/skewed text.
- Check opacity of all containing objects to determine opacity of text.
- Base paragraph styles on most common paragraph style.
- When exporting separate files for every artboard, add option for unified css.
- Add templating, ie create datafile of text blocks so that identical text can be edited and reapplied in the datavault or googledoc.
- parameterize the attributes so that the user can choose which get applied at the css level and which at the element level
