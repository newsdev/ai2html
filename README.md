# ai2html

> ai2html is a script for Adobe Illustrator that converts your Illustrator artwork into an html page.

## About

The script renders text as absolutely positioned html elements. The remaining art is exported as an image that is placed underneath the text in the html. Each artboard can be rendered as a separate div in a single file, or as separate files. The exported files are html partials, that is, everything is enclosed in a div that can be inserted into a page template. It is also possible to specify an html page template to insert the partial to preview your artwork in the context of your site architecture and css.

## Table of contents

- [How to install ai2html](#how-to-install-ai2html)
- [Overview of how to use ai2html](#overview-of-how-to-use-ai2html)
- [Limitations](#limitations)
- [Technical reference](#technical-reference)
  - [Which attributes are converted to html and css](#which-attributes-are-converted-to-html-and-css)

## How to install ai2html

Move the ai2html.jsx file into the Illustrator folder where scripts are located. For example, on Mac OS&nbsp;X running Adobe Illustrator CC 2014, the path would be:
```
Applications\Adobe Illustrator CC 2014\Presets\en_US\Scripts\ai2html.jsx
```

## Overview of how to use ai2html

1. Create your Illustrator artwork. Size the artboard to the dimensions that you want the div to appear on the web page.
2. Make sure your `Document Color Mode` is set to `RGB`. You can do this from the `File` menu.
3. Make sure you have already saved your document. The script uses the location of the ai file to put a folder into which the exported html and image files are saved.
4. Run the script by choosing: `File > Scripts > ai2html`
5. Go to the folder containing your Illustrator file. Inside will be a folder called `ai2html-output`. Open the html files in your browser to preview your output.

## Limitations

* Because numbers get rounded to whole pixels by the web page when formatting text and positioning elements, the html version of a graphic will not line up exactly with its Illustrator version. Rounding differences are particularly compounded if you have blocks of text that span many lines and have fractional leading in Illustrator.
* The script currently only sets one style per paragraph, so custom styled words or characters within a paragraph are ignored. Each paragraph’s style is determined by the middle character in the paragraph.
* The script assumes that text always goes above the art.
* Artboards should have unique names.
* Paragraphs with full justification and center/left/right specified will just be “justified” in html.
* If text is not hidden using the hide command, but rather is hidden because it is behind a mask, it will show up if it is within the artboard.
* Labels in graph objects will be rendered as part of the image. (Something changed in newer versions of CC in the way text objects inside the graph object are handled.) If you want your chart labels to be shown as html, you will need to ungroup the chart.

## Technical reference

#### Which attributes are converted to html and css
The script processes each text object in your Illustrator file and translates these attributes into css styles. Each point- or area-text object is converted into a `<div>`. Each paragraph in the text object are converted into `<p>` tags within the `<div>`.
* Inline styles on the `<div>`
  * Position
  * Opacity
* CSS styles applied to `<p>` tags
  * Font
  * Text size
  * Leading
  * Paragraph space before and after
  * Paragraph alignment
    * This may not behave as expected for point text objects, as there are really no such things in html. If you really want to have different paragraph justification within a single text object, you should do it with an area text object.
    * The alignment of the first paragraph of a text object determines how it is placed in the html. If the first paragraph is left aligned, then on the web page the whole text object will be absolutely positioned from it’s left edge. If the first paragraph is right aligned, the text object will be positioned from it’s right edge.
  * Capitalization
  * Text color
  * Character tracking
  * This is important because fonts are rendered slightly differently across browsers and operating systems. This means that in IE on a Windows machine, the font may be a bit larger than in Chrome on a Mac. So a label next to a city dot on a map end up too far away or overlapping the dot if you do not paragraph align the text relative to the dot.



Features
Custom css, js, html
Adding classes by using layers
Alignment
Vertical alignment
Mustache templating
Dynamic
Lazy load
Image settings
Promo image auto generated
Output to one html file or multiple html files.
Artboard
Naming to set lower viewports
Add “-” to front to ignore



Options set by where you put your ai file
If the file is in the ai folder in an ai2html project, the html output automatically goes into the public folder of the Preview project.
If the file is in the ai folder of a Preview project that is not an ai2html project, the html output goes into the src folder of the Preview project.
The ai2html script determines if the Preview project is an ai2html project by checking to see if “project_type” in the config.yml is set to “ai2html.”

Options set by the ai2html-settings text block
These are generally not space or tab sensitive. Just separate the setting name from the option with a colon.
image_format
Options:
png
jpg
Notes:
You can specify both png and jpg by typing both of them separated by a comma — as in “png, jpg” — if you want to just generate both and see which one is larger. Only the first one in the list will be used in the output.
Generally, select png for graphics that have fewer colors, like charts. Select jpg if there are photographic images or many gradients/blends.
responsiveness
Options:
fixed
dynamic
Notes:
The fixed option will generate a static graphic at the size of the artboard.
If you specify dynamic, the web output will scale to fill the width of the div that you put the html output into.
output
Options:
preview-one-file
preview-multiple-files
Notes:
The one-file option will put the html for all artboards into a single html file called index.html.
The multiple-file option will generate a separate html file for each artboard. The files will be named a composite of the ai filename and the artboard name.
use_lazy_loader
Options:
yes
no
Notes:
If yes is specified, then a dummy image (a transparent png) is inserted into the html output in place of the image. Data attributes are added to the img tag so that the real image is only loaded if the viewport that uses the image is actually active. This prevents the images from artboards for other viewports from loading, thus allowing the page to load more quickly. This option will also force the inclusion of resizer.js and resizer.css onto the page which is the magic that swaps out the images.
If no is specifed, then the urls of images for all artboards and viewports are hardcoded in the html. Beware that for pages with large images or many images, choosing this option will make the page load more slowly because it will be loading unnecessary images.
use_2x_images_if_possible
Options:
yes
no
Notes:
If yes, the script will generate double resolution images if the image size does not exceed the pixel limit for older iPhones.
create_promo_image
Options
yes
no
Notes:
If yes, the script will generate a jpg or png (depending on what is specified by image_format) at a very large size to satisfy the requirements of Scoop promo images.
png_transparent
Options
yes
no
Notes
If yes, png images used in the html output will have a transparent background.
png_number_of_colors
Options
A number from 2 to 256
Default is 128
Notes
If png is selected in image_format, this can be used to set the quality of the png. Higher numbers may improve the image quality, but will also increase the file size.
jpg_quality
Options
A number from 0 to 100
Default is 80
Notes
If jpg are selected in image_format, this can be used to set the quality of the png. Higher numbers may improve the image quality, but will also increase the file size.

headline, leadin, notes, credit, sources
Options
Text. Cannot contain returns.
last_updated_text
Options
page_template : { useQuoteMarks:false, defaultValue:"nyt5-article-embed" },
scoop_publish_fields : { useQuoteMarks:false, defaultValue:"true" },
publish_system : { useQuoteMarks:false, defaultValue:"scoop" }, // or scoop_stg
scoop_username : { useQuoteMarks:false, defaultValue:"" },
scoop_slug : { useQuoteMarks:false, defaultValue:"" },
scoop_external_edit_key : { useQuoteMarks:false, defaultValue:"" },
scoop_asset_id : { useQuoteMarks:false, defaultValue:"" }


Options set by the artboard palette


Options set by the layers palette


Options set by the object’s “Notes” attribute