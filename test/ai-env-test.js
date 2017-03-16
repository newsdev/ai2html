var assert = require('assert');
var env = require('./ai-env');

describe('Illustrator testing environment', function () {
  it('File.exists returns true if file exists', function() {
    var f = new File('test/data/config');
    assert.equal(f.exists, true);
  });

  it('File.exists returns false if file does not exist', function() {
    var f = new File('missing_file');
    assert.equal(f.exists, false);
  });

  it('File.readln() and File.eof work', function() {
    var f = new File('test/data/text/oneline.txt');
    f.open('r');
    assert.equal(f.eof, false);
    assert.equal(f.readln(), 'line one');
    assert.equal(f.eof, true);
  })

  it('File.readln() handles eol char at end of file', function() {
    [ 'test/data/text/oneline_lf.txt',
      'test/data/text/oneline_cr.txt',
      'test/data/text/oneline_crlf.txt'].forEach(function(path) {
      var f = new File(path);
      f.open('r');
      assert.equal(f.readln(), 'line one');
      assert.equal(f.eof, true);
      f.close();
    })
  })

  it('File.readln() handles \\r \\n and \\r\\n line terminators', function() {
    [ 'test/data/text/twolines_lf.txt',
      'test/data/text/twolines_cr.txt',
      'test/data/text/twolines_crlf.txt'].forEach(function(path) {
      var f = new File(path);
      f.open('r');
      assert.equal(f.readln(), 'line one');
      assert.equal(f.readln(), 'line two');
      assert.equal(f.eof, true);
      f.close();
    })
  })

  it('Folder.exists returns true if folder exists', function() {
    var f = new Folder('test/data');
    assert.equal(f.exists, true);
  });

  it('Folder.exists returns false if folder does not exist', function() {
    var f = new Folder('test/missing_file');
    assert.equal(f.exists, false);
  });

});