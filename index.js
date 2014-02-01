var async = require('./lib/async');

// load the Q implementation
module.exports.q = function(){
  return async(require('q'), null, 'denodeify');
}

// load the bluebird implementation
module.exports.bluebird = function(){
  return async(require('bluebird'), 'resolve', 'promisify');
}
