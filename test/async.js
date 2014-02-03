var should = require('chai').should();

function dummyAsync(item, cb){
  setTimeout(function(){
    return cb(null, item);
  }, Math.random() * 100);
};

function exp(call_order, x, cb){
  setTimeout(function(){
    call_order.push(x);
    cb(null, x * x);
  }, Math.random() * 10);
};

function getFunctionsObject(call_order){
  return {
    one: function(callback){
      setTimeout(function(){
        call_order.push(1);
        callback(null, 1);
      }, 15);
    },
    two: function(callback){
      setTimeout(function(){
        call_order.push(2);
        callback(null, 2);
      }, 20);
    },
    three: function(callback){
      setTimeout(function(){
        call_order.push(3);
        callback(null, 3,3);
      }, 10);
    }
  }
}


describe('async', function(){

  describe('implemented using q', function(){
    var async = require('../index').q();

    it(' .each returns a promise', function(done){
      var p = async.each(['one', 'two', 'three'], dummyAsync);
      p.should.have.property('then');

      p.then(function(results){
        results.should.not.be.empty;
        results.length.should.equal(3);
      }).finally(done);
    });

    it(' .map', function(done){
      var call_order = []
        , p = async.map([2, 3, 4], exp.bind(this, call_order));

      p.then(function(results){
        results.length.should.equal(3);
        results.should.contain(4);
        results.should.contain(9);
        results.should.contain(16);
      }).finally(done);
    });

    it(' .mapSeries', function(done){
      var call_order = []
        , p = async.mapSeries([2, 3, 4], exp.bind(this, call_order));

      p.then(function(results){
        call_order.should.be.eql([2, 3, 4]);
        results.length.should.equal(3);
        results.should.contain(4);
        results.should.contain(9);
        results.should.contain(16);
      }).finally(done);
    });

    it(' .series', function(done){
      var call_order = [];
      async.series([
        function(callback){
          setTimeout(function(){
            call_order.push(1);
            callback(null, 1);
          }, 25);
        },
        function(callback){
          setTimeout(function(){
            call_order.push(2);
            callback(null, 2);
          }, 50);
        },
        function(callback){
          setTimeout(function(){
            call_order.push(3);
            callback(null, 3,3);
          }, 15);
         }
      ]).then(function(results){
        call_order.should.be.eql([1,2,3]);
        results.length.should.equal(3);
        results.should.eql([1,2, [3,3]]);
      }).finally(done);
    });

    it(' .waterfall', function(done){
      var call_order = [];
      async.waterfall([
        function(callback){
          call_order.push('fn1');
          setTimeout(function(){callback(null, 'one', 'two');}, 0);
        },
        function(arg1, arg2, callback){
          call_order.push('fn2');
          arg1.should.be.equal('one');
          setTimeout(function(){callback(null, arg1, arg2, 'three');}, 25);
        },
        function(arg1, arg2, arg3, callback){
          call_order.push('fn3');
          arg1.should.be.equal('one');
          arg2.should.be.equal('two');
          arg3.should.be.equal('three');
          callback(null, 'four');
        },
        function(arg4, callback){
          call_order.push('fn4');
          callback(null, 'test');
        }
      ]).then(function(results){
        call_order.should.be.eql(['fn1','fn2','fn3','fn4']);
        results.should.be.equal('test');
      }).finally(done);
    });

    it(' .series object', function(done){
      var call_order = [];

      async.series(getFunctionsObject(call_order)).then(function(results){
        results.should.be.eql({
          one: 1,
          two: 2,
          three: [3,3]
        });
        call_order.should.be.eql([1,2,3]);
      }).finally(done);
    })

    it(' .forever', function(done){
      var counter = 0;
      function addOne(callback) {
        counter++;
        if (counter === 50) {
          return callback('too big!');
        }
        setImmediate(function () {
          callback();
        });
      }
      async.forever(addOne).catch(function(err) {
        err.message.should.equal('too big!');
      }).finally(done);
    })

    it(' .parallel', function(done){
      var call_order = [];
      async.parallel([
        function(callback){
          setTimeout(function(){
            call_order.push(1);
            callback(null, 1);
          }, 50);
        },
        function(callback){
          setTimeout(function(){
            call_order.push(2);
            callback(null, 2);
          }, 100);
        },
        function(callback){
          setTimeout(function(){
            call_order.push(3);
            callback(null, 3,3);
          }, 25);
        }
      ]).then(function(results){
        call_order.should.be.eql([3,1,2]);
        results.should.be.eql([1,2,[3,3]]);
      }).finally(done);
    });

    it(' .parallel object', function(done){
      var call_order = [];
      async.parallel(getFunctionsObject(call_order)).then(function(results){
        call_order.should.be.eql([3,1,2]);
        results.should.be.eql({
          one: 1,
          two: 2,
          three: [3,3]
        });
      }).finally(done);
    });

    it(' .filter', function(done){
      function filterIterator(x, callback){
        setTimeout(function(){
          return callback(null, x % 2 == 0);
        }, x*25);
      }
      async.filter([16, 5, 18, 3], filterIterator).then(function(results){
        results.should.be.eql([16, 18]);
      }).finally(done);
    });

    it(' .reduce');
  });

  describe('implemented using bluebird', function(){
    var async = require('../index').bluebird();

    it(' .each returns a promise', function(done){
      var p = async.each(['one', 'two', 'three'], dummyAsync);
      p.should.have.property('then');

      p.then(function(results){
        results.should.not.be.empty;
        results.length.should.equal(3);
      }).finally(done);
    });

    it(' .map', function(done){
      var call_order = []
        , p = async.map([2, 3, 4], exp.bind(this, call_order));

      p.then(function(results){
        results.length.should.equal(3);
        results.should.contain(4);
        results.should.contain(9);
        results.should.contain(16);
      }).finally(done);
    });

    it(' .mapSeries', function(done){
      var call_order = []
        , p = async.mapSeries([2, 3, 4], exp.bind(this, call_order));

      p.then(function(results){
        call_order.should.be.eql([2, 3, 4]);
        results.length.should.equal(3);
        results.should.contain(4);
        results.should.contain(9);
        results.should.contain(16);
      }).finally(done);
    });

    it(' .series', function(done){
      var call_order = [];
      async.series([
        function(callback){
          setTimeout(function(){
            call_order.push(1);
            callback(null, 1);
          }, 25);
        },
        function(callback){
          setTimeout(function(){
            call_order.push(2);
            callback(null, 2);
          }, 50);
        },
        function(callback){
          setTimeout(function(){
            call_order.push(3);
            callback(null, 3,3);
          }, 15);
         }
      ]).then(function(results){
        call_order.should.be.eql([1,2,3]);
        results.length.should.equal(3);
        results.should.eql([1,2, [3,3]]);
      }).finally(done);
    });

    it(' .waterfall', function(done){
      var call_order = [];
      async.waterfall([
        function(callback){
          call_order.push('fn1');
          setTimeout(function(){callback(null, 'one', 'two');}, 0);
        },
        function(arg1, arg2, callback){
          call_order.push('fn2');
          arg1.should.be.equal('one');
          setTimeout(function(){callback(null, arg1, arg2, 'three');}, 25);
        },
        function(arg1, arg2, arg3, callback){
          call_order.push('fn3');
          arg1.should.be.equal('one');
          arg2.should.be.equal('two');
          arg3.should.be.equal('three');
          callback(null, 'four');
        },
        function(arg4, callback){
          call_order.push('fn4');
          callback(null, 'test');
        }
      ]).then(function(results){
        call_order.should.be.eql(['fn1','fn2','fn3','fn4']);
        results.should.be.equal('test');
      }).finally(done);
    });

    it(' .series empty array', function(done){
      async.series([]).then(function(results){
        results.should.be.eql([]);
      }).finally(done);
    });


    it(' .series object', function(done){
      var call_order = [];

      async.series(getFunctionsObject(call_order)).then(function(results){
        results.should.be.eql({
          one: 1,
          two: 2,
          three: [3,3]
        });
        call_order.should.be.eql([1,2,3]);
      }).finally(done);
    })

    it(' .forever', function(done){
      var counter = 0;
      function addOne(callback) {
        counter++;
        if (counter === 50) {
          return callback('too big!');
        }
        setImmediate(function () {
          callback();
        });
      }
      async.forever(addOne).catch(function(err) {
        err.message.should.equal('too big!');
      }).finally(done);
    })

    it(' .parallel', function(done){
      var call_order = [];
      async.parallel([
        function(callback){
          setTimeout(function(){
            call_order.push(1);
            callback(null, 1);
          }, 50);
        },
        function(callback){
          setTimeout(function(){
            call_order.push(2);
            callback(null, 2);
          }, 100);
        },
        function(callback){
          setTimeout(function(){
            call_order.push(3);
            callback(null, 3,3);
          }, 25);
        }
      ]).then(function(results){
        call_order.should.be.eql([3,1,2]);
        results.should.be.eql([1,2,[3,3]]);
      }).finally(done);
    });

    it(' .parallel object', function(done){
      var call_order = [];
      async.parallel(getFunctionsObject(call_order)).then(function(results){
        call_order.should.be.eql([3,1,2]);
        results.should.be.eql({
          one: 1,
          two: 2,
          three: [3,3]
        });
      }).finally(done);
    });

    it(' .filter', function(done){
      function filterIterator(x, callback){
        setTimeout(function(){
          return callback(null, x % 2 == 0);
        }, x*25);
      }
      async.filter([16, 5, 18, 3], filterIterator).then(function(results){
        results.should.be.eql([16, 18]);
      }).finally(done);
    });

    it(' .reduce');
    
  });

});
