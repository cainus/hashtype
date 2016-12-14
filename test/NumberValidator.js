
var assert = require('chai').assert;
var expect = require('chai').expect;
var NumberValidator = require('../NumberValidator');
var PlainObjectValidator = require('../PlainObjectValidator');
const liken = require('../index');

describe('NumberValidator', function(){
  describe('identify', function(){

    it ("returns false for various things not matching the notation", function(){
      const failCases = {
        array: [],
        string: "asdf",
        number: 1234,
        'null': null,
        'undefined': undefined,
        someObject: {},
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

      for (var name in failCases){
        var testable = failCases[name];
        assert.isNotOk(NumberValidator.identify(testable), name);
      }
    });

    it ("returns true for objects", function(){
      assert.isOk(NumberValidator.identify(Number));
      assert.isOk(NumberValidator.identify({'#number': {
        integer: true
      }}));
      assert.isOk(NumberValidator.identify(liken.number()));
      assert.isOk(NumberValidator.identify(liken.number().integer()));
    });
  });
  describe("#toJSON", function(){
    it ("returns JSON for a Number class", function(){
      expect(new NumberValidator(Number).toJSON()).to.eql({'#number':{}});
    });
    it ("returns JSON for a Number object", function(){
      expect(new NumberValidator(Number).toJSON()).to.eql({
        '#number':{ }
      });
    });
  });

  describe("#notation generator", function(){
    it ("generates a number notation", function(){
      expect(liken.number()).to.eql({'#number': {}});
    });
    it ("generates an integer notation", function(){
      expect(liken.
              number().
              integer()).to.eql({'#number': {integer: true}});
    });
    it ("works for number notation", function(){
      liken(1234, liken.number().integer());
    });
  });

  describe("#assert", function(){
    var check = function(input, schema){
      new NumberValidator(schema).assert(input);
    };
    var getError = function(input, schema){
      try {
        check(input, schema);
      } catch (err) {
        return err;
      }
      throw new Error('expected error was not raised');
    };
    it ('allows any old number', function(){
      check(1234, Number);
    });
    it ('allows 0', function(){
      check(0, Number);
    });
    it ('allows integer lock-down', function(){
      check(1324, {'#number': { integer: true }});
    });
    it ('allows objects with numbers for a property', function(){
      new PlainObjectValidator({someNumber: Number}).
        assert({someNumber: 1234});
    });
    it ('throws on non-matching numbers', function(){
      var expected = {'#number': {integer: true}};
      var underTest = 1975.45;
      var error = getError(underTest, expected);
      expect(error.message).to.eql('MismatchedValue: expected 1975.45 to match {"#number":{"integer":true}}');
      expect(error.expected).to.eql({'#number': { integer: true }});
      expect(error.actual).to.eql(underTest);
    });
  });

});
