
module.exports.q = function(){
  var Q= require('q');
  return require('./lib/async')(Q.denodeify, Q.all);
}

module.exports.bluebird = function(){
  var Promise = require('bluebird');
  return require('./lib/async')(Promise.promisify, Promise.all);
}
