var lib = require('../'),
    assert = require('assert'),
    findVisibleArtboard = lib.findVisibleArtboard;

describe('findVisibleArtboard()', function() {
  describe('no height limit', function () {
    var data = [
      {id: 0, min_width: 300, aspect_ratio: 1},
      {id: 1, min_width: 600, aspect_ratio: 2},
      {id: 2, min_width: 900, aspect_ratio: 2}];

    it('all fit container, "dynamic"', function () {
      var opts = {responsiveness: 'dynamic', responsive_height_limit: null};
      var containerWidth = 900;
      var windowHeight = 400;
      var expect = {id: 2, min_width: 900, aspect_ratio: 2};
      var result = findVisibleArtboard(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

    it('middle ab fits container, "dynamic"', function () {
      var opts = {responsiveness: 'dynamic', responsive_height_limit: null};
      var containerWidth = 899;
      var windowHeight = 400;
      var expect = {id: 1, min_width: 600, aspect_ratio: 2};
      var result = findVisibleArtboard(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

    it('middle ab fits container, "fixed"', function () {
      var opts = {responsiveness: 'fixed', responsive_height_limit: null};
      var containerWidth = 899;
      var windowHeight = 400;
      var expect = {id: 1, min_width: 600, aspect_ratio: 2};
      var result = findVisibleArtboard(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

    it('only smallest ab fits container, "dynamic"', function () {
      var opts = {responsiveness: 'dynamic', responsive_height_limit: null};
      var containerWidth = 300;
      var windowHeight = 400;
      var expect = {id: 0, min_width: 300, aspect_ratio: 1};
      var result = findVisibleArtboard(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

    it('no artboards fit the container, "dynamic"', function () {
      var opts = {responsiveness: 'dynamic', responsive_height_limit: null};
      var containerWidth = 299;
      var windowHeight = 400;
      var expect = null;
      var result = findVisibleArtboard(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
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
      var expect = {
        id: 1, min_width: 600, aspect_ratio: 2, vertical_overflow: 30};
      var result = findVisibleArtboard(data, containerWidth, windowHeight, opts);
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

      var expect = {
        id: 0, min_width: 300, aspect_ratio: 1, display_width: 300, vertical_overflow: 30};
      var result = findVisibleArtboard(data, containerWidth, windowHeight, opts);
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

      var expect = {
        id: 1, min_width: 600, aspect_ratio: 2, display_width: 600, vertical_overflow: 30};
      var result = findVisibleArtboard(data, containerWidth, windowHeight, opts);
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
      var expect = {id: 1, min_width: 600, aspect_ratio: 1.5, display_width: 750};
      var result = findVisibleArtboard(data, containerWidth, windowHeight, opts);
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
      var expect = {id: 1, min_width: 600, aspect_ratio: 1.5};
      var result = findVisibleArtboard(data, containerWidth, windowHeight, opts);
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
      var expect = {id: 0, min_width: 300, aspect_ratio: 1};
      var result = findVisibleArtboard(data, containerWidth, windowHeight, opts);
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
      var expect = {id: 1, min_width: 600, aspect_ratio: 1.5, display_width: 700};
      var result = findVisibleArtboard(data, containerWidth, windowHeight, opts);
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
      var expect = {id: 1, min_width: 600, aspect_ratio: 1.5, display_width: 700};
      var result = findVisibleArtboard(data, containerWidth, windowHeight, opts);
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
      var expect = {id: 2, min_width: 900, aspect_ratio: 1.5, display_width: 1000};
      var result = findVisibleArtboard(data, containerWidth, windowHeight, opts);
      assert.deepEqual(result, expect);
    });

  })
});
