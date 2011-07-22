var opts = {
        appPostfix: '-app',
        configFile: 'package.json',
        imagePath: '/images',
        imageDir: process.cwd() + '/public/images/',
        scriptPath: '/scripts',
        scriptDir: './public/scripts/',
        stylePath: '/styles',
        styleDir: './public/styles/',
        encoding: 'utf-8',
        ext: '.html',
        err404: true,
        err500: true,
        env: process.env.NODE_ENV,
        uniqueId: new Date().getMilliseconds()
    },
    express = require('express'),
    log4js = require('log4js')(),
    Config = require('./ute/config').Config,
    Error = require('./ute/error').Error,
    Route = require('./ute/route').Route,
    config = new Config(opts),
    error = new Error(opts),
    route = new Route(opts),
    logger = log4js.getLogger('app');

var Ute = function (_opts) {
    // override default opts with client _opts
    for (var opt in _opts) {
        if (_opts.hasOwnProperty(opt)) {
            opts[opt] = _opts[opt];
        }
    }
    this.conf = config.load();
    log4js.addAppender(log4js.fileAppender(this.conf.app.log.file), this.conf.name + opts.appPostfix);
    logger.setLevel(this.conf.app.log.level);
};
Ute.prototype.start = function (routes) {
    var app = express.createServer(),
        that = this;

    app.configure(function () {
        config.configure(app, that.conf.app.static.scripts, that.conf.app.static.styles);
        error.configure(app);
    });
    error.route(app);
    route.set(app, routes);
    
    logger.info('Starting ' + this.conf.name + ' on port ' + this.conf.app.port + ' in env ' + opts.env);
    app.listen(this.conf.app.port);
};

exports.Ute = Ute;