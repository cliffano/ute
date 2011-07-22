var Route = function (opts) {
    this.opts = opts;
};
Route.prototype.set = function (app, routes) {
    var that = this;
    routes.forEach(function (route) {
        app[route.method](route.path, function (req, res, next) {
            route.cb(req, res, next, { env: that.opts.env, uniqueId: that.opts.uniqueId });
        });
    });
};

exports.Route = Route;