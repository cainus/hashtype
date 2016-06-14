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


describe('hashtype', function(){
  describe("validateAll", function(){
    it ('returns multiple errors where appropriate', function(){
      var ex = raise(function(){
        ht({
          firstName: String,
          answer: Number
        }).validateAll({firstName: 42, answer: "Test"});
      });
      expect(ex).to.be.an.instanceof(TypeError)
      expect(ex.message).to.eql('invalid hash type')
      expect(ex.errors).to.eql([
        {type: 'invalid type', path: 'firstName', value: 42, expected: 'String', actual: 'number'},
        {type: 'invalid type', path: 'answer', value: "Test", expected: 'Number', actual: 'string'},
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
      expect(ex.message).to.eql('invalid hash type')
      expect(ex.errors).to.eql([
        {type: 'missing property', path: 'firstName', value: null, expected: 'String', actual: null}
      ])
    });
    it ('errors when expecting a string but getting another type', function(){
      var ex = raise(function(){
        ht({
          firstName: String
        }).validate({firstName: 1234});
      });
      expect(ex).to.be.an.instanceof(TypeError)
      expect(ex.message).to.eql('invalid hash type')
      expect(ex.errors).to.eql([
        {type: 'invalid type', path: 'firstName', value: 1234, expected: 'String', actual: 'number'}
      ])
    });
    it ('errors when expecting a number but getting another type', function(){
      var ex = raise(function(){
        ht({
          answer: Number
        }).validate({answer: "42"});
      });
      expect(ex).to.be.an.instanceof(TypeError)
      expect(ex.message).to.eql('invalid hash type')
      expect(ex.errors).to.eql([
        {type: 'invalid type', path: 'answer', value: "42", expected: 'Number', actual: 'string'}
      ])
    });
    it ('errors when expecting an array but get another type', function(){
      var ex = raise(function(){
        ht({
          answers: Array
        }).validate({answers: "42"});
      });
      expect(ex).to.be.an.instanceof(TypeError)
      expect(ex.message).to.eql('invalid hash type')
      expect(ex.errors).to.eql([
        {type: 'invalid type', path: 'answers', value: "42", expected: 'Array', actual: 'string'}
      ])
    });
    it ('errors when expecting a oneOf but get another type', function(){
      var ex = raise(function(){
        ht({
          answers: oneOf(String, Number)
        }).validate({answers: true});
      });
      expect(ex).to.be.an.instanceof(TypeError)
      expect(ex.message).to.eql('invalid hash type')
      expect(ex.errors).to.eql([
        {type: 'invalid type', path: 'answers', value: true, expected: 'oneOf', actual: 'boolean'}
      ])
    });
    it ('errors when expecting a string literal but getting another type', function(){
      var ex = raise(function(){
        ht({
          answer: "yellow"
        }).validate({answer: "42"});
      });
      expect(ex).to.be.an.instanceof(TypeError)
      expect(ex.message).to.eql('invalid hash type')
      expect(ex.errors).to.eql([
        {type: 'invalid value', path: 'answer', value: "42", expected: 'yellow', actual: "42"}
      ])
    });
    // TODO
    xit ('errors when expecting an array of numbers but getting another type of array', function(){
      var ex = raise(function(){
        ht({
          answer: [Number]
        }).validate({answer: ["42"]});
      });
      expect(ex).to.be.an.instanceof(TypeError)
      expect(ex.message).to.eql('invalid hash type')
      expect(ex.errors).to.eql([
        // TODO: make undefined be Number
        {type: 'invalid type', path: 'answer', value: "42", expected: [undefined], actual: "string"}
      ])
    });
    it ('errors when expecting a string matching a regex but gets another string', function(){
      var ex = raise(function(){
        ht({
          answer: /^[a-z]+$/
        }).validate({answer: "42"});
      });
      expect(ex).to.be.an.instanceof(TypeError)
      expect(ex.message).to.eql('invalid hash type')
      expect(ex.errors).to.eql([
        {type: 'invalid value', path: 'answer', value: "42", expected: /^[a-z]+$/, actual: "42"}
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
