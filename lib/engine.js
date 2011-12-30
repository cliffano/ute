var _ = require('underscore'),
  assetManager = require('connect-assetmanager'),
  assetHandlers = require('connect-assetmanager-handlers'),
  ejs = require('ejs'),
  express = require('express'),
  fs = require('fs');

function _NotFound(message) {
  Error.call(message);
}

// configure template engine, static resources, error handler
function config(app, opts) {
  
  // TODO: recursive asset file handling
  function isAsset(file) {
    return !file.match(/^\./);
  }

  app.configure(function () {

    // use ejs as default template engine
    app.register('.html', ejs);

    // merged javascript and css should take precedence over individual static resources
    app.use(assetManager({
      'js': {
        'route': new RegExp('\\/scripts\\/' + opts.name + '\\.js'),
        'path': './public/scripts/',
        'dataType': 'javascript',
        'files': _.select(fs.readdirSync('./public/scripts/'), isAsset)
      },
      'css': {
        'route': new RegExp('\\/styles\\/' + opts.name + '\\.css'),
        'path': './public/styles/',
        'dataType': 'css',
        'files': _.select(fs.readdirSync('./public/styles/'), isAsset),
        'preManipulate': {
          'MSIE': [
            assetHandlers.yuiCssOptimize
          ],
          '^': [
            assetHandlers.yuiCssOptimize
          ]
        }
      }
    }));

    // individual static resources
    // use ['static'] instead of .static to satisfy jshint
    // (ok, ok, I know not everyone is a fan of JavaScript linters)
    app.use('/images', express['static']('./public/images/'));
    app.use('/scripts', express['static']('./public/scripts/'));
    app.use('/styles', express['static']('./public/styles/'));
  });

  // error 404 and 500
  app.error(function (err, req, res, next) {
    function render(status) {
      res.render(status + '.html', {
        locals: {},
        status: status
      });
    }
    if (err instanceof _NotFound) {
      render(404);
    } else {
      render(500);
    }
  });
  app.use(express.errorHandler());
}

// set application routes and error routes
// opts.routes = [
//   method: 'get',
//   path: '/about',
//   cb: function () { ... }
// ];
function route(app, opts) {
  opts.routes.forEach(function (route) {
    app[route.method](route.path, function (req, res, next) {
      route.cb(req, res, next, {});
    });
  });

  // error routes should be set last as a catch all
  app.get('/500', function (req, res, next) {
    throw new Error('Unexpected error');
  });
  app.get('/*', function (req, res, next) {
    throw new _NotFound();
  });
}

exports.config = config;
exports.route = route;