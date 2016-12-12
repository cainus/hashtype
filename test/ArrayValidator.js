var assert = require('chai').assert;
var expect = require('chai').expect;
var ArrayValidator = require('../ArrayValidator');
var liken = require('../index');

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
      assert.isOk(ArrayValidator.identify({'#array' : {}}));
      assert.isOk(ArrayValidator.identify([0,"asdf",false]));
    });
  });
  describe("#toJSON", function(){
    it ("returns JSON for an empty array", function(){
      expect(new ArrayValidator([]).toJSON()).to.eql({'#array': {matches: []}});
    });
    it ("returns JSON for a 1 property array", function(){
      expect(new ArrayValidator(["test"]).toJSON()).to.eql({'#array': {matches: ["test"]}});
    });
    it ("returns JSON for a 2 property array", function(){
      expect(new ArrayValidator(["test", 1]).toJSON()).to.eql({'#array': {matches: ["test", 1]}});
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
    describe("#ofAll", function(){
      it ('can match an array of a certain type', function(){
        check({'#array': {'ofAll': Number}}, [0, 1, 2]);
      });
      it ('can match an array of a certain type using ArrayNotation', function(){
        check(liken.array().ofAll(Number), [0, 1, 2]);
      });
    });
    describe("#length", function(){
      it ('can match an array of a given length', function(){
        check({'#array': {'length': 3}}, [2, 1, 0]);
      });
      it ('can match an array of any order using ArrayNotation', function(){
        check(liken.array().length(3), [2, 1, 0]);
      });
      it ('rejects arrays of incorrect length using ArrayNotation', function(){
        var expected = liken.array().length(3);
        var underTest = [2,1];
        var error = getError(expected, underTest);
        //console.log("error was: ", error);
        //console.log("actual was: ", underTest);
        //console.log("expected was: ", error.expected);
        //console.log("expected should be: ", expected);
        expect(error.expected).to.eql([2,1, {LikenErrors: [error.errors[0]]}]);
        expect(error.actual).to.eql(underTest);
        expect(error.errors).to.have.length(1);
        expect(error.errors[0].message).to.eql('InvalidLength');
        expect(error.errors[0].actual).to.eql(2);
        expect(error.errors[0].expected).to.eql(3);
      });
    });
    it ('throws on non-matching object properties', function(){
      var expected = {'#array': { matches : ["asdf", true]}};
      var underTest = ["asdf", false];
      var error = getError(expected, underTest);
      expect(error.expected).to.eql(["asdf", true]);
      expect(error.actual).to.eql(underTest);
      expect(error.errors).to.have.length(1);
      expect(error.errors[0].key).to.eql(1);
      expect(error.errors[0].message).to.eql('MismatchedValue');
      expect(error.errors[0].actual).to.eql(false);
      expect(error.errors[0].expected).to.eql(true);
    });
    it ('throws on non-matching sub-object properties', function(){
      var obj = {
        '#object' : {
          matches : {
            isSub:true
          }
        }
      };
      var expected = {
        '#array': {
          matches : [
            "asdf", obj
          ]
        }
      };
      var underTest = ["asdf", {isSub:false}];
      var error = getError(expected, underTest);
      expect(error.expected).to.eql(['asdf', { isSub: true }]);
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
      var expected = {'#array': { matches : []}};
      var underTest = ["value"];
      var error = getError(expected, underTest);
      expect(error.expected).to.eql([]);
      expect(error.actual).to.eql(underTest);
      expect(error.errors).to.have.length(1);
      expect(error.errors[0].message).to.eql('UnexpectedValue');
      expect(error.errors[0].actual).to.eql("value");
      expect(error.errors[0].expected).to.eql(null);
    });
    it ('errors for missing items', function(){
      var expected = {'#array': { matches : ["value"]}};
      var underTest = [];
      var error = getError(expected, underTest);
      expect(error.expected).to.eql(["value"]);
      expect(error.actual).to.eql(underTest);
      expect(error.errors).to.have.length(1);
      expect(error.errors[0].message).to.eql('MissingValue');
      expect(error.errors[0].actual).to.eql(null);
      expect(error.errors[0].expected).to.eql("value");
    });
  });

});
