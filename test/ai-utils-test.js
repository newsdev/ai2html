var env = require('./ai-env');
var lib = require('../');
var assert = require('assert');

describe('Illustrator utility functions', function () {

  describe('readGitConfigFile()', function () {
    it ('returns null if file does not exist', function() {
      var data = lib.readGitConfigFile('./missing_file');
      assert.strictEqual(data, null);
    });

    it ('returns JS object if file can be parsed', function() {
      var data = lib.readGitConfigFile('test/data/config');
      assert.deepEqual(data, {
        repositoryformatversion: '0',
        ignorecase: 'true',
        url: 'git@github.com:newsdev/ai2html.git',
        remote: 'origin',
        merge: 'refs/heads/master'
      });
    });

  });

  describe('readYamlConfigFile()', function () {
    it ('returns null if file does not exist', function() {
      var data = lib.readYamlConfigFile('./missing_file');
      assert.strictEqual(data, null);
    });

    it ('returns JS object if file can be parsed', function() {
      var data = lib.readYamlConfigFile('test/data/config.yml');
      assert.deepEqual(data, {
        project_type: 'ai2html',
        min_width: '300',
        max_width: '600',
        headline: 'Elementary: Schools in District 3',
        leadin: '',
        credit: 'By The New York "Times"',
        show_in_compatible_apps: 'yes',
        constrain_width_to_text_column: 'true'
      });
    });

  });

});