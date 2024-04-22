---
layout: index
sidebar_menu:
  '#how-to-install-ai2html': How to install
  '#how-to-use-ai2html': How to use
  '#how-does-ai2html-work': How does it work
  '#table-of-contents': Full table of contents
  examples.html: Examples
  https://github.com/newsdev/ai2html/blob/master/CHANGELOG.md: Changelog
---


{% include ai2html-black.html %}

> ai2html is an open-source script for Adobe Illustrator that converts your Illustrator documents into html and css.

Here are [examples of how we’ve used the script](https://del.icio.us/archietse/ai2html+nyt) at The New York Times and [examples of how others](https://del.icio.us/archietse/ai2html+others) have used it. Share your ai2html projects on Twitter, Delicious, etc. using <a href="https://twitter.com/search?q=%23ai2html&amp;src=typd" target="_blank">#ai2html</a>.

## Table of contents

- [How to install ai2html](#how-to-install-ai2html)
- [How to use ai2html](#how-to-use-ai2html)
- [Frequently asked questions](#frequently-asked-questions)
- [Settings](#settings)
- [Point text vs. area text](#point-text-vs-area-text)
- [Which attributes are converted to html and css](#which-attributes-are-converted-to-html-and-css)
- [How does ai2html work](#how-does-ai2html-work)
- [Limitations](#limitations)
- [What works well and what does not](#what-works-well-and-what-does-not)
- [Using fonts other than Arial and Georgia](#using-fonts-other-than-arial-and-georgia)


## How to install ai2html

Download the [latest version of the script here](https://github.com/newsdev/ai2html/raw/master/ai2html.js) by clicking the link and saving the file to your computer.

Move the `ai2html.js` file into the Illustrator folder where scripts are located. For example, on a Mac running Adobe Illustrator CC 2015, the path would be:
```
/Applications/Adobe Illustrator CC 2015/Presets/en_US/Scripts/ai2html.js
```

## How to use ai2html

1. Create your Illustrator artwork.
  - Size the artboard to the dimensions that you want the div to appear on the web page.
  - Make sure your `Document Color Mode` is set to `RGB`.
  - Make sure your document is saved.
  - Use Arial or Georgia unless you have added your own fonts to the `fonts` array in the script.
2. Run the script by choosing: `File > Scripts > ai2html`
3. Go to the folder containing your Illustrator file. Inside will be a folder called `ai2html-output`. Open the html files in your browser to preview your output.


## Frequently asked questions

- **Why not just export my Illustrator file as an image or an SVG?**
  - Text in images and SVGs scale as you scale the image — so your text becomes unreadable pretty quickly as the artwork scales down, or looks hilariously large as it scales up. By rendering the text as html, we can scale the “graphic” up and down, but keep the text readable at the same font-size and line-height. This is important because we are trying to reduce the number of versions of the artwork that we have to create in order to accommodate viewports that range from mobile phones up to giant desktop monitors. An example of this is here: http://nyti.ms/1CQdkwq Change your window size when you view the page and you'll see the artwork scale but the text stays the same size. More examples here: https://del.icio.us/archietse/ai2html+responsive
  - When Illustrator saves an SVG, every line of text is broken into separate SVG elements which makes editing the text very difficult. By having the text rendered in HTML, it is much easier for editors to go into the CMS and make edits without having to wade through a tangle of SVG code.


## Settings

There are several ways of customizing the output of the script:

- [Config files](#config-files)
- [Special text blocks](#special-text-blocks)
  - [ai2html-settings](#ai2html-settings)
  - [ai2html-css](#ai2html-css)
  - [ai2html-js](#ai2html-js)
  - [ai2html-html](#ai2html-html)
  - [ai2html-text](#ai2html-text)
- [Layers palette](#layers-palette)
- [Artboards palette](#artboards-palette)
- [Attributes palette](#attributes-palette)

#### Config files

The script will look for files named `ai2html-config.json` in two locations: the Illustrator scripts folder where the `ai2html.js` file is located and the folder containing your `.ai` file. Any settings contained in these files will override the default program settings, and will be overridden by any settings contained in the `.ai` file (see "Special text blocks" below). Configuration data should match the format of the `defaultSettings` object near the top of the `ai2html.js` file.

**New** If the config file includes `"create_text_block": false`, then ai2html will not create the settings text block described below.


#### Special text blocks

The script recognizes five special types of text blocks. The first line of the text block should begin with `ai2html-` followed by one of the following keywords: `settings`, `css`, `js`, `html` or `text`. This should be the only thing on the first line of the text block. The special text blocks can be placed anywhere in your Illustrator document, but note that if you place them on an artboard, their contents will be rendered in your output.

##### `ai2html-settings`

When you run ai2html for the first time in your ai file, the script will place a settings text block to the upper left of all your artboards. Here is a description of the settings:

*Options that are included in the settings text block by default:*

- **image_format**
  - <span style="font-variant: small-caps">Possible values</span>: `png` `png24` `jpg` `svg` `auto`
  - <span style="font-variant: small-caps">Default</span>: `auto`
  - You can specify more than one image format to be output by listing the desired formats separated by commas. This can be useful if you want to see which image format has the smallest file size. The first format in the list will be the only one referenced in the html. See [example](examples.html#svg-artboards) for SVG output. The `auto` option uses `png` by default, or `jpg` if the graphic includes a raster image, which is likely to be continuous-tone.
- **responsiveness**
  - <span style="font-variant: small-caps">Possible values</span>: `fixed` `dynamic`
  - <span style="font-variant: small-caps">Default</span>: `fixed`
  - `dynamic` responsiveness means that the ai2html divs will scale to fill the container they are placed in.
  - `fixed` responsiveness means that the ai2html div will appear only at the size it was created in Illustrator and will not change sizes if the container it is placed in changes size.
- **output**
  - <span style="font-variant: small-caps">Possible values</span>: `one-file` `multiple-files`
  - <span style="font-variant: small-caps">Default</span>: `one-file`
  - `one-file` output means that all artboards will be written into one html file.
  - `multiple-files` output means that each artboard will be written to separate html files.
- **html_output_path**
  - <span style="font-variant: small-caps">Default</span>: `/ai2html-output/`
  - Use this if you want to redirect the output to a different folder. The path should be written relative to the location of the ai file.
- **html_output_extension**
  - <span style="font-variant: small-caps">Default</span>: `.html`
  - Use this if you want to change the extension of the html partial.
- **image_output_path**
  - <span style="font-variant: small-caps">Default</span>: `<blank>`
  - Use this if you want to change the path of the images that are placed behind the html text. This path should be written relative to the location of the `html_output_path`.
- **image_source_path**
  - <span style="font-variant: small-caps">Default</span>: if not set, `image_output_path` will be used
  - In some scenarios the relative path between published html and images is different from how the files are stored. Use `html_source_path` to specify the location from where the images are loaded in the `<img>` tags. This does not change where image files are stored.
- **local_preview_template**
  - <span style="font-variant: small-caps">Default</span>: `<blank>`
  - Use this to specify a page template into which the html partial will be inserted to preview your artwork in the context of your site architecture and css. Sample templates can be downloaded from the ai2html Github repo. Any variables from ai2html-settings or ai2html-text blocks can be inserted into the templates using either mustache (eg. &#123;&#123;headline&#125;&#125; ) or ejs/erb (eg. `<%=headline%>`) notation. The ai2html partial can be inserted using the `<%=ai2htmlPartial%>` variable.
- **png_number_of_colors**
  - <span style="font-variant: small-caps">Possible values</span>: Any integer from `2` to `256`
  - <span style="font-variant: small-caps">Default</span>: `128`
  - Use this to specify the quality of `png` or `png24` images.
- **jpg_quality**
  - <span style="font-variant: small-caps">Possible values</span>: Any integer from `0` to `100`
  - <span style="font-variant: small-caps">Default</span>: `60`
  - Use this to specify the quality of `jpg` images.
- **headline**<br>**leadin**<br>**notes**<br>**sources**<br>**credit**
  - <span style="font-variant: small-caps">Possible values</span>: Text with no line breaks
  - These fields are used to populate fields in the `local_preview_template` and can be written to a “config” text file along with the html. The config file is written in yml can be used to pass parameters to a cms.

*Other options that can be added to the settings text block (or an ai2html-config.json file):*
- **text_responsiveness**
  - <span style="font-variant: small-caps">Possible values</span>: `fixed` `dynamic`
  - <span style="font-variant: small-caps">Default</span>: `dynamic`
  - This setting controls whether blocks of HTML text converted from Illustrator "area text" objects have a fixed width or expand and contract in proportion to the width of the graphic.
- **max_width**
  - <span style="font-variant: small-caps">Possible values</span>: Any positive integer
  - <span style="font-variant: small-caps">Default</span>: `<blank>`
  - Specifying a `max_width` inserts a max-width css instruction on the div containing the ai2html partial. The width should be specified in pixels.
- **create_config_file**
  - <span style="font-variant: small-caps">Possible values</span>: `true` `false`
  - <span style="font-variant: small-caps">Default</span>: `false`
  - Specify `true` if you want the script to also output a text file in yml format containing the parameters you want to pass to your cms.
- **config_file_path**
  - <span style="font-variant: small-caps">Default</span>: `<blank>`
  - <span style="font-variant: small-caps">Example</span>: `/ai2html-output/config.yml`
  - Enter the full path to the file including the filename that you want the config file to be named. The path should be written relative to the location of the Illustrator file.
- **png_transparent**
  - <span style="font-variant: small-caps">Possible values</span>: `yes` `no`
  - <span style="font-variant: small-caps">Default</span>: `no`
  - This option enables transparency for any png image that is output by the program. Note that specifying transparent pngs can result in a visible degradation in image quality. Using `image_format: png24` can help prevent this.
- **center_html_output**
  - <span style="font-variant: small-caps">Possible values</span>: `true` `false`
  - <span style="font-variant: small-caps">Default</span>: `true`
  - Specifying `true` on this option causes the ai2html div to be centered within the container it is placed in.
- **use_2x_images_if_possible**
  - <span style="font-variant: small-caps">Possible values</span>: `yes` `no`
  - <span style="font-variant: small-caps">Default</span>: `yes`
  - Specifying `yes` on this setting tells the script to output images at double the resolution if possible. The script uses limits specified in this [document](http://apple.co/1M1dvES) to determine if the size of the image is too large to make it double resolution.
- **clickable_link**
  - <span style="font-variant: small-caps">Default</span>: `<blank>`
  - Use this to wrap the entire graphic in an `<a>` tag pointing to the given URL.
- **testing_mode**
  - <span style="font-variant: small-caps">Possible values</span>: `yes` `no`
  - <span style="font-variant: small-caps">Default</span>: `no`
  - Specifying `yes` on this setting causes the text in the file to be rendered both on the image and in the html. This is useful for testing whether the placement of html text is consistent with the Illustrator file.
- **render_rotated_skewed_text_as**
  - <span style="font-variant: small-caps">Possible values</span>: `html` `image`
  - <span style="font-variant: small-caps">Default</span>: `html`
  - Specifying `image` on this setting causes rotated and sheared text in the file to be rendered on the image instead of the html. See [example](examples.html#rotated-and-sheared-html-labels).
- **project_name**
  - <span style="font-variant: small-caps">Possible values</span>: Any string
  - <span style="font-variant: small-caps">Default</span>: `[ai file name]`
  - By default ai2html will use the filename of your Illustrator document as the project name but you can specify a `project_name` to overwrite this. The project name will be used to name the exported HTML and image files.

##### `ai2html-css`

If you want to [add some css](examples.html#custom-css) that is always inserted into your html partial, include it in a text block somewhere in your Illustrator document, but not on an artboard. Make the first line of the text block read `ai2html-css`. The css will be added inside `<style>` tags so don’t include `<style>` tags in the text block.

##### `ai2html-js`

If you want to add some javascript that is always inserted into your html partial, include it in a text block somewhere in your Illustrator document, but not on an artboard. Make the first line of the text block read `ai2html-js`. The js will be added at the end of all the html for each artboard. You will need to include the enclosing `<script>` tags in the text block.

##### `ai2html-html`

If you want to add some html that is always inserted into your html partial, include it in a text block somewhere in your Illustrator document, but not on an artboard. Make the first line of the text block read `ai2html-html`. The html will be added at the end of all the divs for each artboard.

##### `ai2html-text`

You can store text into variables and insert them into your document using basic mustache or erb/ejs notation. Any variables in the `ai2html-settings` or in `ai2html-text` blocks can be used.

To assign text to a variable, create a text block somewhere in your Illustrator document, but not on an artboard. Make the first line of that text block read `ai2html-text`. Each subsequent paragraph should be in the format of `variable_name: Lorem ipsum dolor.`. Variable names should only be letters, numbers and underscores.

Now you can insert that text anywhere in your document by placing &#123;&#123;variable_name&#125;&#125; or `<%=variable_name%>` where you want that text to appear.

Note that you can pass mustache or erb/ejs notation untouched to your html partial as long as the variable names don’t match the variable names in the `ai2html-settings` or `ai2html-text` blocks.

#### Layers palette

- **Layer names**
  - The name of the layer that is the direct parent of a text block is added as a class to the div that corresponds to that text block. This allows you to write custom css that targets all text blocks in a layer. Class names have `g-` appended to the front of the name.

- **Object names**
  - Another way of targeting a text block is to give that text object a name in the Layers palette. If you give the text object a name, it will be added as an `id` to the `div` that corresponds to that text block. Note that `g-` is not appended to the beginning of the `id`, so take care that you begin the `id` with letters and not numbers.

#### Artboards palette

- **Artboard names**
  - Artboard names become part of the `id` of the `div` corresponding to that artboard. They should have unique names.

- **Specifying artboards to ignore**
  - Add a dash, ie. `-`, as the first character of an artboard name to tell the script that you don’t want it to be included in the output.

- **Setting a custom artboard breakpoint**
  - Add a colon `:` followed by the minimum width up to which the artboard can be scaled down to. See [example](examples.html#custom-breakpoints). 

#### Attributes palette

Parameters can be attached to a text object and passed to the script using the notes field of the Attributes palette. The variables in the notes field should be in the format of `key: value`. There is currently only one text-object parameter that can be specified here:

- **valign**
  - <span style="font-variant: small-caps">Possible values</span>: `top` `bottom` `middle`
  - <span style="font-variant: small-caps">Default</span>: `middle` for Illustrator point text, `top` for area text.
  - Text objects stay anchored to the artboard div relative to the top-left, top-right or top-center of the text block’s bounding box depending on whether the text is left, right or center aligned. If you want the text block to anchor to its bottom edge instead of the top, then set `valign: bottom`.
  - This setting is mainly useful when you set `responsiveness: dynamic` in the settings text block, but can also make a difference for area-text objects because text often wraps differently in different browsers so that a text block may be four lines in one browser and five lines in another. With the default `valign: top`, the fifth line will be added to the bottom of the text block. With `valign: bottom` the fifth line will cause the entire text block to be shifted up one line.

## Point text vs. area text

The script handles point text and area text slightly differently which has ramifications on how text wraps on your web page. Fonts never appear identically in Illustrator and in web browsers. For example, the versions of Arial in Illustrator, in Chrome on a Mac and in Internet Explorer on Windows are not exactly the same — so text that fits in a box in Illustrator may be longer on IE or shorter in Chrome.

- **Point text**
  - Lines of point text are prevented from wrapping, so lines will flow indefinitely outward from their anchors ([see `valign` discussion](#attributes-palette)).

- **Area text**
  - The div containing an area text object is given the width of the bounding box so that text will likely wrap differently on different browsers within that width.


## Which attributes are converted to html and css

The script processes each text object in your Illustrator file and translates the object and text attributes into inline and css styles. Each point- or area-text object is converted into a `<div>`. Each paragraph is converted into `<p>` tags within the `<div>`.

- **Added to inline styles on the `<div>`**
  - Position
  - Opacity
    - Only opacity applied to a text object and its parents will be applied. Opacity applied to text selections will be ignored.
  - Width
    - The width is specified in the html output if it is an area-text object. Point-text objects are given no width.

- **Added to CSS classes applied to `<p>` tags**
  - Font
    - Fonts are converted from Illustrator to web font names in an array in the script. Edit the `fonts` array to add your custom web fonts.
  - Font size
  - Leading
  - Paragraph space before and after
  - Paragraph alignment
    - The alignment of the first paragraph of a text object determines how it is placed in the html. If the first paragraph is left aligned, then on the web page the text object’s div will be absolutely positioned from it’s left edge. If the first paragraph is right aligned, the div will be positioned from its right edge. If the first paragraph is centered, then the div will be positioned from its center.
    - This is important because fonts are rendered slightly differently across browsers and operating systems. So a label next to a city dot on a map end up too far away or overlapping the dot if you do not paragraph align the text relative to the dot.
    - Setting more than one kind of paragraph alignment on a point-text object cannot be translated into html, as there is really no such thing as a point-text object in html. If you really want to have different paragraph alignments within a single text object, you should do it with an area text object.
  - Capitalization
  - Text color
  - Character tracking


## How does ai2html work

The script renders text as absolutely positioned html elements. The remaining art is exported as an image that is placed underneath the text in the html. Artboards can be rendered as separate divs in a single file, or as separate files. The exported files are html partials, that is, everything is enclosed in a div that can be inserted into a page template. It is also possible to specify an html page template into which the script will insert the html partial so you can preview your artwork in the context of your site architecture and css.

Text styles are applied at the paragraph level. Each paragraph is given the character and paragraph attributes of the middle character of the paragraph. Other character styles within a paragraph are ignored — though we’re hoping to add this as a feature in the future. A work-around for this limitation is to enclose text in classed `<span>` tags and define styles for those classes in an `ai2html-css` text block (described below).

Paragraphs are styled using css classes that are consolidated across each artboard. This means that all paragraphs with the same style attributes are styled with a single css class. Text blocks in the output are ordered top-to-bottom, left-to-right so that the document is somewhat readable.


## Limitations

- Because numbers get rounded to whole pixels by the web page when formatting text and positioning elements, the html version of a graphic will not line up exactly with its Illustrator version. Rounding differences are particularly compounded if you have blocks of text that span many lines and have fractional leading in Illustrator.
- Very large text that is set to valign:bottom doesn’t position correctly. We’re hoping to figure out how to fix this. 
- The script assumes that text always goes above the art.
- Artboards should have unique names.
- Paragraphs with full justification will just be “justified” in html.
- Labels in graph objects will be rendered as part of the image. (Something changed in newer versions of CC in the way text objects inside the graph object are handled.) If you want your chart labels to be shown as html, you will need to ungroup the chart.
- In area text blocks, text that is hidden because it is overflowing the box will appear in the html output.


## What works well and what does not

- **Works well**
  - Diagrams or maps in which labels are placed organically around the artwork.

- **Not so great**
  - Graphics with long blocks of wrapped text or many lines of text.
  - Things that should really be coded up as a table or as columns in which the height of the cells needs to adjust dynamically for long blocks of text that wrap.


## Using fonts other than Arial and Georgia

If you want to use fonts other than Arial and Georgia, you can add them to a `fonts` array in an `ai2html-config.json` config file (see above). You will need to know how Illustrator refers to the font. Enter this name as the `aifont` property.

You can find the names that Illustrator uses for all the fonts used in your document by choosing `Find Font…` from the `Type` menu. You can also use the [aifontname script](https://raw.githubusercontent.com/newsdev/ai2html/master/utilities/aifontname.js), which will tell you the fonts used for selected text blocks.

You will need to assign each Illustrator font correspond to a specific font-family, weight and style, which will be used by the script to write the css that will be applied to your text. For example, the Illustrator font name `Arial-BoldItalicMT` corresponds to this css:
```
font-family: arial,helvetica,sans-serif;
font-weight: bold;
font-style: italic;
```


## Contributing to this project

The Github repository for this site is available at [newsdev/ai2html](https://github.com/newsdev/ai2html).


## Thanks

Many thanks to [Gregor Aisch](https://twitter.com/driven_by_data), [Matthew Bloch](https://github.com/mbloch), [Derek Watkins](https://twitter.com/dwtkns), [Josh Katz](https://twitter.com/jshkatz), [K.K. Rebecca Lai](https://twitter.com/kkrebeccalai), [Tom Giratikanon](https://twitter.com/giratikanon), [Matt Ericson](https://twitter.com/mericson), [Jeremy Ashkenas](https://twitter.com/jashkenas) and [Alan McLean](https://twitter.com/alanmclean) for their incredible contributions to this project, as well as to my colleagues in The New York Times [Graphics Department](https://twitter.com/nytgraphics) for their patient guidance.

If you’re learning to write Javascript for Adobe Illustrator, [John Wundes](http://www.wundes.com/JS4AI/), has many wonderful scripts. [explore.js](http://www.wundes.com/JS4AI/explore.js) is particularly helpful for understanding what attributes are attached to Illustrator objects.

---

<p style="font-size:.8em;opacity:0.5;">Created by <a href="https://twitter.com/archietse">Archie Tse</a> / <a href="https://github.com/newsdev">The New York Times</a></p>

<p style="font-size:.8em;opacity:0.7;">Copyright (c) 2011-2017 The New York Times Company</p>



