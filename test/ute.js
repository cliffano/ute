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
      confDir: 'someconf',
      env: 'someenv',
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
/*
buster.testCase('ute - start', {
  setUp: function () {
    this.mockConsole = this.mock(console);
    this.mockFs = this.mock(fs);
    this.mockNconf = this.mock(nconf);
    this.calls = {};
    this.handlers = {
      'somehandler1': function (req, res, next) {
      },
      'somehandler2': function (req, res, next) {
      }
    };
  },
  'should start master and execute pre and post tasks': function () {
    this.stub(cluster, 'isMaster', 'foobar');
    this.stub(process, 'pid', 1234);

    this.mockNconf.expects('get').withExactArgs('app:name').returns('someapp');
    this.mockNconf.expects('get').twice().withExactArgs('app:port').returns(3000);
    this.mockNconf.expects('get').withExactArgs('app:workers').returns(3);
    this.mockNconf.expects('get').withExactArgs('app:pidsDir').returns('somepids');

    this.mockConsole.expects('log').withExactArgs('Starting application %s on port %d', 'someapp', 3000);
    this.mockConsole.expects('log').withExactArgs('Master is running on pid %d', 1234);

    var ute = new Ute({ confDir: 'test/fixtures' });
    var app = ute.start(this.handlers, { preTasks: preTasks, postTasks: postTasks });

    assert.isTrue(this.calls.preTask1);
    assert.isTrue(this.calls.preTask2);
    assert.isTrue(this.calls.postTask1);
    assert.isTrue(this.calls.postTask2);
    assert.isTrue(this.calls.done);
  }
});
*/