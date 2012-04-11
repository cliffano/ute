var assert = require('assert'),
  sandbox = require('sandboxed-module'),
  vows = require('vows');

vows.describe('util').addBatch({
  'status': {
    topic: require('../lib/util'),
    'should return correct status codes': function (topic) {
      var status = topic.status;
      assert.equal(status['new'], 'N');
      assert.equal(status.rejected, 'R');
      assert.equal(status.accepted, 'A');
      assert.equal(status.flagged, 'F');
    }
  },
  'date': {
    topic: function () {
      return function (mocks, checks) {
        return sandbox.require('../lib/util', {
          globals: {
            Date: mocks.date
          }
        });
      };
    },
    'currentIso': {
      topic: function (topic) {
        var checks = {},
          mocks = {
            date: function() {
              return {
                toISOString: function () {
                  return '2012-04-11T08:23:35.218Z';
                }
              };
            }
          };
        return new topic(mocks, checks).date.currentIso();
      },
      'should delegate to Date.toISOString()': function (result) {
        assert.equal(result, '2012-04-11T08:23:35.218Z');
      }
    }
  }
}).exportTo(module);
 