var fs = require('fs'),
    path = require('path');

var Fn = function (opts) {
    this.opts = opts;
    var that = this, textFileNames;
    
    // load text
    this.text = {};
    textFileNames = fs.readdirSync(this.opts.textDir);
    textFileNames.forEach(function (fileName) {
        var file, lang;
        if (fileName.match(/^[a-z\-]+\.json$/)) {
            file = fs.readFileSync(path.join(that.opts.textDir, fileName));
            lang = fileName.replace('.json', '');
            that.text[lang] = {};
            that.text[lang] = (JSON.parse(file));
        }
    });
};
Fn.prototype.getFunctions = function () {
    var that = this,
        lang = 'en';
    function _text(key) {
        var props = key.split('.'),
            value = that.text[lang],
            i;
        if (value === undefined) {
            value = '{[' + lang + ']' + key + ':lang-undefined}';
        } else {
            for (i = 0, ln = props.length; i < ln; i += 1) {
                value = value[props[i]];
                if (value === undefined) {
                    value = '{[' + lang + ']' + key + ':key-undefined}';
                    break;
                }
            }
        }
        return value;
    }
    return {
        text: _text
    };
};

exports.Fn = Fn;