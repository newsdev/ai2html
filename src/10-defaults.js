
AI2HTML = AI2HTML || {};
/** @global */
AI2HTML.defaults = AI2HTML.defaults || {};

(function() {
  // How to update the version number:
  // - Increment middle digit for new functionality or breaking changes
  //      or increment final digit for simple bug fixes or other minor changes.
  // - Update the version number in package.json
  // - Add an entry to CHANGELOG.md
  // - Run 'npm publish' to create a new GitHub release
  var scriptVersion = '0.120.0';

  // ================================================
  // ai2html and config settings
  // ================================================
  
  // These are base settings that are overridden by text block settings in
  // the .ai document and settings contained in ai2html-config.json files
  var defaultSettings = {
    "namespace": "g-",
    "settings_version": scriptVersion,
    "create_promo_image": false,
    "promo_image_width": 1024,
    "image_format": ["auto"],  // Options: auto, png, png24, jpg, svg
    "write_image_files": true,
    "responsiveness": "fixed", // Options: fixed, dynamic
    "max_width": "",
    "output": "one-file",      // Options: one-file, multiple-files
    "project_name": "",        // Defaults to the name of the AI file
    "html_output_path": "ai2html-output/",
    "html_output_extension": ".html",
    "image_output_path": "ai2html-output/",
    "image_source_path": "",
    "image_alt_text": "", // Generally, use alt_text instead
    "cache_bust_token": null,  // Append a token to the url of image urls: ?v=<cache_bust_token>
    "create_config_file": false,
    "create_settings_block": true, // Create a text block in the AI doc with common settings
    "config_file_path": "",
    "local_preview_template": "",
    "png_transparent": false,
    "png_number_of_colors": 128, // Number of colors in 8-bit PNG image (1-256)
    "jpg_quality": 60,
    "center_html_output": true,
    "use_2x_images_if_possible": true,
    "use_lazy_loader": false,
    "include_resizer_classes": false, // Triggers an error (feature was removed)
    "include_resizer_widths": true,
    "include_resizer_script": false,
    "inline_svg": false, // Embed background image SVG in HTML instead of loading a file
    "svg_id_prefix": "", // Prefix SVG ids with a string to disambiguate from other ids on the page
    "svg_embed_images": false,
    "render_text_as": "html", // Options: html, image
    "render_rotated_skewed_text_as": "html", // Options: html, image
    "testing_mode": false,  // Render text in both bg image and HTML to test HTML text placement
    "show_completion_dialog_box": true,
    "clickable_link": "",  // Add a URL to make the entire graphic a clickable link
    "last_updated_text": "",
    "headline": "",
    "leadin": "",
    "summary": "",
    "notes": "",
    "sources": "",
    "credit": "",
    
    // List of settings to include in the "ai2html-settings" text block
    "settings_block": [
      "settings_version",
      "image_format",
      "responsiveness",
      "include_resizer_script",
      "use_lazy_loader",
      "output",
      "html_output_path",
      // "html_output_extension", // removed from settings block in v0.115.6
      "image_output_path",
      "image_source_path",
      "local_preview_template",
      "png_number_of_colors",
      "jpg_quality",
      "headline",
      "leadin",
      "notes",
      "sources",
      "credit"
    ],
    
    // list of settings to include in the config.yml file
    "config_file": [
      "headline",
      "leadin",
      "summary",
      "notes",
      "sources",
      "credit"
    ]
  };


  // These settings override the default settings in NYT preview/birdkit projects
  var nytOverrideSettings = {
    "image_source_path": "_assets/", // path for <img src="">
    "use_lazy_loader": true,
    "include_resizer_script": true,
    "min_width": 280, // added as workaround for a scoop bug affecting ai2html-type graphics
    "accessibility": true,
    "settings_block": [
      "settings_version",
      "responsiveness",
      "image_format",
      // "write_image_files",
      // "max_width",
      "png_transparent",
      "png_number_of_colors",
      "jpg_quality",
      "inline_svg",
      "output"
      // "clickable_link"
      // "use_lazy_loader"
    ],
    
    "config_file": []
  };
  
  var nytPreviewSettings = {
    "project_type": "nyt-preview",
    "html_output_path": "../src/",
    "image_output_path": "../public/_assets/"
  };
  
  var nytBirdkitSettings = {
    "project_type": "freebird",
    "html_output_path": "../src/lib/graphics/",
    "image_output_path": "../public/_assets/"
  };
  
  var nytBirdkitEmbedSettings = {
    "project_type": "ai2html",
    "html_output_path": "../public/",
    "image_output_path": "../public/_assets/",
    "dark_mode_compatible": false,
    "create_json_config_files": true,
    "create_promo_image": false,
    "credit": "By The New York Times",
    "aria_role": "img",
    "alt_text": "",
    "page_template": "vi-article-embed",
    "display_for_promotion_only": false,
    "section": "",
    "size": "full", // changed from "medium" to "full"
    
    "settings_block": [
      "settings_version",
      "responsiveness",
      "alt_text",
      "max_width",
      "image_format",
      "png_number_of_colors",
      "jpg_quality",
      "last_updated_text",
      "section",
      "headline",
      "leadin",
      "summary",
      "notes",
      "sources",
      "credit",
      "display_for_promotion_only",
      "dark_mode_compatible",
      "size"
    ],
    "config_file": [
      "last_updated_text",
      "alt_text",
      "section",
      "headline",
      "leadin",
      "summary",
      "notes",
      "sources",
      "credit",
      "page_template",
      "display_for_promotion_only",
      "size"
    ]
  };

  // Override settings for simple NYT Preview ai2html embed graphics
  var nytPreviewEmbedSettings = {
    "project_type": "ai2html",
    "html_output_path": "../public/",
    "image_output_path": "../public/_assets/",
    "dark_mode_compatible": false,
    "create_config_file": true,
    "config_file_path": "../config.yml",
    "create_promo_image": true,
    "credit": "By The New York Times",
    "aria_role": "img",
    "alt_text": "",
    "publish_system": "scoop",
    "page_template": "vi-article-embed",
    "environment": "production",
    "show_in_compatible_apps": true,
    "display_for_promotion_only": false,
    "constrain_width_to_text_column": false,
    "compatibility": "inline",
    "size": "full", // changed from "medium" to "full"
    "scoop_publish_fields": true,
    "scoop_asset_id": "",
    "scoop_username": "",
    "scoop_slug": "",
    "scoop_external_edit_key": "",
    
    "settings_block": [
      "settings_version",
      "responsiveness",
      "alt_text",
      "max_width",
      "image_format",
      // "write_image_files",
      // "output",
      "png_number_of_colors",
      "jpg_quality",
      // "use_lazy_loader",
      // "show_completion_dialog_box",
      "last_updated_text",
      "headline",
      "leadin",
      "summary",
      "notes",
      "sources",
      "credit",
      "show_in_compatible_apps",
      "display_for_promotion_only",
      "constrain_width_to_text_column",
      "dark_mode_compatible",
      "size",
      "scoop_asset_id",
      "scoop_username",
      "scoop_slug",
      "scoop_external_edit_key"
    ],
    "config_file": [
      "last_updated_text",
      "headline",
      "leadin",
      "summary",
      "notes",
      "sources",
      "credit",
      "page_template",
      "publish_system",
      "environment",
      "show_in_compatible_apps",
      "display_for_promotion_only",
      "constrain_width_to_text_column",
      "compatibility",
      "size",
      "scoop_publish_fields",
      "scoop_asset_id",
      "scoop_username",
      "scoop_slug",
      "scoop_external_edit_key"
    ]
  };

  // Rules for converting AI fonts to CSS
  // vshift shifts text vertically, to compensate for vertical misalignment caused
  // by a difference between vertical placement in Illustrator (of a system font) and
  // browsers (of the web font equivalent). vshift values are percentage of font size. Positive
  // values correspond to a downward shift.
  var fonts = [
    {"aifont": "ArialMT", "family": "arial,helvetica,sans-serif", "weight": "", "style": ""},
    {"aifont": "Arial-BoldMT", "family": "arial,helvetica,sans-serif", "weight": "bold", "style": ""},
    {"aifont": "Arial-ItalicMT", "family": "arial,helvetica,sans-serif", "weight": "", "style": "italic"},
    {"aifont": "Arial-BoldItalicMT", "family": "arial,helvetica,sans-serif", "weight": "bold", "style": "italic"},
    {"aifont": "Georgia", "family": "georgia,'times new roman',times,serif", "weight": "", "style": ""},
    {"aifont": "Georgia-Bold", "family": "georgia,'times new roman',times,serif", "weight": "bold", "style": ""},
    {"aifont": "Georgia-Italic", "family": "georgia,'times new roman',times,serif", "weight": "", "style": "italic"},
    {
      "aifont": "Georgia-BoldItalic",
      "family": "georgia,'times new roman',times,serif",
      "weight": "bold",
      "style": "italic"
    },
    // NYT fonts
    {
      "aifont": "NYTFranklin-Light",
      "family": "nyt-franklin,arial,helvetica,sans-serif",
      "weight": "300",
      "style": "",
      "vshift": "8%"
    },
    {
      "aifont": "NYTFranklin-Medium",
      "family": "nyt-franklin,arial,helvetica,sans-serif",
      "weight": "500",
      "style": "",
      "vshift": "8%"
    },
    {
      "aifont": "NYTFranklin-SemiBold",
      "family": "nyt-franklin,arial,helvetica,sans-serif",
      "weight": "600",
      "style": "",
      "vshift": "8%"
    },
    {
      "aifont": "NYTFranklin-Semibold",
      "family": "nyt-franklin,arial,helvetica,sans-serif",
      "weight": "600",
      "style": "",
      "vshift": "8%"
    },
    {
      "aifont": "NYTFranklinSemiBold-Regular",
      "family": "nyt-franklin,arial,helvetica,sans-serif",
      "weight": "600",
      "style": "",
      "vshift": "8%"
    },
    {
      "aifont": "NYTFranklin-SemiboldItalic",
      "family": "nyt-franklin,arial,helvetica,sans-serif",
      "weight": "600",
      "style": "italic",
      "vshift": "8%"
    },
    {
      "aifont": "NYTFranklin-Bold",
      "family": "nyt-franklin,arial,helvetica,sans-serif",
      "weight": "700",
      "style": "",
      "vshift": "8%"
    },
    {
      "aifont": "NYTFranklin-LightItalic",
      "family": "nyt-franklin,arial,helvetica,sans-serif",
      "weight": "300",
      "style": "italic",
      "vshift": "8%"
    },
    {
      "aifont": "NYTFranklin-MediumItalic",
      "family": "nyt-franklin,arial,helvetica,sans-serif",
      "weight": "500",
      "style": "italic",
      "vshift": "8%"
    },
    {
      "aifont": "NYTFranklin-BoldItalic",
      "family": "nyt-franklin,arial,helvetica,sans-serif",
      "weight": "700",
      "style": "italic",
      "vshift": "8%"
    },
    {
      "aifont": "NYTFranklin-ExtraBold",
      "family": "nyt-franklin,arial,helvetica,sans-serif",
      "weight": "800",
      "style": "",
      "vshift": "8%"
    },
    {
      "aifont": "NYTFranklin-ExtraBoldItalic",
      "family": "nyt-franklin,arial,helvetica,sans-serif",
      "weight": "800",
      "style": "italic",
      "vshift": "8%"
    },
    {
      "aifont": "NYTFranklin-Headline",
      "family": "nyt-franklin,arial,helvetica,sans-serif",
      "weight": "bold",
      "style": "",
      "vshift": "8%"
    },
    {
      "aifont": "NYTFranklin-HeadlineItalic",
      "family": "nyt-franklin,arial,helvetica,sans-serif",
      "weight": "bold",
      "style": "italic",
      "vshift": "8%"
    },
    // Chelt.
    {"aifont": "NYTCheltenham-ExtraLight", "family": "nyt-cheltenham,georgia,serif", "weight": "200", "style": ""},
    {"aifont": "NYTCheltenhamExtLt-Regular", "family": "nyt-cheltenham,georgia,serif", "weight": "200", "style": ""},
    {"aifont": "NYTCheltenham-Light", "family": "nyt-cheltenham,georgia,serif", "weight": "300", "style": ""},
    {"aifont": "NYTCheltenhamLt-Regular", "family": "nyt-cheltenham,georgia,serif", "weight": "300", "style": ""},
    {"aifont": "NYTCheltenham-LightSC", "family": "nyt-cheltenham,georgia,serif", "weight": "300", "style": ""},
    {"aifont": "NYTCheltenham-Book", "family": "nyt-cheltenham,georgia,serif", "weight": "400", "style": ""},
    {"aifont": "NYTCheltenhamBook-Regular", "family": "nyt-cheltenham,georgia,serif", "weight": "400", "style": ""},
    {"aifont": "NYTCheltenham-Wide", "family": "nyt-cheltenham,georgia,serif", "weight": "", "style": ""},
    {"aifont": "NYTCheltenhamMedium-Regular", "family": "nyt-cheltenham,georgia,serif", "weight": "500", "style": ""},
    {"aifont": "NYTCheltenham-Medium", "family": "nyt-cheltenham,georgia,serif", "weight": "500", "style": ""},
    {"aifont": "NYTCheltenham-Bold", "family": "nyt-cheltenham,georgia,serif", "weight": "700", "style": ""},
    {"aifont": "NYTCheltenham-BoldCond", "family": "nyt-cheltenham,georgia,serif", "weight": "bold", "style": ""},
    {
      "aifont": "NYTCheltenhamCond-BoldXC",
      "family": "nyt-cheltenham-extra-cn-bd,georgia,serif",
      "weight": "bold",
      "style": ""
    },
    {"aifont": "NYTCheltenham-BoldExtraCond", "family": "nyt-cheltenham,georgia,serif", "weight": "bold", "style": ""},
    {"aifont": "NYTCheltenham-ExtraBold", "family": "nyt-cheltenham,georgia,serif", "weight": "bold", "style": ""},
    {"aifont": "NYTCheltenham-ExtraLightIt", "family": "nyt-cheltenham,georgia,serif", "weight": "", "style": "italic"},
    {
      "aifont": "NYTCheltenham-ExtraLightItal",
      "family": "nyt-cheltenham,georgia,serif",
      "weight": "",
      "style": "italic"
    },
    {"aifont": "NYTCheltenham-LightItalic", "family": "nyt-cheltenham,georgia,serif", "weight": "", "style": "italic"},
    {"aifont": "NYTCheltenham-BookItalic", "family": "nyt-cheltenham,georgia,serif", "weight": "", "style": "italic"},
    {"aifont": "NYTCheltenham-WideItalic", "family": "nyt-cheltenham,georgia,serif", "weight": "", "style": "italic"},
    {"aifont": "NYTCheltenham-MediumItalic", "family": "nyt-cheltenham,georgia,serif", "weight": "", "style": "italic"},
    {
      "aifont": "NYTCheltenham-BoldItalic",
      "family": "nyt-cheltenham,georgia,serif",
      "weight": "700",
      "style": "italic"
    },
    {
      "aifont": "NYTCheltenham-ExtraBoldItal",
      "family": "nyt-cheltenham,georgia,serif",
      "weight": "bold",
      "style": "italic"
    },
    {
      "aifont": "NYTCheltenham-ExtraBoldItalic",
      "family": "nyt-cheltenham,georgia,serif",
      "weight": "bold",
      "style": "italic"
    },
    {
      "aifont": "NYTCheltenhamSH-Regular",
      "family": "nyt-cheltenham-sh,nyt-cheltenham,georgia,serif",
      "weight": "400",
      "style": ""
    },
    {
      "aifont": "NYTCheltenhamSH-Italic",
      "family": "nyt-cheltenham-sh,nyt-cheltenham,georgia,serif",
      "weight": "400",
      "style": "italic"
    },
    {
      "aifont": "NYTCheltenhamSH-Bold",
      "family": "nyt-cheltenham-sh,nyt-cheltenham,georgia,serif",
      "weight": "700",
      "style": ""
    },
    {
      "aifont": "NYTCheltenhamSH-BoldItalic",
      "family": "nyt-cheltenham-sh,nyt-cheltenham,georgia,serif",
      "weight": "700",
      "style": "italic"
    },
    {"aifont": "NYTCheltenhamWide-Regular", "family": "nyt-cheltenham,georgia,serif", "weight": "500", "style": ""},
    {
      "aifont": "NYTCheltenhamWide-Italic",
      "family": "nyt-cheltenham,georgia,serif",
      "weight": "500",
      "style": "italic"
    },
    // Imperial
    {"aifont": "NYTImperial-Regular", "family": "nyt-imperial,georgia,serif", "weight": "400", "style": ""},
    {"aifont": "NYTImperial-Italic", "family": "nyt-imperial,georgia,serif", "weight": "400", "style": "italic"},
    {"aifont": "NYTImperial-Semibold", "family": "nyt-imperial,georgia,serif", "weight": "600", "style": ""},
    {
      "aifont": "NYTImperial-SemiboldItalic",
      "family": "nyt-imperial,georgia,serif",
      "weight": "600",
      "style": "italic"
    },
    {"aifont": "NYTImperial-Bold", "family": "nyt-imperial,georgia,serif", "weight": "700", "style": ""},
    {"aifont": "NYTImperial-BoldItalic", "family": "nyt-imperial,georgia,serif", "weight": "700", "style": "italic"},
    // Others
    {
      "aifont": "NYTKarnakText-Regular",
      "family": "nyt-karnak-display-130124,georgia,serif",
      "weight": "400",
      "style": ""
    },
    {
      "aifont": "NYTKarnakDisplay-Regular",
      "family": "nyt-karnak-display-130124,georgia,serif",
      "weight": "400",
      "style": ""
    },
    {
      "aifont": "NYTStymieLight-Regular",
      "family": "nyt-stymie,arial,helvetica,sans-serif",
      "weight": "300",
      "style": ""
    },
    {
      "aifont": "NYTStymieMedium-Regular",
      "family": "nyt-stymie,arial,helvetica,sans-serif",
      "weight": "500",
      "style": ""
    },
    {"aifont": "StymieNYT-Light", "family": "nyt-stymie,arial,helvetica,sans-serif", "weight": "300", "style": ""},
    {
      "aifont": "StymieNYT-LightPhoenetic",
      "family": "nyt-stymie,arial,helvetica,sans-serif",
      "weight": "300",
      "style": ""
    },
    {
      "aifont": "StymieNYT-Lightitalic",
      "family": "nyt-stymie,arial,helvetica,sans-serif",
      "weight": "300",
      "style": "italic"
    },
    {"aifont": "StymieNYT-Medium", "family": "nyt-stymie,arial,helvetica,sans-serif", "weight": "500", "style": ""},
    {
      "aifont": "StymieNYT-MediumItalic",
      "family": "nyt-stymie,arial,helvetica,sans-serif",
      "weight": "500",
      "style": "italic"
    },
    {"aifont": "StymieNYT-Bold", "family": "nyt-stymie,arial,helvetica,sans-serif", "weight": "700", "style": ""},
    {
      "aifont": "StymieNYT-BoldItalic",
      "family": "nyt-stymie,arial,helvetica,sans-serif",
      "weight": "700",
      "style": "italic"
    },
    {"aifont": "StymieNYT-ExtraBold", "family": "nyt-stymie,arial,helvetica,sans-serif", "weight": "700", "style": ""},
    {
      "aifont": "StymieNYT-ExtraBoldText",
      "family": "nyt-stymie,arial,helvetica,sans-serif",
      "weight": "700",
      "style": ""
    },
    {
      "aifont": "StymieNYT-ExtraBoldTextItal",
      "family": "nyt-stymie,arial,helvetica,sans-serif",
      "weight": "700",
      "style": "italic"
    },
    {
      "aifont": "StymieNYTBlack-Regular",
      "family": "nyt-stymie,arial,helvetica,sans-serif",
      "weight": "700",
      "style": ""
    },
    {"aifont": "StymieBT-ExtraBold", "family": "nyt-stymie,arial,helvetica,sans-serif", "weight": "700", "style": ""},
    {"aifont": "Stymie-Thin", "family": "nyt-stymie,arial,helvetica,sans-serif", "weight": "300", "style": ""},
    {"aifont": "Stymie-UltraLight", "family": "nyt-stymie,arial,helvetica,sans-serif", "weight": "300", "style": ""},
    {
      "aifont": "NYTMagSans-Regular",
      "family": "'nyt-magsans',arial,helvetica,sans-serif",
      "weight": "500",
      "style": ""
    },
    {"aifont": "NYTMagSans-Bold", "family": "'nyt-magsans',arial,helvetica,sans-serif", "weight": "700", "style": ""}
  ];

  // ================================================
  // Constant data
  // ================================================
  
  // CSS text-transform equivalents
  var caps = [
    {"ai": "FontCapsOption.NORMALCAPS", "html": "none"},
    {"ai": "FontCapsOption.ALLCAPS", "html": "uppercase"},
    {"ai": "FontCapsOption.SMALLCAPS", "html": "uppercase"}
  ];

  // CSS text-align equivalents
  var align = [
    {"ai": "Justification.LEFT", "html": "left"},
    {"ai": "Justification.RIGHT", "html": "right"},
    {"ai": "Justification.CENTER", "html": "center"},
    {"ai": "Justification.FULLJUSTIFY", "html": "justify"},
    {"ai": "Justification.FULLJUSTIFYLASTLINELEFT", "html": "justify"},
    {"ai": "Justification.FULLJUSTIFYLASTLINECENTER", "html": "justify"},
    {"ai": "Justification.FULLJUSTIFYLASTLINERIGHT", "html": "justify"}
  ];
  
  var blendModes = [
    {ai: "BlendModes.MULTIPLY", html: "multiply"}
  ];

  // list of CSS properties used for translating AI text styles
  // (used for creating a unique identifier for each style)
  var cssTextStyleProperties = [
    //'top' // used with vshift; not independent of other properties
    'position',
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'color',
    'line-height',
    'height', // used for point-type paragraph styles
    'letter-spacing',
    'opacity',
    'padding-top',
    'padding-bottom',
    'text-align',
    'text-transform',
    'mix-blend-mode',
    'vertical-align' // for superscript
  ];
  
  var cssPrecision = 4;
  
  
  // return settings object
  
  
  
  
})();
