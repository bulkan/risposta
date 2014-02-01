module.exports = function(promisify, all){
  var async = {};

  /**
   * @returns promise
   */
  async.each = function each(collection, iterator){
    var iterator = promisify(iterator)
      , promises = collection.map(function(i){
          return iterator(i);
      });

    return all(promises);
  }

  return async;
} 
