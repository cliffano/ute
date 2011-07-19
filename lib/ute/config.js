var _ = require('underscore'),
    assetManager = require('connect-assetmanager'),
    assetHandler = require('connect-assetmanager-handlers'),
    express = require('express'),
    fs = require('fs'),
    ejs = require('ejs');

var Config = function (opts) {
    this.opts = opts;
};
Config.prototype.load = function () {
    this.conf = JSON.parse(fs.readFileSync(this.opts.configFile, this.opts.encoding));
    return this.conf;
};
Config.prototype._assetManagerGroups = function (scriptFiles, styleFiles) {
    return {
        'js': {
            'route': new RegExp('\\/scripts\\/' + this.conf.name + '\\.js'),
            'path': this.opts.scriptDir,
            'dataType': 'javascript',
            'files': scriptFiles
        },
        'css': {
            'route': new RegExp('\\/styles\\/' + this.conf.name + '\\.css'),
            'path': this.opts.styleDir,
            'dataType': 'css',
            'files': styleFiles,
            'preManipulate': {
                'MSIE': [
                    assetHandler.yuiCssOptimize
                ],
                '^': [
                    assetHandler.yuiCssOptimize
                ]
            }
        }
    }
};
Config.prototype.configure = function (app, scriptFiles, styleFiles) {
    var isFile = function (file) {
            return !file.match(/^\./);
        };
    scriptFiles = scriptFiles || _.select(fs.readdirSync(this.opts.scriptDir), isFile);
    styleFiles = styleFiles || _.select(fs.readdirSync(this.opts.styleDir), isFile);
    app.register(this.opts.ext, ejs);
    app.use(assetManager(this._assetManagerGroups(scriptFiles, styleFiles)));
    app.use(this.opts.imagePath, express.static(this.opts.imageDir));
};

exports.Config = Config;