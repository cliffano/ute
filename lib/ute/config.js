var assetManager = require('connect-assetmanager'),
    assetHandler = require('connect-assetmanager-handlers'),
    fs = require('fs'),
    ejs = require('ejs');

var Config = function (encoding) {
    this.encoding;
};
Config.prototype.load = function (file) {
    this.conf = JSON.parse(fs.readFileSync(file, this.encoding));
    return this.conf;
};
Config.prototype._assetManagerGroups = function (scriptDir, scriptFiles, styleDir, styleFiles) {
    return {
        'js': {
            'route': /\/scripts\/pranala\.js/,
            'path': scriptDir,
            'dataType': 'javascript',
            'files': scriptFiles
        },
        'css': {
            'route': /\/styles\/pranala\.css/,
            'path': styleDir,
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
Config.prototype.configure = function (app, scriptDir, scriptFiles, styleDir, styleFiles) {
    app.register('.html', ejs);
    app.use(assetManager(this._assetManagerGroups(scriptDir, scriptFiles, styleDir, styleFiles)));
};

exports.Config = Config;