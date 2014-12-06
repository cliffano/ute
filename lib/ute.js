var connectDomain = require('connect-domain');
var ejs           = require('ejs');
var express       = require('express');
var _handlers     = require('./handlers');
var partials      = require('express-partials');
var fs            = require('fs');
var log4js        = require('log4js');
var nconf         = require('nconf');
var p             = require('path');
var util          = require('util');

/**
 * class Ute
 */
function Ute(opts) {
  opts = opts || {};

  this.opts = {
    appConfDir: opts.appConfDir || 'conf',
    envConfDir: opts.envConfDir || 'conf',
    staticDir : opts.staticDir || 'public'
  };

  nconf.file(p.join(this.opts.envConfDir, 'ute.json'));
}

/**
 * Start application with:
 * - routes wiring from opts.confDir/routes.json mapped to available handlers, default: conf/routes.json
 * - application port configurable via opts.confDir/<env>.json, default: conf/local.json
 *
 * @param {Array} handlers: handler functions with reques, response, next arguments
 */
Ute.prototype.start = function (handlers) {

  var self       = this;
  var app        = express();
  var routesFile = p.join(this.opts.appConfDir, 'routes.json');
  var routes     = JSON.parse(fs.readFileSync(routesFile).toString());

  // setup logging
  log4js.configure(p.join(this.opts.envConfDir,'log4js.json'));

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

  // trap unexpected error
  app.use(connectDomain());
  app.use(_handlers.error);

  // start the app
  console.log('Starting application %s on port %d', nconf.get('app:name'), nconf.get('app:port'));
  app.listen(nconf.get('app:port'));

  return app;
};

module.exports = Ute;
