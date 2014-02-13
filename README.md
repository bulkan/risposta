risposta
========

Functions from [caolan/async](github.com/caolan/async) implemented using promises. 

Internally  _risposta_ uses the popular Promise implementation [Q](github.com/kriskowal/q)
and the new [faster](http://spion.github.io/posts/why-i-am-switching-to-promises.html) 
Promise library [bluebird](https://github.com/petkaantonov/bluebird).

The inital code for _risposta_ is based off this [gist](https://gist.github.com/wavded/6116786)
by @wavdad. _risposta_ is feature complete with async.js. For example the 
implemenation of `async.series` & `async.parallel` by @wavdad does not support
the ability to pass in a object containing task functions as properties. This meas that
you can easily replace async with _risposta_.

The tests for _risposta_ is actually the [nodeunit](https://github.com/caolan/async/blob/master/test/test-async.js)
tests from async converted to Mocha and promisified.

## Usage

Install it via;

    npm install risposta


```javascript
/** This will initilize the bluebird implementation of async
* you can also call .q() to initilize the implementation of
* async using Q
*/

var async = require('risposta').bluebird();
```

### async.series

```javascript
async.series([
  function(callback){
    setTimeout(function(){
      callback(null, 2);
    }, 100);
  },

  function(callback){
    setTimeout(function(){
      callback(null, 'a', 'b');
    }, 50)
  },

  function(callback){
    setTimeout(function(){
      callback(null, 3);
    }, 110)
  }
]).then(function(results){
  console.log(results); 
  // result is [ 2, [ 'a', 'b' ], 3 ] ] ]
});

```

Most of the examples in the README.md of [async](https://github.com/caolan/async/blob/master/README.md)
is supported by _risposta_. Just keep in mind that there is no optional callback you always get a promise.

For example, the example for [async.times](https://github.com/caolan/async/blob/master/README.md#times) is done like so;

```javascript
// Pretend this is some complicated async factory
var createUser = function(id, callback) {
  callback(null, {
    id: 'user' + id
  })
}
// generate 5 users
async.times(5, function(n, next){
  createUser(n, function(err, user) {
    next(err, user)
  })
}).then(function(users) {
  // we should now have 5 users
});
```

**risposta** : Italian - _[Noun]_ answer, reply, response 
