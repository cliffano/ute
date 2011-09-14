var Route = function (opts, fn) {
    this.opts = opts;
    this.fn = fn;
};
Route.prototype.set = function (app, routes) {
    var that = this;
    routes.forEach(function (route) {
        app[route.method](route.path, function (req, res, next) {
            route.cb(req, res, next, { env: that.opts.env, fn: that.fn, uniqueId: that.opts.uniqueId });
        });
    });
};

exports.Route = Route;