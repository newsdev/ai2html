var lib = require('../build/ai2html.js');
var assert = require('assert');

// Utility functions that don't depend on Illustrator context
describe('Utility function tests', function() {

  it('compareVersions()', function() {
    assert.equal(lib.compareVersions('0.5.4', '1.4.0'), -1);
    assert.equal(lib.compareVersions('1.4.0', '1.4.0'), 0);
    assert.equal(lib.compareVersions('1.4.0', '1.5.0'), -1);
    assert.equal(lib.compareVersions('1.5.0', '1.4.0'), 1);
    assert.equal(lib.compareVersions('1.4.0', '1.4.1'), -1);
    assert.equal(lib.compareVersions('1.4.1', '1.4.0'), 1);
    assert.equal(lib.compareVersions('1.4.100', '1.4.2'), 1);
  })

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

  describe('getCssColor()', function() {
    it('format rgb channel values for CSS', function() {
      assert.equal(lib.getCssColor(0, 0, 0), 'rgb(0,0,0)');
      assert.equal(lib.getCssColor(200, 10, 255), 'rgb(200,10,255)');
    });
  });

  describe('findHtmlTag()', function() {
    it('finds name of HTML tag in a string', function() {
      assert.equal(lib.findHtmlTag('<a href="#">link text'), 'a');
    });
  });

  describe('cleanHtmlTags()', function() {
    it('converts smart quotes to double quotes', function() {
      assert.equal(lib.cleanHtmlTags('<a href=”#”>link text</a>'), '<a href="#">link text</a>');
    });
  });

  describe('formatCss()', function() {
    it('converts an object containing css properties and values to a CSS block', function() {
      var obj = {
        'line-height': '18px'
      };
      assert.equal(lib.formatCss(obj, '\t\t\t'), '\r\t\t\tline-height:18px;\r');
    });
  });

  describe('trim()', function() {
    it('removes whitespace from beginning and end of strings', function() {
      assert.equal(lib.trim('  \t\rfoo \n'), 'foo');
    });
  });


  describe('stringToLines()', function() {
    it('removes empty lines', function() {
      assert.deepEqual(lib.stringToLines('\n'), []);
      assert.deepEqual(lib.stringToLines('\n\nb\n '), ['b']);
    })

    it('splits by \x03 character (end of text)', function() {
      assert.deepEqual(lib.stringToLines('a\x03b\x03'), ['a', 'b']);
    });

    it('handles inconsistent newlines', function() {
      assert.deepEqual(lib.stringToLines('\na\r\n\n\rb\r'), ['a', 'b']);
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

  describe('applyTemplate()', function() {
    it('Supports ejs-style annotations, with or without =', function() {
      var template = '<%=headline  %><% note %>';
      var output = lib.applyTemplate(template, {headline: 'Fu', note: "bar"});
      assert.equal(output, 'Fubar');
    })

    it('Handles "$" inside replacement text', function() {
      var template = '{{{ price1}}} or {{price2 }}';
      var output = lib.applyTemplate(template, {price1: '$1.00', price2: "$0"});
      assert.equal(output, '$1.00 or $0');
    });

    it('variable names can be uppercast and contain hyphens', function() {
      var template = '{{ G-TITLE }}';
      var output = lib.applyTemplate(template, {'g-title': 'Title'});
      assert.equal(output, 'Title');
    });

  });

  describe('cleanHtmlText()', function() {
    it('Replaces apostrophe with &rsquo;', function() {
      assert.equal(lib.cleanHtmlText('1980\u2019s'), '1980&rsquo;s');
    });
  });

  describe('encodeHtmlEntities()', function() {
    it('Replaces some chars with HTML entities', function() {
      assert.equal(lib.encodeHtmlEntities('A & B "go" <together>'), 'A &amp; B &quot;go&quot; &lt;together&gt;');
    });
  });

  describe('pathJoin()', function() {
    it('Adds fwd slash to separate directories', function() {
      assert.equal(lib.pathJoin('ai', 'output'), 'ai/output');
    })

    it('handles empty directory', function() {
      assert.equal(lib.pathJoin('', 'ab.svg'), 'ab.svg');
    })

    it('removes duplicate slashes', function() {
      assert.equal(lib.pathJoin('ai/', '/output/', 'image.svg'), 'ai/output/image.svg');
    })
  })

  describe('pathSplit()', function() {
    it('test1', function() {
      assert.deepEqual(lib.pathSplit('output/images/image.jpg'), ['output/images', 'image.jpg']);
    })

    it('test2', function() {
      assert.deepEqual(lib.pathSplit('image.svg'), ['', 'image.svg']);
    })
  })
});
