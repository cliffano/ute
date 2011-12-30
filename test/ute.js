var assert = require('assert'),
  sandbox = require('sandboxed-module'),
  vows = require('vows');

vows.describe('ute').addBatch({
  'run': {
    topic: function () {
      return function (checks) {
        return sandbox.require('../lib/ute', {
          requires: {
            express: {
              createServer: function () {
                return {
                  listen: function (port) {
                    checks.port = port;
                  }
                };
              }
            },
            './engine': {
              config: function (app, opts) {
                checks.configApp = app;
                checks.configOpts = opts;
              },
              route: function (app, opts) {
                checks.routeApp = app;
                checks.routeOpts = opts;
              }
            }
          },
          globals: {
            console: {
              log: function (message) {
                checks.message = message;
              }
            },
            process: {
              env: {
                NODE_ENV: 'development'
              }
            }
          }
        });
      };
    },
    'default options should be used when no option is specified': function (topic) {
      var checks = {},
        ute = new topic(checks).Ute();
      ute.run();
      assert.equal(checks.port, 3000);
      assert.isFunction(checks.configApp.listen);
      assert.equal(checks.configOpts.name, 'uteapp');
      assert.equal(checks.configOpts.port, 3000);
      assert.isEmpty(checks.configOpts.routes);
      assert.equal(checks.configApp, checks.routeApp);
      assert.equal(checks.configOpts, checks.routeOpts);
      assert.equal(checks.message, 'Starting application uteapp on port 3000 in env development');
    },
    'custom options should be used when custom options are specified': function (topic) {
      var checks = {},
        ute = new topic(checks).Ute({
          name: 'dummyapp',
          port: 8888,
          routes: [
            { method: 'get', path: '/', fn: function () {} },
            { method: 'post', path: '/blah', fn: function () {} }
          ]
        });
      ute.run();
      assert.equal(checks.port, 8888);
      assert.isFunction(checks.configApp.listen);
      assert.equal(checks.configOpts.name, 'dummyapp');
      assert.equal(checks.configOpts.port, 8888);
      assert.equal(checks.configOpts.routes.length, 2);
      assert.equal(checks.configApp, checks.routeApp);
      assert.equal(checks.configOpts, checks.routeOpts);
      assert.equal(checks.message, 'Starting application dummyapp on port 8888 in env development');
    }
  }
}).exportTo(module);