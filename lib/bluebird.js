var Promise = require('bluebird');

(function(){
  
  var async = {};

  /**
   * @returns promise
   */
  async.each = function each(collection, iterator){
    var iterator = Promise.promisify(iterator)
      , promises = collection.map(function(i){
          return iterator(i);
      });

    return Promise.all(promises);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = async;
  }

})();
