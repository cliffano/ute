Ute ![http://travis-ci.org/cliffano/ute](https://secure.travis-ci.org/cliffano/ute.png?branch=master)
---

Ute is a common layer on top of Express node web framework.

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
        port: 8888,
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

Place all image files under public/images/, each image is accessible via path /images/imagefile.ext .
Place all JavaScript files under public/scripts/, each script is accessible via path /scripts/scriptfile.js . All scripts are merged, and accessible via path /scripts/appname.js .
Place all CSS files under public/styles/, each style is accessible via path /styles/stylefile.css . All styles are merged and minified, and accessible via path /styles/appname.css .

Specify page not found error 404 page in views/404.html .
Specify unexpected error page in views/500.html .

Start the app:

    node appname.js
  
Or if you have [Bob](https://github.com/cliffano/bob) installed:

    bob start

Colophon
--------

Follow [@cliffano](http://twitter.com/cliffano) on Twitter.