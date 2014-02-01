module.exports = function(promise, promisify, all){
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

  async.map = function map(collection, f){
    var f = promisify(f);

    return promise().then(function(){
      return collection.map(function(el){ 
        return f(el);
       });
    }).all();
  }

  return async;
} 
