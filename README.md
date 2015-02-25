# ai2html

> ai2html is a script for Adobe Illustrator that converts your Illustrator artwork into an html page.

## About

The script renders text as absolutely positioned html elements. The remaining art is exported as an image that is placed underneath the text in the html. Each artboard can be rendered as a separate div in a single file, or as separate files. The exported files are html partials, that is, everything is enclosed in a div that can be inserted into a page template. It is also possible to specify an html page template to insert the partial to preview your artwork in the context of your site architecture and css.

## Table of contents

- [How to install ai2html](#how-to-install-ai2html)
- [Overview of how to use the script](#overview-of-how-to-use-the-script)

## How to install ai2html

Move the ai2html.jsx file into the Illustrator folder where scripts are located. For example, on Mac OS X running Adobe Illustrator CC 2014, the path would be:
```
Applications\Adobe Illustrator CC 2014\Presets\en_US\Scripts\ai2html.jsx
```

## Overview of how to use the script

1. Create your Illustrator artwork. Size the artboard to the dimensions that you want the div to appear on the web page.
2. Make sure your Document Color Mode is set to RGB. This is set from the `File` menu.
3. Make sure you have already saved your document. The script uses the location of the ai file to put a folder into which the  exported html and image are saved.
4. Run the script by choosing: `File>Scripts>ai2html`



## How to install ai2html

You can also jump to an interactive preview here to try AML out: [TKTKTK]()

A more detailed outline of the rules for each type of content is available below under "Rules and data-types".

### Keys and values

