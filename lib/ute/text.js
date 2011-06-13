var fs = require('fs'),
    path = require('path');

var Text = function (lang, dir) {
    this.lang = lang;
    this.dir = dir || 'text';
    this.texts = {};
    var files = fs.readdirSync(this.dir), i;
    for (i in files) {
        if (files.hasOwnProperty(i)) {
            if (files[i].match(/\.json$/)) {
                this.texts[files[i].replace('.json', '')] =
                    JSON.parse(fs.readFileSync(path.join(this.dir, files[i])));
            }
        }
    }
};
Text.prototype.getText = function () {
    var that = this,
        fn = function (key) {
            var parts = key.split('.'), i, ln, node;
            for (i = 0, ln = parts.length; i < ln; i += 1) {
                if (node) {
                    node = node[parts[i]];
                } else {
                    node = that.texts[that.lang][parts[i]];
                }
            }
            return (node === undefined) ? '{' + that.lang + ':' + key + '}' : node;
        };
    return fn;
};

exports.Text = Text;