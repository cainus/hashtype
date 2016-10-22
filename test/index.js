const liken = require('../index');
//var optional = liken.optional;
// var oneOf = liken.oneOf;
var expect = require('chai').expect;
// TODO what about default values?!?

function raise(fn){
  try {
    fn();
  } catch(ex){
    return ex;
  }
  throw new Error('Expected exception did not throw');
}


describe('liken (index.js)', function(){
  describe("validateAll", function(){
    // TODO later: handle type checks only
    xit ('returns multiple errors where appropriate', function(){
      var ex = raise(function(){
        liken({
          firstName: 42, answer: "Test"
        },{
          firstName: String,
          answer: Number
        });
      });
      expect(ex).to.be.an.instanceof(TypeError);
      expect(ex.message).to.eql('invalid type');
      expect(ex.errors).to.eql([
        {subType: 'invalid type', path: 'firstName', value: 42, expectedType: 'String', actualType: 'number'},
        {subType: 'invalid type', path: 'answer', value: "Test", expectedType: 'Number', actualType: 'string'},
      ]);
    });
  });
  describe("validate", function(){
    // TODO later: handle type checks only
    xit ('errors when missing expected strings', function(){
      var ex = raise(function(){
        liken({}, {
          firstName: String
        });
      });
      expect(ex).to.be.an.instanceof(TypeError);
      expect(ex.message).to.eql('invalid type');
      expect(ex.errors).to.eql([
        {subType: 'missing value', path: 'firstName', expected: 'String'}
      ]);
    });
    // TODO later: handle type checks only
    xit ('errors when expecting a string but getting another type', function(){
      var ex = raise(function(){
        liken({firstName: 1234}, {
          firstName: String
        });
      });
      expect(ex).to.be.an.instanceof(TypeError);
      expect(ex.message).to.eql('invalid type');
      expect(ex.errors).to.eql([
        {subType: 'invalid type', path: 'firstName', value: 1234, expectedType: 'String', actualType: 'number'}
      ]);
    });
    // TODO later: handle type checks only
    xit ('errors when expecting a number but getting another type', function(){
      var ex = raise(function(){
        liken({
          answer: "42"
        }, {
          answer: Number
        });
      });
      expect(ex).to.be.an.instanceof(TypeError);
      expect(ex.message).to.eql('invalid type');
      expect(ex.errors).to.eql([
        {subType: 'invalid type', path: 'answer', value: "42", expectedType: 'Number', actualType: 'string'}
      ]);
    });
    // TODO later: handle type checks only
    xit ('errors when expecting an array but get another type', function(){
      var ex = raise(function(){
        liken({
          answers: "42"
        },{
          answers: Array
        });
      });
      expect(ex).to.be.an.instanceof(TypeError);
      expect(ex.message).to.eql('invalid type');
      expect(ex.errors).to.eql([
        {subType: 'invalid type', path: 'answers', value: "42", expectedType: 'Array', actualType: 'string'}
      ]);
    });
    // TODO later
    /*
    xit ('errors when expecting a oneOf but get another type', function(){
      var ex = raise(function(){
        liken({
          answers: oneOf(String, Number)
        }).validate({answers: true});
      });
      expect(ex).to.be.an.instanceof(TypeError);
      expect(ex.message).to.eql('invalid type');
      expect(ex.errors).to.eql([
        {subType: 'invalid type', path: 'answers', value: true, expectedType: 'oneOf', actualType: 'boolean'}
      ]);
    });
    */
    it ('matches dates', function(){
      var date = new Date();
      var copiedDate = new Date(date.getTime());
      liken({
        answer: date
      },{
        answer: copiedDate
      });
    });
    it ('errors when expecting a string literal but getting a wrong value', function(){
      var ex = raise(function(){
        liken({
          answer: "42"
        },{
          answer: "yellow"
        });
      });
      expect(ex.message).to.eql('MismatchedValue');
      expect(ex.actual).to.eql({answer: "42"});
      expect(ex.expected).to.eql({answer: "yellow"});
    });
    it ('errors when expecting a string matching a regex but gets another string', function(){
      var ex = raise(function(){
        liken({
          answer: "42"
        },{
          answer: /^[a-z]+$/
        });
      });
      expect(ex).to.be.an.instanceof(Error);
      expect(ex.message).to.eql('MismatchedValue');
      expect(ex.errors).to.have.length(1);
      expect(ex.errors[0].key).to.eql('answer');
      expect(ex.errors[0].expected).to.eql({"#string":{"matches":"/^[a-z]+$/"}});
      expect(ex.errors[0].actual).to.eql("42");
    });
    xit ('returns true when matching', function(){
      expect(
        liken({
          firstName: String,
          fingerCount: Number,
          //employed: Boolean,
          alphabet: /^[a-z]+$/,
          literally: "literally",
          //someEnum: oneOf(Number, "literal"),
          //typedArray: [Number],
          //list: Array
        }, {
          firstName: "Mickey",
          fingerCount:10,
          //employed:true,
          alphabet: 'asdfsadf',
          literally:"literally",
          //someEnum: "literal",
          //typedArray:[4,5,6,7,8],
          //list:[1,2,3,4]
        })
      ).to.eql(true);
    });
    // TODO later.  this gets us option hash param validation
    xit ('returns true when an optional parameter is missing', function(){
      const optional = liken.optional;
      expect(
        liken({
          firstName: String,
          lastName: optional(String),
          fingerCount: optional(Number),
          employed: optional(Boolean),
          alphabet: optional(/^[a-z]+$/),
          literally: optional("literally"),
          //maybeEnum: optional(oneOf(Number, String)),
          list: optional(Array)
        }).validate({
          firstName: "Mickey"
        })
      ).to.eql(true);
    });
  });
  // TODO later, for adding additional types (mongoid?!)
  // TODO maybe these should be wrapped with an extended() for easier identification?
  xdescribe("extended types", function(){
    it ('returns true when matching', function(){
      const optional = liken.optional;
      expect(
        liken({
          firstName: function(val){ return /^[a-zA-Z]+$/.test(val); },
          lastName: optional(function(val){ return /^[a-zA-Z]+$/.test(val); }),
        }).validate({
          firstName: "Mickey"
        })
      ).to.eql(true);
    });
  });
});

// TODO typed arrays
// type("array", String), type("any"), type("array"
