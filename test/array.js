var L = require("../array");
var expect = require('chai').expect;

function raise(fn){
  try {
    fn();
  } catch(ex){
    return ex;
  }
  throw new Error('Expected exception did not throw')
}

describe("array", function(){
  describe("test", function(){
    it ('fails on strings', function(){
      expect(raise(function(){
        L().test("");
      }).message).to.eql('not an array');
    });
    it ('fails on numbers', function(){
      expect(raise(function(){
        L().test(34);
      }).message).to.eql('not an array');
    });
    it ('fails on objects', function(){
      expect(raise(function(){
        L().test({asdf:'asdf'});
      }).message).to.eql('not an array');
    });
    it ('passes on array of any', function(){
      expect(
        L().test([1,2,"three"])
      ).to.eql(true);
    });
    it ('passes on array of type number', function(){
      expect(
        L({type:Number}).test([1,2,3])
      ).to.eql(true);
    });
    it ('fails on array of numbers when there is a string', function(){
      expect(raise(function(){
        L({type:Number}).test([1,"three",2])
      }).type).to.eql('invalid type');
    });
    it ('passes on array of literals (unsorted)', function(){
      expect(
        L([1,2,"three"], {ordered:false}).test([1,"three",2])
      ).to.eql(true);
    });
    it ('fails on array of literals (bad order)', function(){
      expect(raise(function(){
        L([1,2,"three"]).test([1,"three",2])
      }).message).to.eql('non-match');
    });
    it ('fails an incorrect array of literals', function(){
      expect(raise(function(){
        L([1,2,"three"]).test([1,2,3])
      }).message).to.eql('non-match');
    });
    it ('fails an incorrect array of literals that is a subset', function(){
      expect(raise(function(){
        L([1,2,"three"]).test([1,2])
      }).message).to.eql('non-match');
    });
  });

});
