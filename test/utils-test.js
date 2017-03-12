var lib = require('../').internal;
var assert = require('assert');

describe('Utility function tests', function() {

  describe('trim()', function() {
    it('removes spaces from beginning and end of strings', function() {
      assert.equal(lib.trim('  \t\rfoo \n'), 'foo');
    });
  });





});