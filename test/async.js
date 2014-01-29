var async = require('../index').q()
  , should = require('chai').should();

describe('async', function(){
  it(' .each returns a promise', function(done){

    function dummyAsync(item, cb){
      setTimeout(function(){
        return cb(null, item);
      }, Math.random() * 100);
    };

    var p = async.each(['one', 'two', 'three'], dummyAsync);
    p.should.have.property('then');

    p.then(function(results){
      results.should.not.be.empty;
      results.length.should.equal(3);
      done();
    })
    
  });

});
