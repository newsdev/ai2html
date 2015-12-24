---
layout: index
sidebar_menu:
    '#multiple-sized-artboards': Multiple artboards
    '#responsiveness': Responsiveness
    '#custom-breakpoints': Custom breakpoints
    '#rotated-and-sheared-html-labels': Rotated labels
    '#svg-artboards': SVG artboards
    '#custom-css': Custom CSS
    /: Return to main page
---

# Examples

We’ve included some examples that demonstrate how different settings in ai2html work. You can download all the [Illustrator files from Github](https://github.com/newsdev/ai2html/tree/gh-pages/_ai). 

For more, check out [examples for how we’ve used ai2html](https://delicious.com/archietse/ai2html,nyt) at The New York Times and [examples of how others have used it](https://delicious.com/archietse/ai2html,others).

## Multiple artboards for responsive web pages

If you have multiple artboards in your Illustrator file, **ai2html** will export them by default as separate divs in a single html file. The idea is that each artboard/div can be toggled on and off depending on the size of the outer container. All you have to do is add our little [resizer script](https://github.com/newsdev/ai2html/blob/gh-pages/_includes/resizer-script.html) to your webpage.

The example below was generated from a single Illustrator file with four differently-sized artboards. Resize your browser window to see how the different artboards are turned on and off depending on the outer width.

{% include artboards.html %}

## Responsiveness

You might have noticed that the art “jumps” in size as you change the width of your window in the example above. If you set `responsiveness: dynamic` in the settings block, the artboards will be stretched so they always fill 100 percent of the width of the container:

{% include dynamic.html %}

The default behaviour for the dynamic scaling shown above is to use the widths of the artboards as breakpoints. If you have a small and large artboard, the small one is scaled up until the larger artboard can fit into the container.

## Custom breakpoints

You can define custom breakpoints for each artboard by adding `:MIN_WIDTH` to the end of the artboard name, where `MIN_WIDTH` is size of the container at which you want to begin displaying that artboard. In the example below, the “medium” artboard is renamed to `medium:420` to tell **ai2html** that this artboard is safe to be scaled down to container widths of 420px.

{% include breakpoints.html %}


## Rotated and sheared HTML labels

By default, **ai2html** will now output rotated and sheared labels as HTML while preserving the original transformation using CSS transform matrices. This works reasonably well for rotated and sheared text.

{% include rotated.html %}

If you don't want the rotated labels to be rendered as HTML, you can restore the old behaviour by adding `render_rotated_skewed_text_as: image` to your settings block. The rotated or skewed text will be burned into the artboard base image.

{% include rotated-image.html %}

## SVG artboards

Instead of PNG and JPG, **ai2html** can export SVG for artboard images, too. Generally use this only if there is no raster artwork in your file and if the vector artwork is not excessively complex. To activate, simply change the settings block to `image_format:svg`.

{% include svg.html %}

[Here’s the SVG artboard](images/svg-720.svg) in case you want to check it out.

Note that the SVG export created by Illustrator includes the markup of all elements that were hidden by ai2html before the export. To fix this we wrote a little [Node.js script](https://gist.github.com/gka/c97465e7a25d943e1191#file-clean-ai2html-svg-artboard-js) that removes these hidden elements.

## Custom CSS

Use the `ai2html-css` text field to add custom CSS styles to the HTML text labels. You can target different labels by using the name of the parent layer in the CSS selector.

{% include custom-css.html %}

{% include resizer-script.html %}

