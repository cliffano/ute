var routes = [
  {
    method: 'get',
    path: '/',
    cb: function (req, res, next, locals) {
      res.render('index.html', {
        layout: true,
        locals: locals
      });
    }
  }
];

exports.routes = routes;