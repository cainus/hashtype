var liken = require('../index');
const testHelpers = require('../testHelpers');

const expect = testHelpers.expect;
const expectValueMismatchToThrow = testHelpers.expectValueMismatchToThrow;
const expectMissingParamToThrow = testHelpers.expectMissingParamToThrow;
const expectTypeMismatchToThrow = testHelpers.expectTypeMismatchToThrow;
const expectProperties = testHelpers.expectProperties;
const getError = testHelpers.getError;

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
});
