var Route = function (opts) {
    this.opts = opts;
};
Route.prototype.set = function (app, routes) {
    var that = this;
    routes.forEach(function (route) {
        app[route.method](route.path, function (req, res) {
            route.cb(req, res, { env: that.opts.env, uniqueId: that.opts.uniqueId });
        });
    });
};

exports.Route = Route;