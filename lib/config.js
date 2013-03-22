var fs = require('fs'),
  nconf = require('nconf'),
  p = require('path'),
  cache;

function _load(file) {
  if (fs.existsSync(file)) {
    console.log('Loading configuration file %s', file);
    nconf.file({ file: file });    
  } else {
    console.warn('Ignoring configuration file %s, does not exist', file);
  }
}

function config(opts) {

  if (!cache) {
    opts = opts || {};
    opts.configDir = p.join(process.cwd(), opts.configDir || 'conf');

    console.log('Loading configuration for %s environment', env || 'local');
    nconf.env();
    var env = nconf.get('APP_ENV');

    _load(p.join(opts.configDir, env + '.json'));
    _load(p.join(opts.configDir, 'defaults.json'));

    cache = nconf;
  }

  return cache;
}

exports.config = config;