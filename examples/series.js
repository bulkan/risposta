var async = require('./index').q();


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
      callback('poo', 3);
    }, 110)
  }
]).then(function(results){
  console.log(results);
}, function(error){
  console.log(error)
});
