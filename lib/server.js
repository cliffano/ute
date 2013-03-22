/*jshint es5: true */
var Cluster = require('cluster2'),
  Hapi = require('hapi'),
  os = require('os'),
  p = require('path'),
  routes = [];

function get(path, handler) {
  routes.push({ method: 'GET', path: path, config: { handler: handler }});
}
function head(path, handler) {
  routes.push({ method: 'HEAD', path: path, config: { handler: handler }});
}
function post(path, handler) {
  routes.push({ method: 'POST', path: path, config: { handler: handler }});
}
function put(path, handler) {
  routes.push({ method: 'PUT', path: path, config: { handler: handler }});
}
function _delete(path, handler) {
  routes.push({ method: 'DELETE', path: path, config: { handler: handler }});
}
function trace(path, handler) {
  routes.push({ method: 'TRACE', path: path, config: { handler: handler }});
}

function route(method, path, config) {
  this.routes.push({ method: method, path: path, config: config });
}

function start(opts) {
  
  opts = opts || {};
  opts = {
    name: opts.name,
    host: opts.host || '127.0.0.1',
    port: opts.port || 3000,
    numWorkers: opts.numWorkers || os.cpus().length,
    staticDir: p.join(process.cwd(), opts.staticDir || 'public')
  };

  var server = new Hapi.Server(opts.host, opts.port),
    cluster = new Cluster({ port: opts.port, noWorkers: opts.numWorkers });

  // static files directory
  routes.push({ method: 'GET', path: '/{path*}', config: { handler: { directory: { path: opts.staticDir, listing: false }}}});
  // TODO: default 404 and 500/503 error pages

  routes.forEach(function (route) {
    server.route(route);
  });  

  // cluster2 adapter for hapi server
  server.listen = function (port, host, cb) {
    server.start();
    cb();
  };
  cluster.listen(function (cb) {
    cb(server);
  });
}

exports.get = get;
exports.head = head;
exports.post = post;
exports.put = put;
exports.delete = _delete;
exports.trace = trace;
exports.route = route;
exports.start = start;