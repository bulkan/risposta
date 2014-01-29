var Q = require('q');

(function(){
  
  var async = {};

  /**
   * @returns promise
   */
  async.each = function each(collection, iterator){
    var iterator = Q.denodeify(iterator)
      , promises = collection.map(function(i){
      return iterator(i);
    });

    return Q.all(promises);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = async;
  }

})();
