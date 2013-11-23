var async = require('async'),
  cluster = require('cluster'),
  Cluster2 = require('cluster2'),
  express = require('express'),
  fs = require('fs'),
  log4js = require('log4js'),
  nconf = require('nconf'),
  os = require('os'),
  p = require('path'),
  util = require('util');

/**
 * class Ute
 */
function Ute(opts) {
  opts = opts || {};
  this.opts = {
    confDir: opts.confDir || 'conf',
    env: opts.env || process.env.UTE_ENV || 'local',
    staticDir: opts.staticDir || 'public'
  };

  nconf.file(p.join(this.opts.confDir, this.opts.env + '.json'));
}

/**
 * Start application with:
 * - routes wiring from opts.confDir/routes.json mapped to available handlers, default: conf/routes.json
 * - clustering based on conf app.workers, default: the number of CPUs
 * - execution of pre and post tasks in series, only executed on master, not workers
 *
 * @param {Array} handlers: handler functions with reques, response, next arguments
 * @param {Object} opts: optional
 * - preTasks: task functions to execute prior to starting the master
 * - postTasks: task functions to execute after starting the master
 */
Ute.prototype.start = function (handlers, opts) {
  opts = opts || {};
  opts.preTasks = opts.preTasks || [];
  opts.postTasks = opts.postTasks || [];

  var app = express(),
    cluster2 = new Cluster2({
      port: nconf.get('app:port') || 3000,
      noWorkers: nconf.get('app:workers') || os.cpus().length,
      pids: nconf.get('app:pidsDir')
    }),
    routesFile = p.join(this.opts.confDir, 'routes.json'),
    routes = fs.existsSync(routesFile) ?
      JSON.parse(fs.readFileSync(routesFile).toString()) :
      [],
    self = this;

  // wire routes
  routes.forEach(function (route) {
    if (handlers[route.handler]) {
      app[route.method.toLowerCase()](route.path, handlers[route.handler]);
    } else {
      self.stop(new Error(util.format('Unable to wire route (%s) %s due to inexisting handler %s',
        route.method, route.path, route.handler)));
    }
  });

  // setup static files
  app.use(express.static(this.opts.staticDir));

  if (cluster.isMaster) {

    // start master with pre and post tasks
    async.series(opts.preTasks, function (err, results) {
      if (err) {
        self.stop(err);
      } else {
        cluster2.listen(function (cb) {
          console.log('Starting application %s on port %d', nconf.get('app:name'), nconf.get('app:port'));
          console.log('Master is running on pid %d', process.pid);
          async.series(opts.postTasks, function (err, results) {
            if (err) {
              self.stop(err);
            } else {
              cb(app);
            }
          });
        });
      }
    });

  } else {

    // start worker(s)
    cluster2.listen(function (cb) {
      console.log('Worker is running on pid %d', process.pid);
      cb(app);
    });

  }

  return app;
};

/**
 * Stop application with exit code:
 * - 1 when error is provided
 * - 0 when there is no error
 *
 * @param {Object} err: error object
 */
Ute.prototype.stop = function (err) {
  var exitCode;
  if (err) {
    exitCode = 1;
    console.error('Exiting application %s with exit code %d due to error:\n%s', nconf.get('app:name'), exitCode, err.message);
  } else {
    exitCode = 0;
    console.error('Shutting down application %s', nconf.get('app:name'));
  }
  process.exit(exitCode);
};

module.exports = Ute;
