<img align="right" src="https://raw.github.com/cliffano/ute/master/avatar.jpg" alt="Avatar"/>

[![Build Status](https://secure.travis-ci.org/cliffano/ute.png?branch=master)](http://travis-ci.org/cliffano/ute)
[![Dependencies Status](https://david-dm.org/cliffano/ute.png)](http://david-dm.org/cliffano/ute)
[![Coverage Status](https://coveralls.io/repos/cliffano/ute/badge.png?branch=master)](https://coveralls.io/r/cliffano/ute?branch=master)
[![Published Version](https://badge.fury.io/js/ute.png)](http://badge.fury.io/js/ute)
<br/>
[![npm Badge](https://nodei.co/npm/ute.png)](http://npmjs.org/package/ute)

Ute
---

Ute is an unframework for simple node.js web application.

This is handy if you want to run your web app by specifying route + environment configuration files and handler functions, with less repetitive boilerplate code.

Under the hood, Ute uses Express, EJS (with Partials), and nconf.

Installation
------------

    npm install ute

or as a dependency in package.json file:

    "dependencies": {
      "ute": "x.y.z"
    }

Usage
-----

Specify handler functions:

    function homeCb(req, res) {
      res.render('home.html', {
        layout: 'mylayout',
        locals: {
          name: 'Bob'
        }
      });
    }

    function dataCb(req, res) {
      res.json({ foo: 'bar' });
    }

Create a Ute instance and call start:

    var Ute = require('ute');
    var ute = new Ute();

    var handlers = { home: homeCb, data: dataCb }

    ute.start(handlers);

Place mylayout.html and home.html under views directory:

mylayout.html

    <html>
    <head><title>My Site</title></head>
    <body>
      <%- body %>
    </body>
    </html>

home.html

    Hello <%= name %>!

Configuration
-------------

Set application name and port in conf/<env>.json:

    {
      "app": {
        "name": "myapp",
        "port": 9000
      }
    }

Set routes path and handler mappings in conf/routes.json:

    [
      { "method": "GET", "path": "/", "handler": "home" },
      { "method": "POST", "path": "/data", "handler": "data" }
    ]