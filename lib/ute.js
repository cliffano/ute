var cluster = require('cluster'),
  Cluster2 = require('cluster2'),
  express = require('express'),
  fs = require('fs'),
  log4js = require('log4js'),
  nconf = require('nconf'),
  os = require('os'),
  p = require('path');

function Ute(opts) {
  opts = opts || {};
  this.opts = {
    confDir: opts.confDir || 'conf',
    env: opts.env || process.env.UTE_ENV || 'local'
  };

  nconf.file(p.join(this.opts.confDir, this.opts.env + '.json'));
}

Ute.prototype.start = function (handlers) {

  var app = express(),
    cluster2 = new Cluster2({
      port: nconf.get('app:port') || 3000,
      noWorkers: nconf.get('app:workers') || os.cpus().length,
      pids: nconf.get('app:pids')
    }),
    routesFile = p.join(this.opts.confDir, 'routes.json'),
    routes = fs.existsSync(routesFile) ?
      JSON.parse(fs.readFileSync(routesFile).toString()) :
      [];

  // wire routes
  routes.forEach(function (route) {
    var handler = route.path.replace(/\//, '_');
    if (handlers[handler]) {
      app[route.method.toLowerCase()](route.path, handlers[handler]);
    } else {
      console.warn('Unable to wire route (%s) %s due to inexisting handler %s',
        route.method, route.path, handler);
    }
  });

  // start master and workers
  cluster2.listen(function (cb) {
    if (cluster.isMaster) {
      console.log('Starting application %s on port %d', nconf.get('app:name'), nconf.get('app:port'));
      console.log('Master is running on pid %d', process.pid);
    } else {
      console.log('Worker is running on pid %d', process.pid);
    }
    cb(app);
  });

  return app;
};

module.exports = Ute;
