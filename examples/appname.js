var routes = require('./lib/routes').routes,
  Ute = require('ute').Ute,
  ute = new Ute({
    name: 'appname',
    port: 3000,
    routes: routes
  });

ute.run();