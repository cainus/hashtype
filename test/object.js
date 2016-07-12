var O = require('../validators').object;
var expect = require('chai').expect;

function raise(fn){
  try {
    fn();
  } catch(ex){
    return ex;
  }
  throw new Error('Expected exception did not throw')
}

describe("object", function(){
  describe("test", function(){
    it ('fails on strings', function(){
      expect(raise(function(){
        O().test("");
      }).message).to.eql('not an object');
    });
    it ('fails on numbers', function(){
      expect(raise(function(){
        O().test(34);
      }).message).to.eql('not an object');
    });
    it ('fails on arrays', function(){
      expect(raise(function(){
        O().test([]);
      }).message).to.eql('not an object');
    });
    it ('returns multiple errors where appropriate', function(){
      var ex = raise(function(){
        O({
          firstName: String,
          answer: Number
        }).test({firstName: 42, answer: "Test"});
      });
      expect(ex).to.be.an.instanceof(TypeError)
      expect(ex.message).to.eql('invalid type')
      expect(ex.errors).to.eql([
        {subType: 'invalid type', path: 'firstName', value: 42, expectedType: 'String', actualType: 'number'},
        {subType: 'invalid type', path: 'answer', value: "Test", expectedType: 'Number', actualType: 'string'},
      ])
    });
    it ('xxmatches any object when given `an Object` declaration', function(){
      expect(
        O(Object).test({
            asdf: "asdf",
            num: 1234,
            bool: true
        })).to.eql(true);
    });
    it ('xxmatches any object when input not provided', function(){
      expect(
        O().test({
            asdf: "asdf",
            num: 1234,
            bool: true
        })).to.eql(true);
    });
    it ('matches a bunch of literals', function(){
      expect(
        O({
            asdf: "asdf",
            num: 1234,
            bool: true
        }).test({
            asdf: "asdf",
            num: 1234,
            bool: true
        })).to.eql(true);
    });
  });
});
