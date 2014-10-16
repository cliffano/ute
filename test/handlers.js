var buster   = require('buster-node');
var handlers = require('../lib/handlers');
var referee  = require('referee');
var assert   = referee.assert;

buster.testCase('handlers - error', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
  'should log error message and respond with an error': function (done) {
    this.mockConsole.expects('error').withExactArgs('An unexpected error occurred %s', 'some error');

    var res = {
      status: function (code) {
        assert.equals(code, 500);
        return res;
      },
      send: function (message) {
        assert.equals(message, 'some error');
        done();
      }
    };

    handlers.error(new Error('some error'), null, res, null);
  }
});