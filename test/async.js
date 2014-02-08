var should = require('chai').should();

function dummyAsync(item, cb){
  setTimeout(function(){
    return cb(null, item);
  }, Math.random() * 2);
};

function exp(call_order, x, cb){
  setTimeout(function(){
    call_order.push(x);
    cb(null, x * x);
  }, Math.random() * 10);
};

function filterIterator(call_order, x, callback){
  setTimeout(function(){
    call_order.push(x);
    return callback(null, x % 2 == 0);
  }, x*2);
}

function getFunctionsObject(call_order){
  return {
    one: function(callback){
      setTimeout(function(){
        call_order.push(1);
        callback(null, 1);
      }, 3);
    },
    two: function(callback){
      setTimeout(function(){
        call_order.push(2);
        callback(null, 2);
      }, 6);
    },
    three: function(callback){
      setTimeout(function(){
        call_order.push(3);
        callback(null, 3,3);
      }, 1);
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
          }, 3);
        },
        function(callback){
          setTimeout(function(){
            call_order.push(2);
            callback(null, 2);
          }, 5);
        },
        function(callback){
          setTimeout(function(){
            call_order.push(3);
            callback(null, 3,3);
          }, 2);
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
          }, 3);
        },
        function(callback){
          setTimeout(function(){
            call_order.push(2);
            callback(null, 2);
          }, 5);
        },
        function(callback){
          setTimeout(function(){
            call_order.push(3);
            callback(null, 3,3);
          }, 1);
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

    describe(' .filter', function(){
      var results
        , call_order = []
        , arr = [16, 5, 18, 3];

      before(function(done){
        async.filter(arr, filterIterator.bind(this, call_order)).then(function(_results){
          results = _results;
        }).finally(done);
      })

      it(' results are correct', function(done){
        results.should.be.eql([16, 18]);
        done();
      });

      it(' original array is untouched', function(done){
        arr.should.be.eql([16, 5, 18, 3]);
        done();
      });
    });

    it(' .filterSeries', function(done){
      var call_order = [];
      async.filterSeries([16, 3,1,2], filterIterator.bind(this, call_order)).then(function(results){
        results.should.be.eql([16, 2]);
        call_order.should.be.eql([16, 3, 1, 2]);
      }).finally(done);
    });

    it(' .reject', function(done){
      var call_order = [];
      async.filterSeries([16, 3,1,2], filterIterator.bind(this, call_order)).then(function(results){
        results.should.be.eql([3, 1]);
        call_order.should.be.eql([16, 3, 1, 2]);
      }).finally(done);
    });

    it(' .filterSeries', function(done){
      var call_order = [];
      async.rejectSeries([16, 3,1,2], filterIterator.bind(this, call_order)).then(function(results){
        results.should.be.eql([3, 1]);
        call_order.should.be.eql([16, 3, 1, 2]);
      }).finally(done);
    });

    it(' .reduce', function(done){
      var call_order = [];
      async.reduce([1,2,3], 0, function(a, x, callback){
        call_order.push(x);
        callback(null, a + x);
      }).then(function(result){
        result.should.equal(6);
        call_order.should.eql([1,2,3]);
      }).finally(done);
    });

    it(' .reduce async with non-reference memo', function(done){
      async.reduce([1,3,2], 0, function(a, x, callback){
          setTimeout(function(){
            callback(null, a + x);
          }, Math.random()*2);
      }).then(function(result){
        result.should.equal(6);
      }).finally(done);
    });

    it(' .reduceRight', function(done){
      var call_order = [];
      var a = [1,2,3];

      async.reduceRight(a, 0, function(a, x, callback){
        call_order.push(x);
        callback(null, a + x);
      }).then(function(result){
        result.should.equal(6);
        call_order.should.eql([3,2,1]);
      }).finally(done);
    });

    it(' .detect', function(done){
      async.detect([3, 2, 4, 5], function(x, callback){
        setTimeout(function(){
          callback(null, x % 2 == 0);
        }, Math.random() * 10);
      }).then(function(result){
        result.should.be.equal(2);
      }).finally(done);
    });

    it(' .detectSeries', function(done){
      var call_order = [];
      async.detectSeries([3, 2, 4, 5], function(x, callback){
        setTimeout(function(){
          call_order.push(x);
          callback(null, x % 2 == 0);
        }, Math.random() * 10);
      }).then(function(result){
        call_order.should.eql([3,2,4,5]);
        result.should.be.equal(2);
      }).finally(done);
    });

    it(' .sortBy', function(done){
      async.sortBy([{a:1},{a:15},{a:6}], function(x, callback){
        setTimeout(function(){callback(null, x.a);}, 0);
      }).then(function(result){
        result.should.be.eql([{a:1},{a:6},{a:15}]);
      }).finally(done);
    });

    it(' .some true', function(done){
      async.some([3,1,2], function(x, callback){
        setTimeout(function(){callback(x === 1);}, 0);
      }).then(function(result){
        result.should.be.true;
      }).finally(done);
    });

    it(' .some false', function(done){
      async.some([3,1,2], function(x, callback){
        setTimeout(function(){callback(x === 10);}, 0);
      }).then(function(result){
        result.should.be.false;
      }).finally(done);
    });
    
    it(' .every true', function(done){
      async.every([1,2,3], function(x, callback){
        setTimeout(function(){callback(true);}, 0);
      }).then(function(result){
        result.should.be.true;
      }).finally(done);
    });

    it(' .every false', function(done){
      async.every([1,2,3], function(x, callback){
        setTimeout(function(){callback(x % 2);}, 0);
      }).then(function(result){
        result.should.be.false;
      }).finally(done);
    });

    it(' .concat', function(done){
      var call_order = [];
      var iterator = function (x, cb) {
        setTimeout(function(){
          call_order.push(x);
          var r = [];
          while (x > 0) {
            r.push(x);
            x--;
          }
          cb(null, r);
        }, x*2);
      };
      async.concat([1,3,2], iterator).then(function(results){
        results.should.be.eql([1,2,1,3,2,1]);
        call_order.should.be.eql([1,2,3]);
      }).finally(done);
    });

    it(' .concat error', function(done){
      var iterator = function (x, cb) {
        setTimeout(function(){
          return cb(new Error('test error'));
        }, x)
      };
      async.concat([1,2,3], iterator).catch(function(err){
        err.should.not.be.empty;
      }).finally(done);
    });

    it(' .concatSeries', function(done){
      var call_order = [];
      var iterator = function (x, cb) {
        setTimeout(function(){
          call_order.push(x);
          var r = [];
          while (x > 0) {
            r.push(x);
            x--;
          }
          cb(null, r);
        }, x);
      };
      async.concatSeries([1,3,2], iterator).then(function( results){
        results.should.be.eql([1,3,2,1,2,1]);
        call_order.should.be.eql([1,3,2]);
      }).finally(done);
    });

    it(' .whilst', function(done){
      var call_order = [];
      var count = 0;
      async.whilst(
        function () {
          call_order.push(['test', count]);
          return (count < 5);
        },
        function (cb) {
          call_order.push(['iterator', count]);
          count++;
          cb();
        }).then(function() {
          call_order.should.be.eql([
            ['test', 0],
            ['iterator', 0], ['test', 1],
            ['iterator', 1], ['test', 2],
            ['iterator', 2], ['test', 3],
            ['iterator', 3], ['test', 4],
            ['iterator', 4], ['test', 5],
          ]);
          count.should.be.equal(5);
        }).finally(done);
    });

    it(' .doWhilst');
    it(' .until');
    it(' .compose');
    it(' .applyEach');
    it(' .applyEachSeries');
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
          }, 3);
        },
        function(callback){
          setTimeout(function(){
            call_order.push(2);
            callback(null, 2);
          }, 5);
        },
        function(callback){
          setTimeout(function(){
            call_order.push(3);
            callback(null, 3,3);
          }, 1);
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
          }, 3);
        },
        function(callback){
          setTimeout(function(){
            call_order.push(2);
            callback(null, 2);
          }, 5);
        },
        function(callback){
          setTimeout(function(){
            call_order.push(3);
            callback(null, 3,3);
          }, 1);
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

    describe(' .filter', function(){
      var results
        , call_order = []
        , arr = [16, 5, 18, 3];

      before(function(done){
        async.filter(arr, filterIterator.bind(this, call_order)).then(function(_results){
          results = _results;
        }).finally(done);
      })

      it(' results are correct', function(done){
        results.should.be.eql([16, 18]);
        done();
      });

      it(' original array is untouched', function(done){
        arr.should.be.eql([16, 5, 18, 3]);
        done();
      });
    });

    it(' .filterSeries', function(done){
      var call_order = [];
      async.filterSeries([16, 3,1,2], filterIterator.bind(this, call_order)).then(function(results){
        results.should.be.eql([16, 2]);
        call_order.should.be.eql([16, 3, 1, 2]);
      }).finally(done);
    });

    it(' .reject', function(done){
      var call_order = [];
      async.reject([16, 3,1,2], filterIterator.bind(this, call_order)).then(function(results){
        results.should.be.eql([3, 1]);
        call_order.should.be.eql([16, 3, 1, 2]);
      }).finally(done);
    });

    it(' .filterSeries', function(done){
      var call_order = [];
      async.rejectSeries([16, 3,1,2], filterIterator.bind(this, call_order)).then(function(results){
        results.should.be.eql([3, 1]);
        call_order.should.be.eql([16, 3, 1, 2]);
      }).finally(done);
    });

    it(' .reduce', function(done){
      var call_order = [];
      async.reduce([1,2,3], 0, function(a, x, callback){
        call_order.push(x);
        callback(null, a + x);
      }).then(function(result){
        result.should.equal(6);
        call_order.should.eql([1,2,3]);
      }).finally(done);
    });

    it(' .reduce async with non-reference memo', function(done){
      async.reduce([1,3,2], 0, function(a, x, callback){
          setTimeout(function(){
            callback(null, a + x);
          }, Math.random()*2);
      }).then(function(result){
        result.should.equal(6);
      }).finally(done);
    });

    it(' .reduceRight', function(done){
      var call_order = [];
      var a = [1,2,3];

      async.reduceRight(a, 0, function(a, x, callback){
        call_order.push(x);
        callback(null, a + x);
      }).then(function(result){
        result.should.equal(6);
        call_order.should.eql([3,2,1]);
      }).finally(done);
    });

    it(' .detect', function(done){
      async.detect([3, 2, 4, 5], function(x, callback){
        setTimeout(function(){
          callback(null, x % 2 == 0);
        }, Math.random() * 10);
      }).then(function(result){
        result.should.be.equal(2);
      }).finally(done);
    });

    it(' .detectSeries', function(done){
      var call_order = [];
      async.detectSeries([3, 2, 4, 5], function(x, callback){
        setTimeout(function(){
          call_order.push(x);
          callback(null, x % 2 == 0);
        }, Math.random() * 10);
      }).then(function(result){
        call_order.should.eql([3,2,4,5]);
        result.should.be.equal(2);
      }).finally(done);
    });

    it(' .sortBy', function(done){
      async.sortBy([{a:1},{a:15},{a:6}], function(x, callback){
        setTimeout(function(){callback(null, x.a);}, 0);
      }).then(function(result){
        result.should.be.eql([{a:1},{a:6},{a:15}]);
      }).finally(done);
    });

    it(' .some true', function(done){
      async.some([3,1,2], function(x, callback){
        setTimeout(function(){callback(x === 1);}, 0);
      }).then(function(result){
        result.should.be.true;
      }).finally(done);
    });

    it(' .some false', function(done){
      async.some([3,1,2], function(x, callback){
        setTimeout(function(){callback(x === 10);}, 0);
      }).then(function(result){
        result.should.be.false;
      }).finally(done);
    });

    //it('some early return', function(done){
      //var call_order = [];
      //async.some([1,2,3], function(x, callback){
        //setTimeout(function(){
          //call_order.push(x);
          //callback(x === 1);
        //}, x*25);
      //}).then(function(result){
        //call_order.push('callback');
      //});
      //setTimeout(function(){
        //call_order.should.be.eql([1,'callback',2,3]);
        //done();
      //}, 100);
    //});

    it(' .every true', function(done){
      async.every([1,2,3], function(x, callback){
        setTimeout(function(){callback(true);}, 0);
      }).then(function(result){
        result.should.be.true;
      }).finally(done);
    });

    it(' .every false', function(done){
      async.every([1,2,3], function(x, callback){
        setTimeout(function(){callback(x % 2);}, 0);
      }).then(function(result){
        result.should.be.false;
      }).finally(done);
    });

    it(' .concat', function(done){
      var call_order = [];
      var iterator = function (x, cb) {
        setTimeout(function(){
          call_order.push(x);
          var r = [];
          while (x > 0) {
            r.push(x);
            x--;
          }
          cb(null, r);
        }, x*2);
      };
      async.concat([1,3,2], iterator).then(function(results){
        results.should.be.eql([1,2,1,3,2,1]);
        call_order.should.be.eql([1,2,3]);
      }).finally(done);
    });
    
    it(' .concat error', function(done){
      var iterator = function (x, cb) {
        setTimeout(function(){
          return cb(new Error('test error'));
        }, x)
      };
      async.concat([1,2,3], iterator).catch(function(err){
        err.should.not.be.empty;
      }).finally(done);
    });

    it(' .concatSeries', function(done){
      var call_order = [];
      var iterator = function (x, cb) {
        setTimeout(function(){
          call_order.push(x);
          var r = [];
          while (x > 0) {
            r.push(x);
            x--;
          }
          cb(null, r);
        }, x);
      };
      async.concatSeries([1,3,2], iterator).then(function( results){
        results.should.be.eql([1,3,2,1,2,1]);
        call_order.should.be.eql([1,3,2]);
      }).finally(done);
    });

    it(' .whilst', function(done){
      var call_order = [];
      var count = 0;
      async.whilst(
        function () {
          call_order.push(['test', count]);
          return (count < 5);
        },
        function (cb) {
          call_order.push(['iterator', count]);
          count++;
          cb();
        }).then(function() {
          call_order.should.be.eql([
            ['test', 0],
            ['iterator', 0], ['test', 1],
            ['iterator', 1], ['test', 2],
            ['iterator', 2], ['test', 3],
            ['iterator', 3], ['test', 4],
            ['iterator', 4], ['test', 5],
          ]);
          count.should.be.equal(5);
        }).finally(done);
    });


    it(' .doWhilst');
    it(' .until');
    it(' .compose');
    it(' .applyEach');
    it(' .applyEachSeries');


  });
});
