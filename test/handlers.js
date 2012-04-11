var assert = require('assert'),
  sandbox = require('sandboxed-module'),
  vows = require('vows');

vows.describe('handlers').addBatch({
  'handlers': {
    topic: function () {
      return function (mocks, checks) {
        return sandbox.require('../lib/handlers', {
          requires: mocks.requires,
          globals: mocks.globals
        });
      };
    },
    'when html has an error': {
      topic: function (topic) {
        var checks = {},
          mocks = {};
        new topic(mocks, checks).html(
          new Error('dummy error'),
          {
            render: function (page, params) {
              checks.page = page;
              checks.params = params;
            }
          },
          { foo: 'bar' },
          null
        );
        return checks;
      },
      'then error page 500 should be rendered': function (checks) {
        assert.equal(checks.page, '500.html');
      },
      'and error message should be passed as locals message': function (checks) {
        assert.equal(checks.params.locals.message, 'dummy error');
      },
      'and status code 500 should be passed': function (checks) {
        assert.equal(checks.params.status, 500);
      },
      'and default layout should be set': function (checks) {
        assert.isTrue(checks.params.layout);
      },
      'and predefined params should be passed to locals': function (checks) {
        assert.equal(checks.params.locals.foo, 'bar');
      }
    },
    'when html has no error': {
      topic: function (topic) {
        var checks = {},
          mocks = {};
        new topic(mocks, checks).html(
          null,
          null,
          null,
          this.callback
        );
      },
      'then success callback should be called with no arg': function (arg) {
        assert.isUndefined(arg);
      }
    },
    'when json has an error': {
      topic: function (topic) {
        var checks = {},
          mocks = {
            globals: {
              console: {
                error: function (message) {
                  checks.errorMessage = message;
                }
              }
            }
          };
        new topic(mocks, checks).json(
          new Error('dummy error'),
          {
            json: function (data, code) {
              checks.data = data;
              checks.code = code;
            }
          },
          null
        );
        return checks;
      },
      'then error message should be logged to console': function (checks) {
        assert.equal(checks.errorMessage, 'Error: dummy error');
      },
      'and response should have status code 500': function (checks) {
        assert.equal(checks.code, 500);
      },
      'and response data should contain JSON string': function (checks) {
        assert.equal(checks.data, '{"status":"error","message":"dummy error"}');
      }
    },
    'when json has no error': {
      topic: function (topic) {
        var checks = {},
          mocks = {};
        new topic(mocks, checks).json(
          null,
          null,
          this.callback
        );
      },
      'then success callback should be called with no arg': function (arg) {
        assert.isUndefined(arg);
      }
    }
  }
}).exportTo(module);
 