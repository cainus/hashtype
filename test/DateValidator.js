
var assert = require('chai').assert;
var expect = require('chai').expect;
var DateValidator = require('../DateValidator');
var PlainObjectValidator = require('../PlainObjectValidator');
const liken = require('../index');

describe('DateValidator', function(){
  describe('identify', function(){

    it ("returns false for various non-dates", function(){
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
        assert.isNotOk(DateValidator.identify(testable), name);
      }
    });

    it ("returns true for objects", function(){
      assert.isOk(DateValidator.identify(Date));
      assert.isOk(DateValidator.identify(new Date()));
      assert.isOk(DateValidator.identify({'#date': {
        recent: true
      }}));
    });
  });
  describe("#toJSON", function(){
    it ("returns JSON for a Date class", function(){
      expect(new DateValidator(Date).toJSON()).to.eql({'#date':{}});
    });
    it ("returns JSON for a Date object", function(){
      expect(new DateValidator(new Date(1970)).toJSON()).to.eql({
        '#date':{
          equals: (new Date(1970)).toJSON()
        }
      });
    });
  });

  describe("#notification generator", function(){
    it ("generates a date notation", function(){
      expect(liken.date()).to.eql({'#date': {}});
    });
    it ("generates a recent date notation", function(){
      expect(liken.
        date().
        recent()).to.eql({'#date': {recent: true}});
    });
    it ("works for recent notation", function(){
      liken(new Date(), liken.date().recent());
    });
  });

  describe("#assert", function(){
    var check = function(input, schema){
      new DateValidator(schema).assert(input);
    };
    var getError = function(input, schema){
      try {
        check(input, schema);
      } catch (err) {
        return err;
      }
      throw new Error('expected error was not raised');
    };
    it ('allows the same date', function(){
      var date = new Date();
      var copiedDate = new Date(date.getTime());
      check(copiedDate, date);
    });
    it ('allows any old date', function(){
      var date = new Date();
      check(date, Date);
    });
    it ('allows recent dates', function(){
      var date = new Date();
      check(date, {'#date': { recent: true }});
    });
    it ('allows objects with any old date for a property', function(){
      new PlainObjectValidator({createdAt: Date}).
        assert({createdAt: new Date()});
    });
    it ('throws on non-matching Dates', function(){
      var expected = new Date();
      var underTest = new Date(1975);
      var error = getError(underTest, expected);
      expect(error.message).to.eql('MismatchedValue: expected {"#date":"1970-01-01T00:00:01.975Z"} to match {"#date":{"equals":"' + expected.toISOString() + '"}}');
      expect(error.expected).to.eql({'#date': { equals: expected.toISOString() }});
      expect(error.actual).to.eql({'#date': underTest.toISOString()});
    });
  });

});
