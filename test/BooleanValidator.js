
var assert = require('chai').assert;
var expect = require('chai').expect;
var BooleanValidator = require('../BooleanValidator');
var PlainObjectValidator = require('../PlainObjectValidator');

describe('BooleanValidator', function(){
  describe('identify', function(){

    it ("returns false for various non-booleans", function(){
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
        someDate: new Date(),
        stringObj: new String("asdf"),
        emptyString: "",
        aNull: null,
        anUndefined: undefined,
        aFalse: false,
      };

      for (var name in failCases){
        var testable = failCases[name];
        assert.isNotOk(BooleanValidator.identify(testable), name);
      }
    });

    it ("returns true for objects", function(){
      assert.isOk(BooleanValidator.identify(Boolean));
      assert.isOk(BooleanValidator.identify({'#boolean': {}}));
    });
  });
  describe("#toJSON", function(){
    it ("returns JSON for a Boolean class", function(){
      expect(new BooleanValidator(Boolean).toJSON()).to.eql({'#boolean':{}});
    });
  });

  describe("#assert", function(){
    var check = function(input, schema){
      new BooleanValidator(schema).assert(input);
    };
    var getError = function(input, schema){
      try {
        check(input, schema);
      } catch (err) {
        return err;
      }
      throw new Error('expected error was not raised');
    };
    it ('allows true', function(){
      check(true, Boolean);
    });
    it ('allows false', function(){
      check(false, Boolean);
    });
    it ('allows false with json notation', function(){
      check(false, {'#boolean': {}});
    });
    it ('allows objects with any old boolean for a property', function(){
      new PlainObjectValidator({works: Boolean}).
        assert({works: false});
    });
    it ('throws on non-matching booleans', function(){
      var expected = Boolean;
      var underTest = 14;
      var error = getError(underTest, expected);
      expect(error.message).to.eql('MismatchedValue');
      expect(error.expected).to.eql({'#boolean':{}});
      expect(error.actual).to.eql(14);
    });
  });

});
