risposta
========

Functions from @caolan/async implemented using promises

## Usage

First load in the async;

```javascript
// this will initilize the bluebird implementation of async
// you can also call .q() to initilize the implementation of
// async using Q
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
  console.log(results); // result is [ 2, [ 'a', 'b' ], 3 ] ] ]
});

```
