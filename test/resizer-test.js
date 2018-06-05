var lib = require('../'),
    assert = require('assert'),
    findVisibleArtboards = lib.findVisibleArtboards;

describe('findVisibleArtboards()', function() {
  describe('no height limit', function () {
    var data = [
      {id: 0, min_width: 300, aspect_ratio: 1},
      {id: 1, min_width: 600, aspect_ratio: 2},
      {id: 2, min_width: 900, aspect_ratio: 2}];

    it('all fit container, "dynamic"', function () {
      var opts = {responsiveness: 'dynamic', responsive_height_limit: null};
      var containerWidth = 900;
      var windowHeight = 400;
      var expect = {ids: [2], min_width: 900};
      var result = findVisibleArtboards(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

    it('middle ab fits container, "dynamic"', function () {
      var opts = {responsiveness: 'dynamic', responsive_height_limit: null};
      var containerWidth = 899;
      var windowHeight = 400;
      var expect = {ids: [1], min_width: 600};
      var result = findVisibleArtboards(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

    it('middle ab fits container, "fixed"', function () {
      var opts = {responsiveness: 'fixed', responsive_height_limit: null};
      var containerWidth = 899;
      var windowHeight = 400;
      var expect = {ids: [1], min_width: 600};
      var result = findVisibleArtboards(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

    it('only smallest ab fits container, "dynamic"', function () {
      var opts = {responsiveness: 'dynamic', responsive_height_limit: null};
      var containerWidth = 300;
      var windowHeight = 400;
      var expect = {ids: [0], min_width: 300};
      var result = findVisibleArtboards(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

    it('no artboards fit the container, "dynamic"', function () {
      var opts = {responsiveness: 'dynamic', responsive_height_limit: null};
      var containerWidth = 299;
      var windowHeight = 400;
      var expect = null;
      var result = findVisibleArtboards(data, containerWidth, windowHeight, opts);
      assert.equal(result, expect);
    });

    describe('artboards with identical widths appear together', function() {
      var data = [
        {id: 0, min_width: 300, aspect_ratio: 1},
        {id: 1, min_width: 300, aspect_ratio: 1},
        {id: 2, min_width: 900, aspect_ratio: 2},
        {id: 3, min_width: 900, aspect_ratio: 2}];

        it('only smallest group fits container, "dynamic"', function () {
          var opts = {responsiveness: 'dynamic', responsive_height_limit: null};
          var containerWidth = 300;
          var windowHeight = 400;
          var expect = {ids: [0, 1], min_width: 300};
          var result = findVisibleArtboards(data, containerWidth, windowHeight, opts);
          assert.deepEqual(result, expect);
        });

        it('all groups fit container, "dynamic"', function () {
          var opts = {responsiveness: 'dynamic', responsive_height_limit: null};
          var containerWidth = 900;
          var windowHeight = 400;
          var expect = {ids: [2, 3], min_width: 900};
          var result = findVisibleArtboards(data, containerWidth, windowHeight, opts);
          assert.deepEqual(result, expect);
        });

      });

  });

  describe('responsive_height_limit is set', function () {

    it('height-limited, "fixed", two artboards overflow height limit', function () {
      var data = [
        // two abs have same overflow -> pick the widest one
        {id: 0, min_width: 300, aspect_ratio: 1},
        {id: 1, min_width: 600, aspect_ratio: 2},
        {id: 2, min_width: 900, aspect_ratio: 2}];
      var opts = {responsiveness: 'fixed', responsive_height_limit: 90};
      var containerWidth = 1000;
      var windowHeight = 300; // limit is 270px
      // two abs have same overflow -> choose the wider one
      var expect = {ids: [1], min_width: 600, vertical_overflow: 30};
      var result = findVisibleArtboards(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

    it('height-limited, "dynamic", two artboards overflow limit (2)', function () {
      var data = [
        // smallest ab has smaller overflow -> choose it
        {id: 0, min_width: 300, aspect_ratio: 1},
        {id: 1, min_width: 600, aspect_ratio: 1.99},
        {id: 2, min_width: 900, aspect_ratio: 2}];
      var opts = {responsiveness: 'dynamic', responsive_height_limit: 90};
      var containerWidth = 1000;
      var windowHeight = 300;
      var expect = {ids: [0], min_width: 300, vertical_overflow: 30, display_width: 300};
      var result = findVisibleArtboards(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

    it('height-limited, "dynamic", two artboards overflow limit (3)', function () {
      var data = [
        // middle ab has smaller overflow than smallest -> choose it
        {id: 0, min_width: 300, aspect_ratio: 0.99},
        {id: 1, min_width: 600, aspect_ratio: 2},
        {id: 2, min_width: 900, aspect_ratio: 2}];
      var opts = {responsiveness: 'dynamic', responsive_height_limit: 90};
      var containerWidth = 1000;
      var windowHeight = 300;
      var expect = {ids: [1], min_width: 600, display_width: 600, vertical_overflow: 30};
      var result = findVisibleArtboards(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

    it('"dynamic", middle ab picked with limiting', function () {
      var data = [
        {id: 0, min_width: 300, aspect_ratio: 1},
        {id: 1, min_width: 600, aspect_ratio: 1.5},
        {id: 2, min_width: 900, aspect_ratio: 1.5}];
      var opts = {responsiveness: 'dynamic', responsive_height_limit: 100};
      var containerWidth = 1000;
      var windowHeight = 500;
      var expect = {ids: [1], min_width: 600, display_width: 750};
      var result = findVisibleArtboards(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

    it('"fixed", middle ab picked with limiting', function () {
      // same as above dynamic example, middle ab is selected
      var data = [
        {id: 0, min_width: 300, aspect_ratio: 1},
        {id: 1, min_width: 600, aspect_ratio: 1.5},
        {id: 2, min_width: 900, aspect_ratio: 1.5}];
      var opts = {responsiveness: 'fixed', responsive_height_limit: 100};
      var containerWidth = 1000;
      var windowHeight = 500;
      var expect = {ids: [1], min_width: 600};
      var result = findVisibleArtboards(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

    it('"fixed", smallest ab picked with limiting', function () {
      // same as above dynamic example, different ab is selected
      var data = [
        {id: 0, min_width: 300, aspect_ratio: 1},
        {id: 1, min_width: 600, aspect_ratio: 1.5},
        {id: 2, min_width: 900, aspect_ratio: 1.5}];
      var opts = {responsiveness: 'fixed', responsive_height_limit: 100};
      var containerWidth = 1000;
      var windowHeight = 350;
      var expect = {ids: [0], min_width: 300};
      var result = findVisibleArtboards(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

    it('"dynamic", middle ab picked without limiting', function () {
      var data = [
        {id: 0, min_width: 300, aspect_ratio: 1},
        {id: 1, min_width: 600, aspect_ratio: 1.5},
        {id: 2, min_width: 900, aspect_ratio: 1.5}];
      var opts = {responsiveness: 'dynamic', responsive_height_limit: 100};
      var containerWidth = 700;
      var windowHeight = 500;
      var expect = {ids: [1], min_width: 600, display_width: 700};
      var result = findVisibleArtboards(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

    it('"dynamic", middle ab picked without limiting, abs in reverse order', function () {
      var data = [
        {id: 0, min_width: 900, aspect_ratio: 1.5},
        {id: 1, min_width: 600, aspect_ratio: 1.5},
        {id: 2, min_width: 300, aspect_ratio: 1}];
      var opts = {responsiveness: 'dynamic', responsive_height_limit: 100};
      var containerWidth = 700;
      var windowHeight = 500;
      var expect = {ids: [1], min_width: 600, display_width: 700};
      var result = findVisibleArtboards(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

    it('"dynamic", largest ab picked without limiting', function () {
      var data = [
        {id: 0, min_width: 300, aspect_ratio: 1},
        {id: 1, min_width: 600, aspect_ratio: 1.5},
        {id: 2, min_width: 900, aspect_ratio: 1.5}];
      var opts = {responsiveness: 'dynamic', responsive_height_limit: 100};
      var containerWidth = 1000;
      var windowHeight = 800;
      var expect = {ids: [2], min_width: 900, display_width: 1000};
      var result = findVisibleArtboards(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

  });

  describe('responsive_height_limit is set, multiple artboards have the same width', function () {
    it('"dynamic", middle abs picked with limiting', function () {
      var data = [
        {id: 0, min_width: 300, aspect_ratio: 1},
        {id: 1, min_width: 300, aspect_ratio: 1},
        {id: 2, min_width: 600, aspect_ratio: 1.5},
        {id: 3, min_width: 600, aspect_ratio: 1.5},
        {id: 4, min_width: 900, aspect_ratio: 1.5},
        {id: 5, min_width: 900, aspect_ratio: 1.5}];
      var opts = {responsiveness: 'dynamic', responsive_height_limit: 100};
      var containerWidth = 1000;
      var windowHeight = 500;
      var expect = {ids: [2, 3], min_width: 600, display_width: 750};
      var result = findVisibleArtboards(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

    it('"dynamic", first abs picked (based on aspect ratio of tallest member of group)', function () {
      var data = [
        {id: 0, min_width: 300, aspect_ratio: 1},
        {id: 1, min_width: 300, aspect_ratio: 1},
        {id: 2, min_width: 600, aspect_ratio: 1}, // changed from above
        {id: 3, min_width: 600, aspect_ratio: 1.5},
        {id: 4, min_width: 900, aspect_ratio: 1.5},
        {id: 5, min_width: 900, aspect_ratio: 1.5}];
      var opts = {responsiveness: 'dynamic', responsive_height_limit: 100};
      var containerWidth = 1000;
      var windowHeight = 500;
      var expect = {ids: [0, 1], min_width: 300, display_width: 500};
      var result = findVisibleArtboards(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

     it('"dynamic", first abs picked with limiting (based on aspect ratio of tallest member of group)', function () {
      var data = [
        {id: 0, min_width: 300, aspect_ratio: 1},
        {id: 1, min_width: 300, aspect_ratio: 1},
        {id: 2, min_width: 600, aspect_ratio: 1.5},
        {id: 3, min_width: 600, aspect_ratio: 1}, // changed
        {id: 4, min_width: 900, aspect_ratio: 1.5},
        {id: 5, min_width: 900, aspect_ratio: 1.5}];
      var opts = {responsiveness: 'dynamic', responsive_height_limit: 100};
      var containerWidth = 1000;
      var windowHeight = 500;
      var expect = {ids: [0, 1], min_width: 300, display_width: 500};
      var result = findVisibleArtboards(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

    it('"dynamic", second abs picked (based on aspect ratio of tallest member of group)', function () {
      var data = [
        {id: 0, min_width: 300, aspect_ratio: 1},
        {id: 1, min_width: 300, aspect_ratio: 1},
        {id: 2, min_width: 600, aspect_ratio: 1.5},
        {id: 3, min_width: 600, aspect_ratio: 1}, // changed
        {id: 4, min_width: 900, aspect_ratio: 1.5},
        {id: 5, min_width: 900, aspect_ratio: 1}]; // changed
      var opts = {responsiveness: 'dynamic', responsive_height_limit: 100};
      var containerWidth = 1000;
      var windowHeight = 650; // changed
      var expect = {ids: [3, 2], min_width: 600, display_width: 650};
      var result = findVisibleArtboards(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });
  });

});
