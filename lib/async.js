/**
 * @param P Object promise implementation library
 * @param promise String Name of function within P that generates promises
 * @param promises String Name of function that converts node style functions
 *  into promises
 */
module.exports = function(P, promise, promisify){

  promise = promise ? P[promise] : P;
  promisify = P[promisify];
  var all = P.all
    , when = P.when
    , async = {};


  /**
   * Run an iterator function for each element of the given array producing an
   * array (when the promise is resolved)
   *
   * @param arr Array an Array to iterate over
   * @param iterator function  Async function to run againts each element of the array
   * @returns promise returns a promise that will be resolved with an array of results
   */
  async.map = function map(collection, f){
    f = promisify(f);

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
    f = promisify(f)
    var currentPromise = promise()
      , promises = arr.map(function(item){
        return currentPromise = currentPromise.then(function(){
          return f(item);
        })
      });
    return all(promises);
  }

  async.series = function series(tasks){
    var currentPromise = promise()
      , promises = [];
    
    if (Array.isArray(tasks)) {
      promises = tasks.map(function(f) {
        return currentPromise = currentPromise.then(function(){
          // passing in result kills task function arguments
          return promisify(f)()
        });
      });

      return all(promises);

    } else {
      // we have an Object ?
      return promise().then(function(){
        // so handle it like async does
        var res = {}
          , currentPromise = promise();

        promises = Object.keys(tasks).map(function(taskName){
          return currentPromise = currentPromise.then(function(){
            return promisify(tasks[taskName])().then(function(result){
              res[taskName] = result;
            });
          });
        });

        return all(promises).then(function(){
          return promise(res);
        });
      });
    }
  }
  
  /**
   * Runs an array of functions in series, each passing their results to the 
   * next in the array.  However, if any of the functions pass an error to
   * the callback, the next function is not executed and the main callback 
   * is immediately called with the error. 
   *
   * @param tasks Array array of task functions
   * @returns a promise thats is resolved when all task functions complete
   */
  async.waterfall = function waterfall(tasks){
    return tasks.reduce(function(prevTaskPromise, task) {
      task = promisify(task);
      return prevTaskPromise.then(function(results){
        if (typeof results === 'string')
            return task(results);
        return task.apply(null, results);
      });
    }, promise()); 
  }

  /**
   *  Runs given function asynchronous function. Will only stop if an error occurs
   */
  async.forever = function forever(f){
    return promisify(f)().then(function() {
      return forever(f);
    }) 
  }

  async.parallel = function parellel(tasks){
    if (Array.isArray(tasks)) {
      var promises = tasks.map(function(f){
        return promisify(f)();
      });
      return all(promises);
    } else {
      return promise().then(function(){
        // so handle it like async does
        var res = {};

        var promises = Object.keys(tasks).map(function(taskName){
          return promisify(tasks[taskName])().then(function(result){
            res[taskName] = result;
          });
        });

        return all(promises).then(function(){
          return res; 
        });
      });
    }
  }

  async.filter = function filter(arr, f){
    return promise().then(function(){
      var res = []
        , promises = arr.map(function(x){
          return promisify(f)(x).then(function(result){
            if (result) res.push(x);
          });
        });

        return all(promises).then(function(){
          return res 
        });
    });
  }

  async.filterSeries = function filterSeries(arr, iterator){
    return promise().then(function(){
      var res = []
        , currentPromise = promise()
        , promises = arr.map(function(x) {
          return currentPromise = currentPromise.then(function(){
            return promisify(iterator)(x).then(function(result){
              if (result) res.push(x);
            });
          });
        });
      return all(promises).then(function(){ return res });
    })
  }


  async.reject = function reject(arr, iterator){
    return promise().then(function(){
      var res = []
        , currentPromise = promise()
        , promises = arr.map(function(x) {
          return currentPromise = currentPromise.then(function(){
            return promisify(iterator)(x).then(function(result){
              if (!result) res.push(x);
            });
          });
        });
      return all(promises).then(function(){ return res });
    })
  }

  async.rejectSeries = function rejectSeries(arr, iterator){
    return promise().then(function(){
      var res = []
        , currentPromise = promise()
        , promises = arr.map(function(x) {
          return currentPromise = currentPromise.then(function(){
            return promisify(iterator)(x).then(function(result){
              if (!result) res.push(x);
            });
          });
        });
      return all(promises).then(function(){ return res });
    })
  };

  async.reduce = function reduce(arr, initial, f){
    var currentPromise = promise(initial);
    arr.map(function(x){
      return currentPromise = currentPromise.then(function(memo){
        return promisify(f)(memo, x);
      });
    });
    return currentPromise;
  };

  async.reduceRight = function(arr, initial, f){
    var currentPromise = promise(initial);
    arr.reverse().map(function(x){
      return currentPromise = currentPromise.then(function(memo){
        return promisify(f)(memo, x);
      });
    });
    return currentPromise;
  };

  async.detect = function detect(arr, f){
    var promises = arr.map(function(x){
      return promisify(f)(x);
    });

    return all(promises).then(function(results){
      return arr.filter(function (el,i) { return results[i] }).shift() 
    });
  }

  async.detectSeries = function detectSeries(arr, f){
    var currentPromise = promise();
    var promises = arr.map(function(x){
      return currentPromise = currentPromise.then(function(){
        return promisify(f)(x);
      });
    });

    return all(promises).then(function(results){
      return arr.filter(function (el,i) { return results[i] }).shift() 
    });
  }

  async.sortBy = function sortBy(arr, f) {
    var promises = arr.map(function(x) { 
      return promisify(f)(x).then(function(result){
        return {value: x, criteria: result};
      });
    });

    return all(promises).then(function (results) {
      return results.sort(function (left, right) {
        var a = left.criteria, b = right.criteria;
        return a < b ? -1 : a > b ? 1 : 0;
      }).map(function(x){
        return x.value;
      });
    })
  } 

  async.some = function some(arr, f) {
    function _f(x, cb){
      f(x, function(result){
        cb(null, result);
      });
    }

    var promises = arr.map(function(x){
      return promisify(_f)(x);
    });

    return all(promises).then(function(results) {
      return results.some(function(x) { return x });
    })
  }

  async.every = function every(arr, f) {
    function _f(x, cb){
      f(x, function(result){
        cb(null, result);
      });
    }

    var promises = arr.map(function(x){
      return promisify(_f)(x);
    });

    return all(promises).then(function(results) {
      return results.every(function(x) { return x });
    })
  }

  async.concat = function concat(arr, f){
    return promise().then(function(){
      var res = []
        , promises = arr.map(function(x){
          return promisify(f)(x).then(function(result){
            res = res.concat(result);
          });
        });
      return all(promises).then(function(results){
        return res;
      });
    });
  }

  async.concatSeries = function concatSeries(arr, f){
    return promise().then(function(){
      var res = []
        , currentPromise = promise()
        , promises = arr.map(function(x){
            return currentPromise = currentPromise.then(function(){
              return promisify(f)(x).then(function(result){
                res = res.concat(result);
              });
            });
          });
      return all(promises).then(function(results){
        return res;
      });
    });
  }
  
  async.whilst = function whilst(test, fn){
    if (!test()) return promise();
    return promisify(fn)().then(function(){
      return async.whilst(test, fn);
    });
  }

  async.doWhilst = function doWhilst(fn, test){
    return promisify(fn)().then(function(){
      if (!test()) return promise();
      return async.doWhilst(fn, test);
    });
  }

  async.until = function until(test, fn){
    if (test()) return promise();
    return promisify(fn)().then(function(){
      return async.until(test, fn);
    });
  }

  async.doUntil = function doUntil(fn, test){
    return promisify(fn)().then(function(){
      if (test()) return promise();
      return async.doUntil(fn, test);
    });
  }

  async.applyEach = function applyEach(funcs){
    var args = Array.prototype.slice.call(arguments, 1);
    var promises = funcs.map(function(f) {
      return promisify(f).apply(undefined, args);
    });
    return all(promises);
  }

  async.applyEachSeries =  async.applyEach;

  async.compose = function compose(){
    var fns = Array.prototype.slice.call(arguments).reverse();

    return function() {
      var that = this;
      var args = Array.prototype.slice.call(arguments);
      return async.reduce(fns, args, function(newargs, fn, cb) {
        fn.apply(that, newargs.concat([function () {
          var err = arguments[0];
          var nextargs = Array.prototype.slice.call(arguments, 1);
          cb(err, nextargs);
        }]));
      }).then(function(results){
        return results.pop();
      });
    }
  }

  async.times = function times(n, iterator){
    var promises = []
      , f = promisify(iterator);

    for (var i=0; i<n; i++){
      promises.push(f(i));
    }
    return all(promises);
  }

  async.timesSeries = function timesSeires(n, iterator){
    var counter = [];
    for (var i = 0; i < n; i++) {
      counter.push(i);
    }
    return async.mapSeries(counter, iterator);
  }

  return async;
}
