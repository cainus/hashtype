var liken = require('../index');
var testHelpers = require('../testHelpers');
var expect = testHelpers.expect;
const raise = testHelpers.raise;
//const expectTypeMismatchToThrow = testHelpers.expectTypeMismatchToThrow;
const expectMissingParamToThrow = testHelpers.expectMissingParamToThrow;
const getError = testHelpers.getError;
const expectProperties = testHelpers.expectProperties;

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
  describe("with objects of literals", function(){
    it ('matches a bunch of literals', function(){
        liken({
            asdf: "asdf",
            num: 1234,
            bool: true
        }).to({
            asdf: "asdf",
            num: 1234,
            bool: true
        });
    });
    it('throws error on wrong type', function(){
      try {
        liken({}).to("asdf");
        throw new Error("expected exception not raised");
      } catch(ex){
        expect(ex.message).to.eql("invalid type");
        expect(ex.value).to.eql("asdf");
        expect(ex.expectedType).to.eql("object");
        expect(ex.actualType).to.eql("string");
      }
    });
    it ('throws missing error on null', function(){
      expectMissingParamToThrow({});
    });
    it ('allows matching empty values', function(){
      liken({}).to({});
    });
    it ('allows matching values', function(){
      liken({asdf:"asdf"}).to({asdf:"asdf"});
    });
    it ('errors for excess items', function(){
      var error = getError({}, {"key":"value"});
      expectProperties(error, {
        subType: 'invalid type', path: null, expected: {}, actual: {"key":"value"}
      });
      expect(error.errors).to.have.length(1);
      expectProperties(error.errors[0], {
        subType: 'excess value', path: "key", actual: "value"
      });
    });
    it ('errors for missing items', function(){
      var error = getError({"key":"value"}, {});
      expectProperties(error, {
        subType: 'invalid type', path: null, expected: {"key":"value"}, actual: {}
      });
      expect(error.errors).to.have.length(1);
      expectProperties(error.errors[0], {
        subType: 'missing value', path: "key", expected: "value"
      });
    });

  });
});
