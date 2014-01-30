var should = require('chai').should();

function dummyAsync(item, cb){
  setTimeout(function(){
    return cb(null, item);
  }, Math.random() * 100);
};


describe('async', function(){

  describe('implemented using q', function(){
    var async = require('../index').q();

    it(' .each returns a promise', function(done){
      var p = async.each(['one', 'two', 'three'], dummyAsync);
      p.should.have.property('then');

      p.then(function(results){
        results.should.not.be.empty;
        results.length.should.equal(3);
        done();
      });
    });
  });

  describe('implemented using bluebird', function(){
    var async = require('../index').bluebird();

    it(' .each returns a promisse', function(done){
      var p = async.each(['one', 'two', 'three'], dummyAsync);
      p.should.have.property('then');

      p.then(function(results){
        results.should.not.be.empty;
        results.length.should.equal(3);
        done();
      });
    });
    
  });




});
