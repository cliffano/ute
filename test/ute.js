var buster   = require('buster-node');
var ejs      = require('ejs');
var express  = require('express');
var partials = require('express-partials');
var fs       = require('fs');
var nconf    = require('nconf');
var referee  = require('referee');
var Ute      = require('../lib/ute');
var assert   = referee.assert;

buster.testCase('ute - ute', {
  setUp: function () {
    this.mockNconf = this.mock(nconf);
  },
  'should set default opts when opts is not provided': function () {
    this.mockNconf.expects('file').withExactArgs('conf/local.json');
    var ute = new Ute();
    assert.equals(ute.opts.confDir, 'conf');
    assert.equals(ute.opts.env, 'local');
    assert.equals(ute.opts.staticDir, 'public');
  },
  'should set custom opts when opts is provided': function () {
    this.mockNconf.expects('file').withExactArgs('someconf/someenv.json');
    var ute = new Ute({
      confDir  : 'someconf',
      env      : 'someenv',
      staticDir: 'somestatic'
    });
    assert.equals(ute.opts.confDir, 'someconf');
    assert.equals(ute.opts.env, 'someenv');
    assert.equals(ute.opts.staticDir, 'somestatic');
  },
  'should set env to UTE_ENV env variable when opts env is not specified': function () {
    this.mockNconf.expects('file').withExactArgs('conf/someuteenv.json');
    this.stub(process, 'env', { UTE_ENV: 'someuteenv' });
    var ute = new Ute();
    assert.equals(ute.opts.confDir, 'conf');
    assert.equals(ute.opts.env, 'someuteenv');
    assert.equals(ute.opts.staticDir, 'public');
  }
});

buster.testCase('ute - start', {
  setUp: function () {
    this.mockConsole = this.mock(console);
    this.mockFs      = this.mock(fs);
    this.mockNconf   = this.mock(nconf);
  },
  'should start the application on specified port': function () {

    var self = this;

    var mockApp = {
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
    var mockExpress = function () {
      return mockApp;
    };
    mockExpress.static = function (dir) {
      assert.equals(dir, 'somestaticdir');
    };
    var handlers = {
      somehandler: function () {}
    };

    this.mockNconf.expects('file').withExactArgs('test/fixtures/local.json');
    this.mockNconf.expects('get').withExactArgs('app:name').returns('someapp');
    this.mockNconf.expects('get').twice().withExactArgs('app:port').returns(3000);
    this.mockConsole.expects('log').withExactArgs('Starting application %s on port %d', 'someapp', 3000);
    this.mockFs.expects('readFileSync').withExactArgs('test/fixtures/routes.json')
        .returns('[{ "method": "GET", "path": "/foo", "handler": "somehandler" }]');

    var ute = new Ute({ confDir: 'test/fixtures', staticDir: 'somestaticdir' });
    var app = ute.start(handlers, { express: mockExpress });

    assert.equals(app, mockApp);
  }
});