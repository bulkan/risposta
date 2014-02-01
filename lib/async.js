module.exports = function(promise, promisify, all){
  var async = {};

  /**
   * Run an iterator function for each element of the given array producing an
   * array (when the promise is resolved)
   *
   * @param arr Array an Array to iterate over
   * @param iterator function  Async function to run againts each element of the array
   * @returns promise returns a promise that will be resolved with an array of results
   */
  async.map = function map(collection, f){
    var f = promisify(f);

    return promise().then(function(){
      return collection.map(function(el){ 
        return f(el);
       });
    }).all();
  }

  /**
   * Run an iterator function for each element of the given array. 
   * In the original async this function wont ensure the order but using of
   * promises ensures that the results are ordered.
   *
   * @param arr Array an Array to iterate over
   * @param iterator function  Async function to run againts each element of the array
   * @returns promise returns a promise that will be resolved with an array of results
   */
  async.each = async.map;

  /**
   * Just like each but ensures that the iterator is applied to the next 
   * element in the array after the previous finishes
   *
   * @param arr Array an Array to iterate over
   * @param iterator 
   * @return promise when all iterator promises are complete
   */
  async.eachSeries = async.mapSeries;

  /**
   * Just like map but ensures that the iterator is applied to the next 
   * element in the array after the previous finishes
   *
   * @param arr Array an Array to iterate over
   * @param iterator 
   * @return promise when all iterator promises are complete
   */
  async.mapSeries = function mapSeries(arr, f){
    var currentPromise = promise()
      , f = promisify(f)
      , promises = arr.map(function(item){
        return currentPromise = currentPromise.then(function(){
          return f(item);
        })
      });
    return all(promises);
  }

  return async;
} 
