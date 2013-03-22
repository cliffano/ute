/*jshint es5: true */
var config = require('./config'),
  server = require('./server');

exports.get = server.get;
exports.head = server.head;
exports.post = server.post;
exports.put = server.put;
exports.delete = server.delete;
exports.trace = server.trace;
exports.route = server.route;
exports.start = server.start;
exports.config = config.config;