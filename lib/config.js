var fs = require('fs'),
  nconf = require('nconf'),
  p = require('path'),
  cache;

function config(opts) {

  if (!cache) {
    opts = opts || {};
    opts.configDir = p.join(process.cwd(), opts.configDir || 'conf');

    console.log('Loading configuration for %s environment', env || 'local');
    nconf.env();
    var env = nconf.get('APP_ENV'),
      defaultsFile = p.join(opts.configDir, 'defaults.json');

    nconf.file(p.join(opts.configDir, env + '.json'));
    if (fs.existsSync(defaultsFile)) {
      nconf.defaults(JSON.parse(fs.readFileSync(defaultsFile)));
    }

    cache = nconf;
  }

  return cache;
}

exports.config = config;