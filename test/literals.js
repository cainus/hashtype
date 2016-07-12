var liken = require('../index');

//var optional = ht.optional;
//var oneOf = ht.oneOf;
var expect = require('chai').expect;

function raise(fn){
  try {
    var retval = fn();
  } catch(ex){
    return ex;
  }
  console.error("expected exception did not throw. return value: ", retval);
  throw new Error('Expected exception did not throw');
}

function expectValueError(fn){
  var ex = raise(fn);
  expect(ex).to.be.an.instanceof(Error);
  if (!ex.ValueError){
    console.error("Non-Value Error thrown: ", ex, ex.stack);
  }
  expect(ex.ValueError).to.eql(true);
  expect(ex.message).to.eql('Value Error');
  return ex;
}

function getError(schema, actual){
  return expectValueError(function(){
    liken(schema).to(actual);
  });
}
function expectProperties(obj, props){
  for (key in props){
    expect(obj[key]).to.eql(props[key]);
  }
}
function expectMissingParamToThrow(schema){
  var error = getError(schema);
  expectProperties(error, {
    subType: 'missing value', path: null, expected: schema
  });
}
function expectValueMismatchToThrow(schema, wrongType){
  var error = getError(schema, wrongType);
  expectProperties(error, {
    subType: 'invalid value', path: null, expected: schema, actual: wrongType
  });
}
function expectTypeMismatchToThrow(schema, wrongVal, expectedType, actualType){
  var error = getError(schema, wrongVal);
  expectProperties(error, {
    subType: 'invalid type', path: null, value: wrongVal, expectedValue: schema, expectedType: expectedType, actualType: actualType
  });
}

function testLiteral(val, unmatched, wrongType, expectedType, actualType){
  it ('throws error on unmatched value', function(){
    expectValueMismatchToThrow(val, unmatched);
  });
  it ('throws error on wrong type', function(){
    expectTypeMismatchToThrow(val, wrongType, expectedType, actualType);
  });
  it ('throws missing error on null', function(){
    expectMissingParamToThrow(val);
  });
  it ('allows matching values', function(){
    liken(val).to(val);
  });
}

describe('liken literals', function(){
  describe("string", function(){
    testLiteral("a string", "another string", 12, "string", "number");
  });
  describe("number", function(){
    testLiteral(12, 13, "not number", "number", "string");
  });
  describe("boolean", function(){
    testLiteral(true, false, "not boolean", "boolean", "string");
  });
  describe("arrays of literals", function(){
    it ('throws error on wrong type', function(){
      expectTypeMismatchToThrow([], 'asdf', 'array', 'string');
    });
    it ('throws missing error on null', function(){
      expectMissingParamToThrow([]);
    });
    it ('allows matching values', function(){
      liken([]).to([]);
    });
    it ('errors for excess items', function(){
      var error = getError([], ["asdf"]);
      //console.log("error: ", error);
      expectProperties(error, {
        subType: 'invalid value', path: null, expected: [], actual: ["asdf"]
      });
      expect(error.errors).to.have.length(1);
      expectProperties(error.errors[0], {
        subType: 'excess value', path: [0], actual: "asdf"
      });
    });
    it ('errors for missing items', function(){
      var error = getError(["asdf"], []);
      expectProperties(error, {
        subType: 'invalid value', path: null, expected: ["asdf"], actual: []
      });
      expect(error.errors).to.have.length(1);
      expectProperties(error.errors[0], {
        subType: 'missing value', path: [0], expected: "asdf"
      });
    });
  });
  describe("objects of literals", function(){
    it('throws error on wrong type', function(){
      expectTypeMismatchToThrow({}, 'asdf', 'object', 'string');
    });
    it ('throws missing error on null', function(){
      expectMissingParamToThrow({});
    });
    it ('allows matching empty values', function(){
      liken({}).to({});
    });
    it ('allows matching values', function(){
      liken({asdf:"asdf"}).to({asdf:"asdf"});
    });
    it ('errors for excess items', function(){
      var error = getError({}, {"key":"value"});
      //console.log("error: ", error);
      expectProperties(error, {
        subType: 'invalid value', path: null, expected: {}, actual: {"key":"value"}
      });
      expect(error.errors).to.have.length(1);
      expectProperties(error.errors[0], {
        subType: 'excess value', path: ["key"], actual: "value"
      });
    });
    it ('errors for missing items', function(){
      var error = getError({"key":"value"}, {});
      expectProperties(error, {
        subType: 'invalid value', path: null, expected: {"key":"value"}, actual: {}
      });
      expect(error.errors).to.have.length(1);
      expectProperties(error.errors[0], {
        subType: 'missing value', path: ["key"], expected: "value"
      });
    });

  });
});
