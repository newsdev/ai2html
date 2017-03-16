var lib = require('../');
var assert = require('assert');

describe('Utility function tests', function() {

  describe('testBoundsIntersection()', function() {
    it('true if bounds overlap', function() {
      assert.equal(lib.testBoundsIntersection([-16,-162,234,-408], [150,-347,400,-593]), true);
    });
    it('false if bounds do not overlap', function() {
      assert.equal(lib.testBoundsIntersection([-16,-162,234,-408], [-14,-436,236,-682]), false);
      assert.equal(lib.testBoundsIntersection([-16,-162,234,-408], [253,-226,503,-472]), false);
      assert.equal(lib.testBoundsIntersection([-16,-162,234,-408], [-277,-106,-27,-352]), false);
      assert.equal(lib.testBoundsIntersection([-16,-162,234,-408], [-7,102,243,-144]), false);
    });
  });

  describe('trim()', function() {
    it('removes whitespace from beginning and end of strings', function() {
      assert.equal(lib.trim('  \t\rfoo \n'), 'foo');
    });
  });

  describe('zeroPad()', function() {
    it('left-pads numbers or strings with zeros', function() {
      assert.equal(lib.zeroPad(1, 2), '01');
      assert.equal(lib.zeroPad("", 2), '00');
      assert.equal(lib.zeroPad("10", 2), '10');
      assert.equal(lib.zeroPad(100, 2), '100');
    });
  });

  describe('roundTo()', function() {
    it('rounds number to specified decimals', function() {
      assert.equal(lib.roundTo(0.111111, 2), 0.11);
      assert.equal(lib.roundTo(0.1, 2), 0.1);
      assert.equal(lib.roundTo(0, 2), 0);
      assert.equal(lib.roundTo(110.1, 0), 110);
    });
  });

  describe('contains()', function() {
    it('false if item not in array', function() {
      assert.equal(lib.contains([], 'a'), false);
      assert.equal(lib.contains([1], '1'), false);
      assert.equal(lib.contains(['a', 'b', 'd'], 'c'), false);
    });
    it('true if item is in array', function() {
      assert.equal(lib.contains([null], null), true);
      assert.equal(lib.contains([1], 1), true);
      assert.equal(lib.contains(['a', 'b', 'd'], 'b'), true);
    });
    it('arg2 can be a test function', function() {
      assert.equal(lib.contains([1, 2, 3], function(n) {return n == 3;}), true);
      assert.equal(lib.contains([1, 2, 3], function(n) {return n > 3;}), false);
    });
  });

  describe('arraySubtract(a, b)', function() {
    it('returns elements in array a but not array b', function() {
      assert.deepEqual(lib.arraySubtract([], [1, 2, 3]), []);
      assert.deepEqual(lib.arraySubtract([1, 2, 3], []), [1, 2, 3]);
      assert.deepEqual(lib.arraySubtract([1, 2, 3, 2, 3], [2]), [1, 3, 3]);
    });
  });

  describe('firstBy', function() {
    it('sorts on two dimensions', function() {
      var arr = [{a: 1, b: 1, c: 0}, {a: 1, b: 2, c: 1}, {a: 2, b: 1, c: 2}, {a: 2, b: 2, c: 3}];
      arr.sort(lib
        .firstBy(function(n, m) {return m.a - n.a;})
        .thenBy(function(n, m) {return m.b - n.b;}));
      assert.deepEqual(arr, [{a: 2, b: 2, c: 3}, {a: 2, b: 1, c: 2}, {a: 1, b: 2, c: 1}, {a: 1, b: 1, c: 0}]);
    })
  });

});
