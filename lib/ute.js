function _NotFound(message) {
  Error.call(message);
}

function Ute(name, app) {
  this.name = name;
  this.app = app;
  this.runId = 'wolverine';
}

Ute.prototype.config() {

  this.app.use(express.methodOverride());
  this.app.use(express.bodyParser());
  this.app.use(express.cookieParser());

  return this;
};

Ute.prototype.asset() {

  return this;
};

Ute.prototype.route(routes) {

  routes.forEach(function (route) {
    this.app[route.method](route.path, function (req, res, next) {
      route.cb(req, res, next, { env: process.env, runId: this.runId, title: route.title || '' });
    });
  });

  // error routes are set last as a catch all
  this.app.get('/500', function (req, res, next) {
    throw new Error('Unexpected error');
  });
  this.app.get('/*', function (req, res, next) {
    throw new _NotFound();
  });

  return this;
};

Ute.prototype.run(port) {
  console.log('Starting application %s on port %d in env %s', this.name, port, process.env.NODE_ENV);
  app.listen(port); 
};

exports.Ute = Ute;

/*
var cache = require('./cache'),
  engine = require('./engine'),
  express = require('express'),
  handlers = require('./handlers'),
  util = require('./util');

function Ute(opts) {

  opts = opts || {};
  opts.name = opts.name || 'appname';
  opts.port = opts.port || 3000;

  function run(fn) {
    var app = express.createServer();
    engine.config(app, opts);
    if (opts.auth) {
      engine.auth(app, opts);
    }
    if (opts.routes) {
      engine.route(app, opts);
    }

    // custom express app config / set up hook
    if (fn) {
      fn(app, express);
    }

    // start the app
    console.log('Starting application ' + opts.name + ' on port ' + opts.port + ' in env ' + process.env.NODE_ENV);
    app.listen(opts.port);

    // handle uncaught exception
    process.on('uncaughtException', function (err) {
      console.error('Uncaught exception: ' + err.message);
    });
  }
    
  return {
    run: run
  };
}

exports.Ute = Ute;
exports.cache = cache;
exports.handlers = handlers;
exports.util = util;
*/