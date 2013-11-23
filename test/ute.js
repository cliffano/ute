var buster = require('buster-node'),
  cluster = require('cluster'),
  Cluster2 = require('cluster2'),
  fs = require('fs'),
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
    this.stub(process, 'env', { UTE_ENV: 'someuteenv' });
    var ute = new Ute();
    assert.equals(ute.opts.confDir, 'conf');
    assert.equals(ute.opts.env, 'someuteenv');
    assert.equals(ute.opts.staticDir, 'public');
  }
});

buster.testCase('ute - start master', {
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

    var self = this;
    this.stub(Cluster2.prototype, 'listen', function (cb) {
      cb(function () {
        self.calls.done = true;
      });
    });
    var preTasks = [
      function (cb) {
        self.calls.preTask1 = true;
        cb();
      },
      function (cb) {
        self.calls.preTask2 = true;
        cb();
      }
    ];
    var postTasks = [
      function (cb) {
        self.calls.postTask1 = true;
        cb();
      },
      function (cb) {
        self.calls.postTask2 = true;
        cb();
      }
    ];

    var ute = new Ute({ confDir: 'test/fixtures' });
    var app = ute.start(this.handlers, { preTasks: preTasks, postTasks: postTasks });

    assert.isTrue(this.calls.preTask1);
    assert.isTrue(this.calls.preTask2);
    assert.isTrue(this.calls.postTask1);
    assert.isTrue(this.calls.postTask2);
    assert.isTrue(this.calls.done);
  },
  'should stop when pre task gives an error': function (done) {
    this.stub(cluster, 'isMaster', 'foobar');
    this.stub(process, 'pid', 1234);

    this.mockNconf.expects('get').withExactArgs('app:port').returns(3000);
    this.mockNconf.expects('get').withExactArgs('app:workers').returns(3);
    this.mockNconf.expects('get').withExactArgs('app:pidsDir').returns('somepids');

    var self = this;
    this.stub(Cluster2.prototype, 'listen', function (cb) {
      cb(function () {
        self.calls.done = true;
      });
    });
    var preTasks = [
      function (cb) {
        self.calls.preTask1 = true;
        cb();
      },
      function (cb) {
        self.calls.preTask2 = true;
        cb(new Error('some error'));
      }
    ];
    var postTasks = [
      function (cb) {
        self.calls.postTask1 = true;
        cb();
      },
      function (cb) {
        self.calls.postTask2 = true;
        cb();
      }
    ];

    var ute = new Ute({ confDir: 'test/inexistingdir' });
    ute.stop = function (err) {
      assert.defined(err);
      done();
    };
    var app = ute.start(this.handlers, { preTasks: preTasks, postTasks: postTasks });

    assert.isTrue(this.calls.preTask1);
    assert.isTrue(this.calls.preTask2);
    assert.equals(this.calls.postTask1, undefined);
    assert.equals(this.calls.postTask2, undefined);
    assert.equals(this.calls.done, undefined);
  },
  'should stop when post task gives an error': function (done) {
    this.stub(cluster, 'isMaster', 'foobar');
    this.stub(process, 'pid', 1234);

    this.mockNconf.expects('get').withExactArgs('app:name').returns('someapp');
    this.mockNconf.expects('get').twice().withExactArgs('app:port').returns(3000);
    this.mockNconf.expects('get').withExactArgs('app:workers').returns(3);
    this.mockNconf.expects('get').withExactArgs('app:pidsDir').returns('somepids');

    var self = this;
    this.stub(Cluster2.prototype, 'listen', function (cb) {
      cb(function () {
        self.calls.done = true;
      });
    });
    var preTasks = [
      function (cb) {
        self.calls.preTask1 = true;
        cb();
      },
      function (cb) {
        self.calls.preTask2 = true;
        cb();
      }
    ];
    var postTasks = [
      function (cb) {
        self.calls.postTask1 = true;
        cb();
      },
      function (cb) {
        self.calls.postTask2 = true;
        cb(new Error('some error'));
      }
    ];

    var ute = new Ute({ confDir: 'test/inexistingdir' });
    ute.stop = function (err) {
      assert.defined(err);
      done();
    };
    var app = ute.start(this.handlers, { preTasks: preTasks, postTasks: postTasks });

    assert.isTrue(this.calls.preTask1);
    assert.isTrue(this.calls.preTask2);
    assert.isTrue(this.calls.postTask1);
    assert.isTrue(this.calls.postTask2);
    assert.equals(this.calls.done, undefined);
  }
});

buster.testCase('ute - start worker', {
  setUp: function () {
    this.mockConsole = this.mock(console);
    this.mockFs = this.mock(fs);
    this.mockNconf = this.mock(nconf);
    this.calls = {};
  },
  'should start worker': function () {
    this.stub(cluster, 'isMaster', false);
    this.stub(process, 'pid', 1234);

    this.mockNconf.expects('get').withExactArgs('app:port').returns(undefined);
    this.mockNconf.expects('get').withExactArgs('app:workers').returns(undefined);
    this.mockNconf.expects('get').withExactArgs('app:pidsDir').returns(undefined);

    this.mockConsole.expects('log').withExactArgs('Worker is running on pid %d', 1234);

    var self = this;
    this.stub(Cluster2.prototype, 'listen', function (cb) {
      cb(function () {
        self.calls.done = true;
      });
    });
    var preTasks = [
      function (cb) {
        self.calls.preTask1 = true;
        cb();
      },
      function (cb) {
        self.calls.preTask2 = true;
        cb();
      }
    ];
    var postTasks = [
      function (cb) {
        self.calls.postTask1 = true;
        cb();
      },
      function (cb) {
        self.calls.postTask2 = true;
        cb();
      }
    ];

    var handlers = {
      'somehandler1': function (req, res, next) {
      },
      'somehandler2': function (req, res, next) {
      }
    };
    var ute = new Ute({ confDir: 'test/fixtures' });
    var app = ute.start(handlers, { preTasks: preTasks, postTasks: postTasks });

    assert.equals(this.calls.preTask1, undefined);
    assert.equals(this.calls.preTask2, undefined);
    assert.equals(this.calls.postTask1, undefined);
    assert.equals(this.calls.postTask2, undefined);
    assert.isTrue(this.calls.done);
  },
  'should stop when handler does not exist': function (done) {    
    this.stub(cluster, 'isMaster', false);
    this.stub(process, 'pid', 1234);

    this.mockNconf.expects('get').withExactArgs('app:port').returns(undefined);
    this.mockNconf.expects('get').withExactArgs('app:workers').returns(3);
    this.mockNconf.expects('get').withExactArgs('app:pidsDir').returns(undefined);

    this.mockConsole.expects('log').withExactArgs('Worker is running on pid %d', 1234);

    var handlers = {};
    var ute = new Ute({ confDir: 'test/fixtures' });
    ute.stop = function (err) {
      assert.defined(err);
      done();
    };
    ute.start(handlers);
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
