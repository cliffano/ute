var Cluster = require('cluster2'),
  Hapi = require('hapi'),
  os = require('os'),
  p = require('path');

function Ute(opts) {
  opts = opts || {};

  this.opts = {
    name: opts.name,
    host: opts.host || '127.0.0.1',
    port: opts.port || 3000,
    noWorkers: opts.noWorkers || os.cpus().length,
    staticDir: p.join(process.cwd(), opts.staticDir || 'public')
  };

  this.server = new Hapi.Server(this.opts.host, this.opts.port);
}

Ute.prototype.get = function (path, handler) {
  this.route('GET', path, handler);
};
Ute.prototype.head = function (path, handler) {
  this.route('HEAD', path, handler);
};
Ute.prototype.post = function (path, handler) {
  this.route('POST', path, handler);
};
Ute.prototype.put = function (path, handler) {
  this.route('PUT', path, handler);
};
Ute.prototype.delete = function (path, handler) {
  this.route('DELETE', path, handler);
};
Ute.prototype.trace = function (path, handler) {
  this.route('TRACE', path, handler);
};

Ute.prototype.route = function (method, path, handler) {
  this.server.route({
    method: method,
    path: path,
    config: {
      handler: handler
    }
  });
};

Ute.prototype._defaultRoutes = function () {
  // set static files directory
  this.server.route({
    method: 'GET',
    path: '/{path*}',
    handler: { directory: { path: this.opts.staticDir, listing: false } }
  });

  // set error 404 page
  this.server.route({
    method: '*',
    path: '/{path*}',
    handler: function (req) {
      req.reply(Hapi.Error.notFound('The page was not found'));
    }
  });
};

Ute.prototype.start = function () {

  this._defaultRoutes();

  var self = this;
  // cluster2 adapter for hapi server
  this.server.listen = function (port, host, cb) {
    console.log('%s starts listening on %d',
      self.opts.name || 'Application',
      self.opts.port);
    self.server.start();
    cb();
  };

  var c = new Cluster({
    port: 8888,
    noWorkers: 5
  });
  c.listen(function (cb) {
    cb(self.server);
  });
};

module.exports = Ute;