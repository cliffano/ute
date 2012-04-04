var engine = require('./engine'),
  express = require('express');

function Ute(opts) {

  opts = opts || {};
  opts = {
    name: opts.name || 'appname',
    port: opts.port || 3000,
    routes: opts.routes || []
  };

  function run(fn) {
    var app = express.createServer();
    engine.config(app, opts);
    engine.route(app, opts);

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