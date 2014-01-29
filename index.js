var Q = require('q');

/**
 * @returns promise
 */
module.exports.each = function each(collection, iterator){
  var iterator = Q.denodeify(iterator)
    , promises = collection.map(function(i){
    return iterator(i);
  });

  return Q.all(promises);
}
