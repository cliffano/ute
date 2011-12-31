var engine = require('./engine'),
  express = require('express');

function Ute(opts) {

  opts = opts || {};
  opts = {
    name: opts.name || 'appname',
    port: opts.port || 3000,
    routes: opts.routes || []
  };

  function run() {
    var app = express.createServer();
    engine.config(app, opts);
    engine.route(app, opts);
    
    // start the app
    console.log('Starting application ' + opts.name + ' on port ' + opts.port + ' in env ' + process.env.NODE_ENV);
    app.listen(opts.port);
  }
    
  return {
    run: run
  };
}

exports.Ute = Ute;