var assert = require('assert'),
  sandbox = require('sandboxed-module'),
  vows = require('vows');

vows.describe('engine').addBatch({
  'engine': {
    topic: function () {
      return function (mocks) {
        return sandbox.require('../lib/engine', mocks);
      };
    },
    'when config is called': {
      topic: function (topic) {
        return function (checks) {
          (new topic({
            requires: {
              'connect-assetmanager': function(assets) {
                checks.assets = assets;
              },
              express: {
                'static': function (dir) {
                  return dir;
                },
                'errorHandler': function () {
                  checks.errorHandlerCallCount = 1;
                }
              },
              fs: {
                readdirSync: function (path) {
                  var files = [];
                  if (path === './public/scripts') {
                    files = ['a.js', 'b.js'];
                  } else if (path === './public/styles') {
                    files = ['a.css', 'b.css'];
                  }
                  return files;
                }
              }
            }
          })).config({
            configure: function (fn) {
              fn();
            },
            error: function (cb) {
              checks.errorCallCount = 1;
            },
            register: function (ext, templateEngine) {
              checks.ext = ext;
              assert.isNotNull(templateEngine);
            },
            use: function(arg1, arg2) {
              if (arg2) {
                checks.resources.push({ path: arg1, dir: arg2 });
              }

            }
          }, {
            name: 'myapp'
          });
        };
      },
      'then template engine, assets, and static resources should be set up': function (topic) {
        var checks = { resources: [] };
        topic(checks);
        assert.equal(checks.ext, '.html');
        assert.equal(checks.errorHandlerCallCount, 1);
        assert.equal(checks.errorCallCount, 1);
        assert.equal(checks.resources.length, 3);
        assert.equal(checks.resources[0].path, '/images');
        assert.equal(checks.resources[0].dir, './public/images/');
        assert.equal(checks.resources[1].path, '/scripts');
        assert.equal(checks.resources[1].dir, './public/scripts/');
        assert.equal(checks.resources[2].path, '/styles');
        assert.equal(checks.resources[2].dir, './public/styles/');
      }
    },
    'when route has empty routes': {
      topic: function (topic) {
        return function (checks) {
          (new topic()).route({
            get: function (path, cb) {
              checks.push({ path: path, cb: cb});
            }
          }, { routes: [] });
        };
      },
      'then app should only be configured with error routes': function (topic) {
        var checks = [];
        topic(checks);
        assert.equal(checks.length, 2);
        assert.equal(checks[0].path, '/500');
        assert.equal(checks[1].path, '/*');
      },
      'and error 500 route should throw an error when called': function (topic) {
        var checks = [], err;
        topic(checks);
        try {
          checks[0].cb();
        } catch (e) {
          err = e;
        } 
        assert.equal(err.message, 'Unexpected error');
      },
      'and catch all error route should throw an error when called': function (topic) {
        var checks = [], err;
        topic(checks);
        try {
          checks[1].cb();
        } catch (e) {
          err = e;
        } 
        assert.equal(typeof err, 'object');
        assert.isUndefined(err.message);
      }
    },
    'when route has routes': {
      topic: function (topic) {
        return function (checks) {
          (new topic()).route({
            get: function (path, fn) {
              checks.push({ method: 'get', path: path, cb: function () {} });
            }
          }, { routes: [
            { method: 'get', path: '/home', fn: function () {} },
            { method: 'get', path: '/contactus', fn: function () {} }
          ] });
        };
      },
      'then app should contain specified routes': function (topic) {
        var checks = [];
        topic(checks);
        assert.equal(checks.length, 4);
        assert.equal(checks[0].method, 'get');
        assert.equal(checks[0].path, '/home');
        assert.isFunction(checks[0].cb);
        assert.equal(checks[1].method, 'get');
        assert.equal(checks[1].path, '/contactus');
        assert.isFunction(checks[1].cb);
      }
    }
  }
}).exportTo(module);