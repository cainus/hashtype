var assert = require('chai').assert;
var expect = require('chai').expect;
var PlainObjectValidator = require('../PlainObjectValidator');

describe('PlainObjectValidator', function(){
  describe('identify', function(){

    it ("returns false for various non-objects", function(){
      const failCases = {
        array: [],
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


      for (var name in failCases){
        var testable = failCases[name];
        assert.isNotOk(PlainObjectValidator.identify(testable), name);
      }
    });

    it ("returns true for objects", function(){
      assert.isOk(PlainObjectValidator.identify({}));
      assert.isOk(PlainObjectValidator.identify({"asdf":false}));
    });
  });
  describe("#toJSON", function(){
    it ("returns JSON for an empty object", function(){
      expect(new PlainObjectValidator({}).toJSON()).to.eql({});
    });
    it ("returns JSON for a 1 property object", function(){
      expect(new PlainObjectValidator({"asdf": true}).toJSON()).to.eql({"asdf": true});
    });
    it ("returns JSON for a 2 property object", function(){
      expect(new PlainObjectValidator({
        "asdf": true,
        "qwer": "qwer"
      }).toJSON()).to.eql({
        "asdf": true,
        "qwer": "qwer"
      });
    });
  });

  describe("#assert", function(){
    var check = function(schema, input){
      new PlainObjectValidator(schema).assert(input);
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
      check({
        asdf:"asdf",
        sub:{isSub:true}
      }, {
        asdf:"asdf",
        sub:{isSub:true}
      });
    });
    it ('throws on non-matching object properties', function(){
      var expected = {asdf:"asdf", sub:true};
      var underTest = {asdf:"asdf", sub:false};
      var error = getError(expected, underTest);
      expect(error.expected).to.eql(expected);
      expect(error.actual).to.eql(underTest);
      expect(error.errors).to.have.length(1);
      expect(error.errors[0].message).to.eql('MismatchedValue');
      expect(error.errors[0].actual).to.eql(false);
      expect(error.errors[0].expected).to.eql(true);
    });
    it ('throws on non-matching sub-object properties', function(){
      var expected = {asdf:"asdf", sub:{isSub:true}};
      var underTest = {asdf:"asdf", sub:{isSub:false}};
      var error = getError(expected, underTest);
      expect(error.expected).to.eql(expected);
      expect(error.actual).to.eql(underTest);
      expect(error.errors).to.have.length(1);
      expect(error.errors[0].message).to.eql('MismatchedValue');
      expect(error.errors[0].actual).to.eql({isSub:false});
      expect(error.errors[0].expected).to.eql({isSub:true});
    });
    it ('errors for excess items', function(){
      var expected = {};
      var underTest = {"key":"value"};
      var error = getError(expected, underTest);
      expect(error.expected).to.eql(expected);
      expect(error.actual).to.eql(underTest);
      expect(error.errors).to.have.length(1);
      expect(error.errors[0].message).to.eql('UnexpectedValue');
      expect(error.errors[0].actual).to.eql("value");
      expect(error.errors[0].expected).to.eql(null);
    });
    it ('errors for missing items', function(){
      var underTest = {};
      var expected = {"key":"value"};
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
