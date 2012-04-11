function html(err, res, locals, successCb) {
  if (err) {
    // TODO: make error passing consistent
    locals.message = err.message;
    res.render('500.html', {
      status: 500,
      layout: true,
      locals: locals
    });
  } else {
    successCb();
  }
}

function json(err, res, successCb) {
  if (err) {
    console.error('Error: ' + err.message);
    res.json(JSON.stringify({ status: 'error', message: err.message}), 500);
  } else {
    successCb();
  }
}

exports.html = html;
exports.json = json;