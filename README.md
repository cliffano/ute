Ute [![http://travis-ci.org/cliffano/ute](https://secure.travis-ci.org/cliffano/ute.png?branch=master)](http://travis-ci.org/cliffano/ute)
---

Ute is a common layer on top of Express node web framework.

Installation
------------

    npm install ute

or specify it as a dependency in package.json file:

    "dependencies": {
      "ute": "0.0.x"
    }

Usage
-----

Create the following directory structure and files:

    appname.js
    lib/routes.js
    public/images/
    public/scripts/
    public/styles/
    views/layout.html
    views/index.html
    views/404.html
    views/500.html

Set up Ute in appname.js :

    var routes = require('./lib/routes').routes,
      Ute = require('ute').Ute,
      ute = new Ute({
        name: 'appname',
        port: 3000,
        routes: routes
      });

    ute.run();

Specify the routes in lib/routes.js :

    var routes = [
      {
        method: 'get',
        path: '/',
        cb: function (req, res, next, locals) {
          res.render('index.html', {
            layout: true,
            locals: locals
          });
        }
      }
    ];

    exports.routes = routes;

Static resources:

* place all image files at public/images/, each image will be accessible at http://host:port/images/imagefile.ext
* place all JavaScript files at public/scripts/, each script will be accessible at http://host:port/scripts/scriptfile.js
* merged version of all scripts will be accessible at http://host:port/scripts/appname.js
* place all CSS files at public/styles/, each style will be accessible at http://host:port/styles/stylefile.css
* merged and minified version of all styles will be accessible at http://host:port/styles/appname.css

Error pages:

* specify page not found error in views/404.html
* and unexpected error in views/500.html

Start the app:

    node appname.js

and it's accessible at http://localhost:3000

For custom app config / set up, you can pass a hook function which will be executed after Ute's built-in set up and before the app starts listening on the specified port:

    ute.run(function (app, express) {
      ...
    }); 

Colophon
--------

Follow [@cliffano](http://twitter.com/cliffano) on Twitter.
