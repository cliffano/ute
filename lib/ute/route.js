var Route = function (opts) {
    this.opts = opts;
};
Route.prototype.set = function (app, routes) {
    var that = this;
    routes.forEach(function (route) {
        app[route.method](route.path, function (req, res) {
            route.cb(req, function (template, layout, locals) {
                locals = locals || {};
                locals.env = that.opts.env;
                locals.uniqueId = that.opts.uniqueId;
                res.render(template, {
                    layout: layout,
                    locals: locals
                });
            });
        });
    });
};

exports.Route = Route;