var assert = require('chai').assert;
var expect = require('chai').expect;
var ArrayValidator = require('../ArrayValidator');

const nonArrays = {
  someObj: {},
  string: "asdf",
  number: 1234,
  'null': null,
  'undefined': undefined,
  date: new Date(),
  Date: Date,
  numberObject: new Number(),
  'function': function(){},
  boolean: true,
  booleanObject: new Boolean(true),
  booleanClass: Boolean,
  stringObj: new String("asdf"),
  emptyString: "",
  aNull: null,
  anUndefined: undefined,
  aFalse: false,
};

describe('ArrayValidator', function(){
  describe('identify', function(){

    it ("returns false for various non-arrays", function(){
      for (var name in nonArrays){
        var testable = nonArrays[name];
        assert.isNotOk(ArrayValidator.identify(testable), name);
      }
    });

    it ("returns true for arrays", function(){
      assert.isOk(ArrayValidator.identify([]));
      assert.isOk(ArrayValidator.identify([0,"asdf",false]));
    });
  });
  describe("#toJSON", function(){
    it ("returns JSON for an empty array", function(){
      expect(new ArrayValidator([]).toJSON()).to.eql([]);
    });
    it ("returns JSON for a 1 property array", function(){
      expect(new ArrayValidator(["test"]).toJSON()).to.eql(["test"]);
    });
    it ("returns JSON for a 2 property array", function(){
      expect(new ArrayValidator(["test", 1]).toJSON()).to.eql(["test", 1]);
    });
  });

  describe("#assert", function(){
    var check = function(schema, input){
      new ArrayValidator(schema).assert(input);
    };
    var getError = function(schema, input){
      try {
        check(schema, input);
      } catch (err) {
        return err;
      }
      throw new Error('expected error was not raised');
    };
    it ('allows matching with object properties', function(){
      check([0, "asdf", false], [0, "asdf", false]);
    });
    it ('can match any array', function(){
      check(Array, [0, "asdf", false]);
    });
    it ('throws on non-matching object properties', function(){
      var expected = ["asdf", true];
      var underTest = ["asdf", false];
      var error = getError(expected, underTest);
      expect(error.expected).to.eql(expected);
      expect(error.actual).to.eql(underTest);
      expect(error.errors).to.have.length(1);
      expect(error.errors[0].key).to.eql(1);
      expect(error.errors[0].message).to.eql('MismatchedValue');
      expect(error.errors[0].actual).to.eql(false);
      expect(error.errors[0].expected).to.eql(true);
    });
    it ('throws on non-matching sub-object properties', function(){
      var expected = ["asdf", {isSub:true}];
      var underTest = ["asdf", {isSub:false}];
      var error = getError(expected, underTest);
      expect(error.expected).to.eql(expected);
      expect(error.actual).to.eql(underTest);
      expect(error.errors).to.have.length(1);
      expect(error.errors[0].key).to.eql(1);
      expect(error.errors[0].message).to.eql('MismatchedValue');
      expect(error.errors[0].actual).to.eql({isSub:false});
      expect(error.errors[0].expected).to.eql({isSub:true});
    });
    it ('allows matching sub-object regexes', function(){
      var expected = [{asdf:"asdf"}, {isSub: /true/}];
      var underTest = [{asdf:"asdf"}, {isSub:'true'}];
      check(expected, underTest);
    });
    it ('errors for excess items', function(){
      var expected = [];
      var underTest = ["value"];
      var error = getError(expected, underTest);
      expect(error.expected).to.eql(expected);
      expect(error.actual).to.eql(underTest);
      expect(error.errors).to.have.length(1);
      expect(error.errors[0].message).to.eql('UnexpectedValue');
      expect(error.errors[0].actual).to.eql("value");
      expect(error.errors[0].expected).to.eql(null);
    });
    it ('errors for missing items', function(){
      var underTest = [];
      var expected = ["value"];
      var error = getError(expected, underTest);
      expect(error.expected).to.eql(expected);
      expect(error.actual).to.eql(underTest);
      expect(error.errors).to.have.length(1);
      expect(error.errors[0].message).to.eql('MissingValue');
      expect(error.errors[0].actual).to.eql(null);
      expect(error.errors[0].expected).to.eql("value");
    });
  });

});
