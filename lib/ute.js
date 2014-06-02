var ejs      = require('ejs');
var express  = require('express');
var partials = require('express-partials');
var fs       = require('fs');
var nconf    = require('nconf');
var p        = require('path');
var util     = require('util');

/**
 * class Ute
 */
function Ute(opts) {
  opts = opts || {};

  this.opts = {
    confDir  : opts.confDir || 'conf',
    env      : opts.env || process.env.UTE_ENV || 'local',
    staticDir: opts.staticDir || 'public'
  };

  nconf.file(p.join(this.opts.confDir, this.opts.env + '.json'));
}

/**
 * Start application with:
 * - routes wiring from opts.confDir/routes.json mapped to available handlers, default: conf/routes.json
 * - application port configurable via opts.confDir/<env>.json, default: conf/local.json
 *
 * @param {Array} handlers: handler functions with reques, response, next arguments
 * @param {Object} opts: optional express for testing
 */
Ute.prototype.start = function (handlers, opts) {
  express = opts.express || express;

  var self       = this;
  var app        = express();
  var routesFile = p.join(this.opts.confDir, 'routes.json');
  var routes     = JSON.parse(fs.readFileSync(routesFile).toString());

  // setup partials layout support (must be done prior to wiring routes)
  app.use(partials());

  // setup static files
  app.use(express.static(this.opts.staticDir));

  // use ejs rendering engine
  app.engine('.html', ejs.__express);

  // wire routes
  routes.forEach(function (route) {
    app[route.method.toLowerCase()](route.path, handlers[route.handler]);
  });

  // start the app
  console.log('Starting application %s on port %d', nconf.get('app:name'), nconf.get('app:port'));
  app.listen(nconf.get('app:port'));

  return app;
};

module.exports = Ute;
