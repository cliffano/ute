var buster     = require('buster-node');
var ejs        = require('ejs');
var express    = require('express');
var partials   = require('express-partials');
var fs         = require('fs');
var log4js     = require('log4js');
var nconf      = require('nconf');
var proxyquire = require('proxyquire');
var referee    = require('referee');
var Ute        = require('../lib/ute');
var assert     = referee.assert;

buster.testCase('ute - ute', {
  setUp: function () {
    this.mockNconf = this.mock(nconf);
  },
  'should set default opts when opts is not provided': function () {
    this.mockNconf.expects('file').withExactArgs('conf/ute.json');
    var ute = new Ute();
    assert.equals(ute.opts.appConfDir, 'conf');
    assert.equals(ute.opts.envConfDir, 'conf');
    assert.equals(ute.opts.staticDir, 'public');
  },
  'should set custom opts when opts is provided': function () {
    this.mockNconf.expects('file').withExactArgs('someenvconf/ute.json');
    var ute = new Ute({
      appConfDir: 'someappconf',
      envConfDir: 'someenvconf',
      staticDir : 'somestatic'
    });
    assert.equals(ute.opts.appConfDir, 'someappconf');
    assert.equals(ute.opts.envConfDir, 'someenvconf');
    assert.equals(ute.opts.staticDir, 'somestatic');
  }
});

buster.testCase('ute - start', {
  setUp: function () {
    this.mockApp = {
      use   : function () {},
      engine: function (ext, type) {
        assert.equals(ext, '.html');
        assert.isTrue(type !== null);
      },
      listen: function (port) {
        assert.equals(port, 3000);
      },
      get   : function (path, handler) {
        assert.equals(path, '/foo');
        assert.isTrue(handler !== null);
      }
    };
    var self = this;
    var mockExpress = function () {
      return self.mockApp;
    };
    mockExpress.static = function (dir) {
      assert.equals(dir, 'somestaticdir');
    };
    this.Ute = proxyquire('../lib/ute', { express: mockExpress });

    this.mockConsole = this.mock(console);
    this.mockFs      = this.mock(fs);
    this.mockLog4js  = this.mock(log4js);
    this.mockNconf   = this.mock(nconf);
    this.mockProcess = this.mock(process);
  },
  'should start the application on specified port': function () {

    var self = this;
    var handlers = {
      somehandler: function () {}
    };

    this.mockConsole.expects('error').withExactArgs('Uncaught exception: some error');
    this.mockConsole.expects('trace').withExactArgs();
    this.mockProcess.expects('on').withArgs('uncaughtException').callsArgWith(1, new Error('some error'));

    this.mockNconf.expects('file').withExactArgs('test/fixtures/ute.json');
    this.mockNconf.expects('get').withExactArgs('app:name').returns('someapp');
    this.mockNconf.expects('get').twice().withExactArgs('app:port').returns(3000);
    this.mockConsole.expects('log').withExactArgs('Starting application %s on port %d', 'someapp', 3000);
    this.mockLog4js.expects('configure').withExactArgs('test/fixtures/log4js.json');
    this.mockFs.expects('readFileSync').withExactArgs('test/fixtures/routes.json')
        .returns('[{ "method": "GET", "path": "/foo", "handler": "somehandler" }]');

    var ute = new this.Ute({ appConfDir: 'test/fixtures', envConfDir: 'test/fixtures', staticDir: 'somestaticdir' });
    var app = ute.start(handlers);

    assert.equals(app, this.mockApp);
  }
});