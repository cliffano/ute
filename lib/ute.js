var express = require('express'),
    log4js = require('log4js')(),
    Config = require('./ute/config').Config,
    Error = require('./ute/error').Error,
    Route = require('./ute/route').Route,
    Text = require('./ute/text').Text,
    env = process.env.NODE_ENV,
    logger = log4js.getLogger('app');

var Ute = function () {
    this.config = new Config('utf-8');
    this.conf = this.config.load('package.json');
    this.error = new Error();
    this.text = new Text(this.conf.app.lang.default, this.conf.app.lang.dir);
    log4js.addAppender(log4js.fileAppender(this.conf.app.log.file), this.conf.name + '-app');
    logger.setLevel(this.conf.app.log.level);
};
Ute.prototype.start = function () {
    var app = express.createServer(),
        that = this;

    app.configure(function () {
        that.config.configure(app, './public/scripts/', ['jquery-min-1.4.2.js', 'json2.js', 'global.js'], './public/styles/', ['grids-min-2.8.1.css', 'global.css']);
        that.error.configure(app, that.text);
    });
    this.error.route(app);
    
    logger.info('Starting ' + this.conf.name + ' on port ' + this.conf.app.port + ' in env ' + env);
    app.listen(this.conf.app.port);
};

exports.Ute = Ute;