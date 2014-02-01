var async = require('../index').bluebird()
  , request = require('request');


async.waterfall([
  function(cb){
    // simulute async
    setTimeout(function(){
      cb(null, 'bulkan');
    }, 100);
  },

  function(username, cb){
    var opts = {
      url: 'https://api.github.com/users/' + username,
      headers: {
        'User-Agent': 'request'
      }
    };
    request(opts, function(err, response, body){
      if (err) return cb(err);
      return cb(null, body);
    });
  }
]).then(function(body){
 console.log(body);
});
