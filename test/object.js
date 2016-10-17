var liken = require('../index');
var testHelpers = require('../testHelpers');
var expect = testHelpers.expect;
const raise = testHelpers.raise;
//const expectTypeMismatchToThrow = testHelpers.expectTypeMismatchToThrow;

describe("liken", function(){
  describe("any object", function(){
    it ('fails on strings', function(){
      expect(raise(function(){
        liken(Object).to("");
      }).message).to.eql('Input was not an object');
    });
    it ('fails on numbers', function(){
      expect(raise(function(){
        liken(Object).to(34);
      }).message).to.eql('Input was not an object');
    });
    it ('fails on arrays', function(){
      expect(raise(function(){
        liken(Object).to([]);
      }).message).to.eql('Input was not an object');
    });
    it ('matches any object when given an `Object` declaration', function(){
        liken(Object).to({
            asdf: "asdf",
            num: 1234,
            bool: true
        });
    });
  });
  describe("handles types instead of literals", function(){
    it ('returns multiple errors where appropriate', function(){
      var ex = raise(function(){
        liken({
          firstName: String,
          answer: Number
        }).to({firstName: 42, answer: "Test"});
      });
      expect(ex).to.be.an.instanceof(TypeError);
      expect(ex.message).to.eql('invalid type');
      expect(ex.errors).to.eql([
        {subType: 'invalid type', path: 'firstName', value: 42, expectedType: 'String', actualType: 'number'},
        {subType: 'invalid type', path: 'answer', value: "Test", expectedType: 'Number', actualType: 'string'},
      ]);
    });
  });
});
