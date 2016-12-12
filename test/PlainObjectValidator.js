var assert = require('chai').assert;
var expect = require('chai').expect;
var PlainObjectValidator = require('../PlainObjectValidator');
var liken = require('../index');

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
      assert.isOk(PlainObjectValidator.identify({"#object":{matches:{asdf:false}}}));
    });
  });
  describe("#toJSON", function(){
    it ("returns JSON for an empty object", function(){
      expect(new PlainObjectValidator({}).toJSON()).to.eql({
        '#object' : {
          matches: {
          }
        }
      });
    });
    it ("returns JSON for a 1 property object", function(){
      expect(new PlainObjectValidator({
        "asdf": true
      }).toJSON()).to.eql({
        '#object' : {
          matches: {
            "asdf": true
          }
        }
      });
    });
    it ("returns JSON for a 2 property object", function(){
      expect(new PlainObjectValidator({
        "asdf": true,
        "qwer": "qwer"
      }).toJSON()).to.eql({
        '#object' : {
          matches: {
            "asdf": true,
            "qwer": "qwer"
          }
        }
      });
    });
  });

  describe("#assert", function(){
    var check = function(input, schema){
      new PlainObjectValidator(schema).assert(input);
    };
    var getError = function(input, schema){
      try {
        check(input, schema);
      } catch (err) {
        return err;
      }
      throw new Error('expected error was not raised');
    };
    it ('matches any old object', function(){
      check({
        asdf:"asdf",
        sub:{isSub:true}
      }, Object);
    });
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
      var error = getError(underTest, expected);

      /*
        console.log("error was: ", error);
        console.log("actual was: ", underTest);
        console.log("expected was: ", error.expected);
        console.log("expected should be: ", expected);
      */

      expect(error.expected).to.eql(expected);
      expect(error.actual).to.eql(underTest);
      expect(error.errors).to.have.length(1);
      expect(error.errors[0].message).to.eql('MismatchedValue');
      expect(error.errors[0].key).to.eql('sub');
      expect(error.errors[0].actual).to.eql(false);
      expect(error.errors[0].expected).to.eql(true);
    });
    it ('throws on non-matching sub-object properties', function(){
      var expected = {asdf:"asdf", sub:{isSub:true}};
      var underTest = {asdf:"asdf", sub:{isSub:false}};
      var error = getError(underTest, expected);
      expect(error.expected).to.eql({
        asdf: 'asdf',
        sub: {
          isSub: true
        }
      });
      expect(error.actual).to.eql(underTest);
      expect(error.errors).to.have.length(1);
      expect(error.errors[0].key).to.eql('sub');
      expect(error.errors[0].message).to.eql('MismatchedValue');
      expect(error.errors[0].actual).to.eql({isSub:false});
      expect(error.errors[0].expected).to.eql({
        isSub:true
      });
    });

    describe("when object key matching", function(){
      it ('allows matching with object properties', function(){
        var expected = {'#object': {'keys': liken.array().ofAll(/^ke/)}};
        var underTest = {"key1":"value", "key2":"value"};
        check(underTest, expected);
      });
      it ('allows matching with object properties with notation class', function(){
        var expected = liken.object().keys(liken.array().ofAll(/^ke/));
        var underTest = {"key1":"value", "key2":"value"};
        check(underTest, expected);
      });
      // TODO fix this once arrays have better "expected"s
      it ('errors for items with the wrong keys', function(){
        var expected = {'#object': {'keys': liken.array().ofAll(/^ke/)}};
        var underTest = {"key":"value", "another":"value"};
        var error = getError(underTest, expected);
        expect(error.expected).to.eql({
          key: "value",
          LikenErrors: [error.errors[0]]
        });
        expect(error.actual).to.eql(underTest);
        expect(error.errors).to.have.length(1);
        expect(error.errors[0].message).to.eql('InvalidKey');
        expect(error.errors[0].actual).to.eql('another');
        expect(error.errors[0].expected).to.eql({ '#string': { matches: '/^ke/' } });
      });
    });

    describe("#contains", function(){
      it ('does not error for excess items', function(){
        var expected = liken.object().contains({"key": "value"});
        var underTest = {"key":"value", "anotherkey":"anothervalue"};
        check(underTest, expected);
      });
      it ('errors for missing items', function(){
        var expected = liken.object().contains({"key": "value"});
        var underTest = {"anotherkey":"anothervalue"};
        var error = getError(underTest, expected);
        expect(error.expected).to.eql({anotherkey: "anothervalue", key: 'value'});
        expect(error.actual).to.eql(underTest);
        expect(error.errors).to.have.length(1);
        expect(error.errors[0].key).to.eql('key');
        expect(error.errors[0].message).to.eql('MissingValue');
        expect(error.errors[0].actual).to.eql(null);
        expect(error.errors[0].expected).to.eql("value");
      });
    });

    it ('errors for excess items', function(){
      var expected = {};
      var underTest = {"key":"value"};
      var error = getError(underTest, expected);
      expect(error.expected).to.eql(expected);
      expect(error.actual).to.eql(underTest);
      expect(error.errors).to.have.length(1);
      expect(error.errors[0].key).to.eql('key');
      expect(error.errors[0].message).to.eql('UnexpectedValue');
      expect(error.errors[0].actual).to.eql("value");
      expect(error.errors[0].expected).to.eql(null);
    });
    it ('errors for missing items', function(){
      var underTest = {};
      var expected = {"key":"value"};
      var error = getError(underTest, expected);
      expect(error.expected).to.eql(expected);
      expect(error.actual).to.eql(underTest);
      expect(error.errors).to.have.length(1);
      expect(error.errors[0].key).to.eql('key');
      expect(error.errors[0].message).to.eql('MissingValue');
      expect(error.errors[0].actual).to.eql(null);
      expect(error.errors[0].expected).to.eql("value");
    });
    it ('works for all kinds of diffs', function(){
      try {
        new PlainObjectValidator({
          firstName: String,
          fingerCount: Number,
          employed: Boolean,
          alphabet: /^[a-z]+$/,
          literally: "literally",
          someEnum: liken.oneOf(Number, "literal"),
          typedArray: liken.array().ofAll(Number),
          list: Array,
          nestedObject: {a: {b: {c: false}}} // <-- deep diff here
        }).assert({
          firstName: "Mickey",
          fingerCount:10,
          employed:true,
          alphabet: 'asdfsadf',
          literally:"literally",
          someEnum: "literal",
          typedArray:[4,5,6,7,"asdf", 8],
          list:[1,2,3,4],
          nestedObject: {a: {b: {c: true}}}
        });
      } catch (ex) {

        var expected = {
           firstName: 'Mickey',
           fingerCount: 10,
           employed: true,
           alphabet: 'asdfsadf',
           literally: 'literally',
           someEnum: 'literal',
           typedArray: [4, 5, 6, 7, {'#number': {}}, 8],
           list: [1, 2, 3, 4],
           nestedObject: { a: {b : {c : false}} }
        };
        expect(ex.expected).to.eql(expected);
      }
    });
  });

});
