risposta
========

Functions from [caolan/async](github.com/caolan/async) implemented using promises. 

_risposta_ uses the popular Promise implementation from [Q](github.com/kriskowal/q)
and the new [faster](http://spion.github.io/posts/why-i-am-switching-to-promises.html) 
Promise library [bluebird](https://github.com/petkaantonov/bluebird).

Most of the code is based off this [gist](https://gist.github.com/wavded/6116786)
by @wavdad though _risposta_ is on feature parity with async.js. For example the 
implemenation of `async.series` & `async.parallel` by @wavdad does not support
the ability to pass in a object containing task functions as properties.

    npm install risposta

## Usage

First load in the async;

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

**risposta** : Italian - _[Noun]_ answer, reply, response 
