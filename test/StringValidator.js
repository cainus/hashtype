
var assert = require('chai').assert;
var expect = require('chai').expect;
var StringValidator = require('../StringValidator');

describe('StringValidator', function(){
  describe('identify', function(){

    it ("returns false for various non-dates", function(){
      const failCases = {
        array: [],
        someDate: new Date(),
        dateClass: Date,
        number: 1234,
        'null': null,
        'undefined': undefined,
        someObject: {},
        numberObject: new Number(),
        'function': function(){},
        boolean: true,
        booleanObject: new Boolean(true),
        booleanClass: Boolean,
        aNull: null,
        anUndefined: undefined,
        stringObj: new String("asdf"),
        stringLiteral: "asdf",
        emptyStringLiteral: "",
        aFalse: false,
      };

      for (var name in failCases){
        var testable = failCases[name];
        assert.isNotOk(StringValidator.identify(testable), name);
      }
    });

    it ("returns true for strings", function(){
      assert.isOk(StringValidator.identify(String));
      assert.isOk(StringValidator.identify(/^asdf$/));
    });
  });
  describe("#toJSON", function(){
    it ("returns JSON for a String class", function(){
      expect(new StringValidator(String).toJSON()).to.eql({'#string':{}});
    });
    it ("returns JSON for a regex object", function(){
      expect(new StringValidator(/asdf/).toJSON()).to.eql({
        '#string':{
          matches: '/asdf/'
        }
      });
    });
  });

  describe("#assert", function(){
    var check = function(input, schema){
      new StringValidator(schema).assert(input);
    };
    var getError = function(input, schema){
      try {
        check(input, schema);
      } catch (err) {
        return err;
      }
      throw new Error('expected error was not raised');
    };
    it ('allows a regex match', function(){
      check('test', /test/);
    });
    it ('allows any old string', function(){
      check("actual", String);
    });
    it ('throws on non-matching strings', function(){
      var expected = /test/;
      var underTest = 'FAIL';
      var error = getError(underTest, expected);
      expect(error.message).to.eql('MismatchedValue');
      expect(error.expected).to.eql({'#string': { matches: '/test/' }});
      expect(error.actual).to.eql({'#string': underTest});
    });
  });

});
