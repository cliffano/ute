var everyauth = require('everyauth'),
  valentine = require('valentine');

function html(err, result, res, opts) {
  if (err) {
    console.error('HTML handler error: ' + err.message);
    opts.locals.message = err.message;
    res.render('500.html', {
      status: 500,
      layout: opts.layout || true,
      locals: opts.locals
    });
  } else {
    res.render(opts.successPage, {
      status: 200,
      layout: opts.layout || true,
      locals: valentine.extend(opts.locals, result)
    });
  }
}

function json(err, result, res) {
  if (err) {
    console.error('JSON handler error: ' + err.message);
    res.json(JSON.stringify({ status: 'error', message: err.message}), 200);
  } else {
    res.json(JSON.stringify(valentine.extend({ status: 'ok' }, result)), 200);
  }
}

function xml(err, result, res, opts) {
  if (err) {
    console.error('XML handler error: ' + err.message);
    res.send('<result><status>error</status><message>' + err.message + '</message></result>', 200);
  } else {
    res.render(opts.successPage, {
      status: 200,
      layout: opts.layout || true,
      locals: valentine.extend(opts.locals, result)
    }); 
  }
}

function _user(type, data) {
  var user;
  switch (type) {
    case 'twitter': user = {
      username: data.twitter.screen_name,
      name: data.twitter.name,
      avatar: data.twitter.profile_image_url
    };
  }
  return user;
}

function oauth(req, res, opts) {
  if (req.loggedIn) {
    //console.log('Logged in user: ' + require('util').inspect(req.user));
    opts.locals._user = _user(opts.type, req.user);
    if (opts.users && opts.users.indexOf(opts.locals._user.username) === -1) {
      console.warn('Unauthorised user ' + opts.locals._user.username);
      res.render('403.html', {
        status: 403,
        layout: opts.layout || true,
        locals: opts.locals
      });      
    } else {
      opts.successCb();
    }
  } else {
    res.render('login.html', {
      status: 401,
      layout: opts.layout || true,
      locals: opts.locals
    });
  }
}

exports.html = html;
exports.json = json;
exports.xml = xml;
exports.oauth = oauth;