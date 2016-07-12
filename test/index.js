var ht = require('../index');
var optional = ht.optional;
var oneOf = ht.oneOf;
var expect = require('chai').expect;

function raise(fn){
  try {
    fn();
  } catch(ex){
    return ex;
  }
  throw new Error('Expected exception did not throw')
}


describe('liken (index.js)', function(){
  describe("validateAll", function(){
    it ('returns multiple errors where appropriate', function(){
      var ex = raise(function(){
        ht({
          firstName: String,
          answer: Number
        }).validateAll({firstName: 42, answer: "Test"});
      });
      expect(ex).to.be.an.instanceof(TypeError)
      expect(ex.message).to.eql('invalid type')
      expect(ex.errors).to.eql([
        {subType: 'invalid type', path: 'firstName', value: 42, expectedType: 'String', actualType: 'number'},
        {subType: 'invalid type', path: 'answer', value: "Test", expectedType: 'Number', actualType: 'string'},
      ])
    });
  });
  describe("validate", function(){
    it ('errors when missing expected strings', function(){
      var ex = raise(function(){
        ht({
          firstName: String
        }).validate({});
      });
      expect(ex).to.be.an.instanceof(TypeError)
      expect(ex.message).to.eql('invalid type')
      expect(ex.errors).to.eql([
        {subType: 'missing value', path: 'firstName', expected: 'String'}
      ])
    });
    it ('errors when expecting a string but getting another type', function(){
      var ex = raise(function(){
        ht({
          firstName: String
        }).validate({firstName: 1234});
      });
      expect(ex).to.be.an.instanceof(TypeError)
      expect(ex.message).to.eql('invalid type')
      expect(ex.errors).to.eql([
        {subType: 'invalid type', path: 'firstName', value: 1234, expectedType: 'String', actualType: 'number'}
      ])
    });
    it ('errors when expecting a number but getting another type', function(){
      var ex = raise(function(){
        ht({
          answer: Number
        }).validate({answer: "42"});
      });
      expect(ex).to.be.an.instanceof(TypeError)
      expect(ex.message).to.eql('invalid type')
      expect(ex.errors).to.eql([
        {subType: 'invalid type', path: 'answer', value: "42", expectedType: 'Number', actualType: 'string'}
      ])
    });
    it ('errors when expecting an array but get another type', function(){
      var ex = raise(function(){
        ht({
          answers: Array
        }).validate({answers: "42"});
      });
      expect(ex).to.be.an.instanceof(TypeError)
      expect(ex.message).to.eql('invalid type')
      expect(ex.errors).to.eql([
        {subType: 'invalid type', path: 'answers', value: "42", expectedType: 'Array', actualType: 'string'}
      ])
    });
    it ('errors when expecting a oneOf but get another type', function(){
      var ex = raise(function(){
        ht({
          answers: oneOf(String, Number)
        }).validate({answers: true});
      });
      expect(ex).to.be.an.instanceof(TypeError)
      expect(ex.message).to.eql('invalid type')
      expect(ex.errors).to.eql([
        {subType: 'invalid type', path: 'answers', value: true, expectedType: 'oneOf', actualType: 'boolean'}
      ])
    });
    it ('errors when expecting a string literal but getting another type', function(){
      var ex = raise(function(){
        ht({
          answer: "yellow"
        }).validate({answer: "42"});
      });
      expect(ex).to.be.an.instanceof(TypeError)
      expect(ex.message).to.eql('invalid type')
      expect(ex.errors).to.eql([
        {subType: 'invalid value', path: 'answer', expected: 'yellow', actual: "42"}
      ])
    });
    it ('errors when expecting an array of numbers but getting another type of array', function(){
      var ex = raise(function(){
        ht({
          answer: ht.array({type:Number})
        }).validate({answer: ["42"]});
      });
      expect(ex).to.be.an.instanceof(TypeError)
      expect(ex.message).to.eql('invalid type')
      expect(ex.errors).to.eql([
        // TODO: error output kind of sucks
        {subType: 'invalid type', path: 'answer', value: ["42"], expectedType: 'Array', actualType: "object"}
      ])
    });
    it ('errors when expecting a string matching a regex but gets another string', function(){
      var ex = raise(function(){
        ht({
          answer: /^[a-z]+$/
        }).validate({answer: "42"});
      });
      expect(ex).to.be.an.instanceof(TypeError)
      expect(ex.message).to.eql('invalid type')
      expect(ex.errors).to.eql([
        {subType: 'invalid value', path: 'answer', expected: /^[a-z]+$/, actual: "42"}
      ])
    });
    it ('returns true when matching', function(){
      expect(
        ht({
          firstName: String,
          fingerCount: Number,
          employed: Boolean,
          alphabet: /^[a-z]+$/,
          literally: "literally",
          someEnum: oneOf(Number, "literal"),
          //typedArray: [Number],
          list: Array
        }).validate({
          firstName: "Mickey",
          fingerCount:10,
          employed:true,
          alphabet: 'asdfsadf',
          literally:"literally",
          someEnum: "literal",
          //typedArray:[4,5,6,7,8],
          list:[1,2,3,4]
        })
      ).to.eql(true);
    });
    it ('returns true when an optional parameter is missing', function(){
      expect(
        ht({
          firstName: String,
          lastName: optional(String),
          fingerCount: optional(Number),
          employed: optional(Boolean),
          alphabet: optional(/^[a-z]+$/),
          literally: optional("literally"),
          maybeEnum: optional(oneOf(Number, String)),
          list: optional(Array)
        }).validate({
          firstName: "Mickey"
        })
      ).to.eql(true);
    });
  });
  describe("extended types", function(){
    it ('returns true when matching', function(){
      expect(
        ht({
          firstName: function(val){ return /^[a-zA-Z]+$/.test(val); },
          lastName: optional(function(val){ return /^[a-zA-Z]+$/.test(val); }),
        }).validate({
          firstName: "Mickey"
        })
      ).to.eql(true);
    });
  });
  describe("#toJsonSchema", function(){
    it ("works", function(){
      expect(ht({
        firstName: String,
        lastName: optional(String),
        fingerCount: Number,
        alpha: optional(/^[a-z]+$/),
        employed: Boolean,
        literal: "literal!",
        stringNumber: oneOf(String, Number),
      }).toJsonSchema()).to.eql({
        type: "object",
        properties: {
          firstName:{
            type: "string",
            required: true
          },
          lastName:{
            type: "string",
            required: false
          },
          fingerCount:{
            type: "number",
            required: true
          },
          alpha: {
            type: "string",
            pattern: '^[a-z]+$',
            required: false,
          },
          employed:{
            type: "boolean",
            required: true
          },
          literal:{
            enum: ["literal!"],
            required: true
          },
          stringNumber:{
            enum: [
              { type: "string" },
              { type: "number" }
            ],
            required: true
          }
        },
        allowAdditionalProperties: false
      })
    });
  });
  it("fails for the function type", function(){
    var ex = raise(function(){
      ht({
        someFn: function(){}
      }).toJsonSchema()
    });
    expect(ex).to.be.an.instanceof(Error);
    expect(ex.message).to.eql('unsupported jsonschema type: function (){}');
  });
});

// TODO nesting!
// TODO literals!
// TODO typed arrays
// type("array", String), type("any"), type("array"
