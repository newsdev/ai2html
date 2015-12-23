---
layout: index
sidebar_menu:
    '#multiple-sized-artboards': Multiple artboards
    '#responsiveness': Responsiveness
    '#rotated-and-sheared-html-labels': Rotated labels
    '#svg-artboards': SVG artboards
    '#custom-css': Custom CSS
    /: Return
---

# Examples

Note: For some of the examples you will want to resize the browser window to see the effect of the different settings.

## Multiple sized artboards

If you set up multiple artboards, ai2html will export them separately so they can be switched based on the  size of the outer container. All you have to do is adding this little ["resizer" script](https://gist.github.com/gka/093496b7707110178994) to your website.

{% include artboards.html %}

## Responsiveness

In some cases it is acceptable to "stretch" the artboards between two sizes to ensure the artboard always fills the parent container. To do so set the `responsiveness` to `dynamic` in the settings block:

{% include dynamic.html %}

## Rotated and sheared HTML labels

By default, ai2html will now output rotated and sheared labels as HTML white preserving the transformation using CSS `transform`.

{% include rotated.html %}

If you want don't want the rotated labels to be rendered as HTML, you can restore the old behaviour by adding `render_rotated_skewed_text_as: image` to your settings block. The text will be added to the base artboard image.

{% include rotated-image.html %}

## SVG artboards

Instead of PNG and JPG, ai2html can use SVG for artboard images, too. This makes most sense when you don't have raster layers in your Illustrator file. To activate, simply change `image_format` to `svg` in your settings block.

{% include svg.html %}

## Custom CSS

Use the `ai2html-css` text field to add custom CSS styles to the HTML text labels. You can target different labels by using their layer name in the CSS selector.

{% include custom-css.html %}

<style type="text/css">
    .g-artboard {
        margin-left: 0;
    }
</style>
<script type="text/javascript">
    (function() {
        // only want one resizer on the page
        if (document.documentElement.className.indexOf("g-resizer-v3-init") > -1) return;
        document.documentElement.className += " g-resizer-v3-init";
        // require IE9+
        if (!("querySelector" in document)) return;
        function resizer() {
            var elements = Array.prototype.slice.call(document.querySelectorAll(".g-artboard")),
                widthById = {};
            elements.forEach(function(el) {
                var parent = el.parentNode,
                    width = widthById[parent.id] || parent.getBoundingClientRect().width,
                    minwidth = el.getAttribute("data-min-width"),
                    maxwidth = el.getAttribute("data-max-width");
                widthById[parent.id] = width;
                if (+minwidth <= width && (+maxwidth >= width || maxwidth === null)) {
                    el.style.display = "block";
                } else {
                    el.style.display = "none";
                }
            });
            try {
                if (window.parent && window.parent.$) {
                    window.parent.$("body").trigger("resizedcontent", [window]);
                }
            } catch(e) { console.log(e); }
        }

        document.addEventListener('DOMContentLoaded', resizer);
        // feel free to replace throttle with _.throttle, if available
        window.addEventListener('resize', throttle(resizer, 200));        

        function throttle(func, wait) {
            // from underscore.js
            var _now = Date.now || function() { return new Date().getTime(); },
                context, args, result, timeout = null, previous = 0;
            var later = function() {
                previous = _now();
                timeout = null;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            };
            return function() {
                var now = _now(), remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0 || remaining > wait) {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    previous = now;
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                } else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        }

       
    })();
</script>
