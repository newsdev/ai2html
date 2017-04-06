var env = require('./ai-env');
var lib = require('../');
var assert = require('assert');


describe('Ai2html-specific functions', function () {

  describe('convertSettingsToYaml()', function () {
    it('ignores settings that are not explicitly included in default environment', function() {
      lib.initScriptEnvironment('');
      var settings = {
        dummy_setting: "true",
        image_format: "png",
        publish_system: "scoop"
      };
      assert.equal(lib.convertSettingsToYaml(settings), "");
    })

    it('ignores settings that are not explicitly included in nyt environment', function() {
      lib.initScriptEnvironment('nyt');
      var settings = {
        dummy_setting: "true",
        image_format: "png",
        publish_system: "scoop"
      };
      assert.equal(lib.convertSettingsToYaml(settings), "publish_system: scoop");
    })

    it('converts NYT Preview settings correctly', function () {
      lib.initScriptEnvironment('nyt');
      var settings = {
        show_in_compatible_apps: "no", // special case -- needs to be quoted
        headline: "Breaking \"News\"",
        leadin: "",  // empty strings are quoted
        display_for_promotion_only: false
      };
      var expected = 'show_in_compatible_apps: "no"\nheadline: "Breaking \\"News\\""\nleadin: ""\ndisplay_for_promotion_only: false';
      assert.equal(lib.convertSettingsToYaml(settings), expected);
    })
  })

});
