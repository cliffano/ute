var buster = require('buster-node'),
  nconf = require('nconf'),
  referee = require('referee'),
  Ute = require('../lib/ute'),
  assert = referee.assert;

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
    this.stub(process, 'env', { UTE_ENV: 'someuteenv' })
    var ute = new Ute();
    assert.equals(ute.opts.confDir, 'conf');
    assert.equals(ute.opts.env, 'someuteenv');
    assert.equals(ute.opts.staticDir, 'public');
  }
});

// TODO
buster.testCase('ute - start', {
  setUp: function () {
    this.ute = new Ute();
    this.mockConsole = this.mock(console);
    this.mockNconf = this.mock(nconf);
  }
});

buster.testCase('ute - stop', {
  setUp: function () {
    this.ute = new Ute();
    this.mockConsole = this.mock(console);
    this.mockNconf = this.mock(nconf);
    this.mockProcess = this.mock(process);
    this.mockNconf.expects('get').withExactArgs('app:name').returns('someapp');
  },
  'should stop with non-zero exit code': function () {
    this.mockConsole.expects('error').withExactArgs(
      'Exiting application %s with exit code %d due to error:\n%s',
      'someapp', 1, 'some error'
    );
    this.mockProcess.expects('exit').withExactArgs(1);
    this.ute.stop(new Error('some error'));
  },
  'should shut down with exit code zero and log a message': function () {
    this.mockConsole.expects('error').withExactArgs('Shutting down application %s', 'someapp');
    this.mockProcess.expects('exit').withExactArgs(0);
    this.ute.stop();
  }
});