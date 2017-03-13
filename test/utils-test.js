var lib = require('../');
var assert = require('assert');

describe('Utility function tests', function() {

  describe('testBoundsIntersection()', function() {
    it('true if overlapping bounds', function() {
      var a = [],
          b = []
      assert.equal(lib.testBoundsIntersection(a, b));
    });
  });


  describe('trim()', function() {
    it('removes spaces from beginning and end of strings', function() {
      assert.equal(lib.trim('  \t\rfoo \n'), 'foo');
    });
  });


});
