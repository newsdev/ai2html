var lib = require('../build/ai2html.js');
var assert = require('assert');


describe('Ai2html-specific functions', function () {

  describe('parseObjectName()', function () {

      it('extract width and other settings', function () {
        var settings = lib.parseObjectName("Artboard 1:600,image_only");
        assert.deepEqual(settings, {width: 600, image_only: true});
      })

      it('parse old-style width declarations', function() {
        var settings = lib.parseObjectName("ai2html-700");
        assert.deepEqual(settings, {width: 700});
      })

    it('extract flags, numbers and strings', function () {
      var settings = lib.parseObjectName("Layer 7:600,svg,label=Text Layer,height=400");
      assert.deepEqual(settings, {width: 600, svg: true, label: "Text Layer", height: 400});
    })

    it('ignore suffixes added by copying: " copy" " copy 2" etc.', function () {
      var settings = lib.parseObjectName("subways:svg copy");
      assert.deepEqual(settings, {svg: true});
      assert.deepEqual(lib.parseObjectName("subways:svg copy 2"), {svg: true});
    })

  })

  describe('stripTag()', function() {
    it('tests', function() {
      assert.equal(lib.stripTag('style', '\r<style></style>'), '\r');
      assert.equal(lib.stripTag('style', 'body {display: none}'), 'body {display: none}');

    })
  })

  describe('addEnclosingTag()', function () {
    it('tests', function() {
      assert.equal(lib.addEnclosingTag('script', '\r<script></script>'), '\r<script></script>')
      assert.equal(lib.addEnclosingTag('script', '<script type="text/javascript"></script>'), '<script type="text/javascript"></script>')
      assert.equal(lib.addEnclosingTag('style', '\t<style>\r{body: margin: 0}\r</style> '), '\t<style>\r{body: margin: 0}\r</style> ')
      assert.equal(lib.addEnclosingTag('script', '<script>'), '<script>\r</script>');
      assert.equal(lib.addEnclosingTag('script', '</script>'), '<script>\r</script>');
      assert.equal(lib.addEnclosingTag('script', ''), '<script>\r\r</script>');
      assert.equal(lib.addEnclosingTag('style', ''), '<style>\r\r</style>');
    })
  })

  describe('cleanCodeBlock()', function () {
    it('straighten curly double quotes in JS', function () {
      var str = lib.cleanCodeBlock('js', 'console.log(“hi”)');
      assert.equal(str, '<script>\rconsole.log("hi")\r</script>');
    })

    it('straighten curly single quotes in JS', function () {
      var str = lib.cleanCodeBlock('js', 'console.log(‘hi’)');
      assert.equal(str, '<script>\rconsole.log(\'hi\')\r</script>');
    })

    it('straighten curly double quotes in HTML tags and convert to HTML in text', function () {
      var str = lib.cleanCodeBlock('html', '<span class=”note”>“who’s idea?”</span>');
      assert.equal(str, '<span class="note">&ldquo;who&rsquo;s idea?&rdquo;</span>');
    })

  })

  describe('cleanObjectName()', function () {
    it('remove colon-delimited annotation and convert spaces', function () {
      var name = lib.cleanObjectName("Layer 7:600,svg,label=Text Layer,height=400");
      assert.equal(name, "Layer_7");
    })
  })

  describe('uniqAssetName()', function() {
    it('adds numerical suffix to create unique names', function() {
      var name = lib.uniqAssetName('img', ['img', 'img-2']);
      assert.equal(name, 'img-3');
    })

    it('no change if name is already unique', function() {
      assert.equal(lib.uniqAssetName('img', []), 'img');
    })
  })

  describe('parseDataAttributes()', function () {
    it('treat semicolons, newlines and commas as delimiters', function () {
      var note = 'valign: top; align: left, name: foo\nid: bar\n';
      assert.deepEqual(lib.parseDataAttributes(note), {valign:'top', align: 'left', name: 'foo', id: 'bar'});
    })
  })

  describe('replaceSvgIds()', function() {
    it ('tests', function() {
      assert.equal(lib.replaceSvgIds('id="dot_1_"', 'ai2html-'), 'id="ai2html-dot" data-name="dot"');
      assert.equal(lib.replaceSvgIds('id="dot_1_"', 'ai2html-'), 'id="ai2html-dot-2" data-name="dot"'); // id cache persists between calls
      assert.equal(lib.replaceSvgIds('id="_x5F_a_x5F_b_x5F__2_"'), 'id="_a_b_" data-name="_a_b_"');  // hex codes are replaced
      assert.equal(lib.replaceSvgIds('id="rect_4_" id="rect_8_"'), 'id="rect" data-name="rect" id="rect-2" data-name="rect"');
    })

  })

});
