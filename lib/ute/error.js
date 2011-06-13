var express = require('express');

function NotFound(message) {
    this.name = 'NotFound';
    Error.call(this, message);
    //Error.captureStackTrace(this, arguments.callee);
}
//NotFound.prototype.__proto__ = Error.prototype;
    
var Error = function () {
};
Error.prototype.configure = function (app) {
    app.error(function (err, req, res, next) {
        var render = function (status) {
            res.render(status + '.html', {
                locals: {
                    page: status,
                    session: { lang: 'en' }
                },
                status: status
            });
        }
        if (err instanceof NotFound) {
            render(404);
        } else {
            render(500);
        }
    });
    app.use(express.errorHandler());
};
Error.prototype.route = function (app) {
    app.get('/500', function(req, res) {
        throw new Error('Unexpected error');
    });
    app.get('/*', function(req, res) {
        throw new NotFound;
    });
};

exports.Error = Error;