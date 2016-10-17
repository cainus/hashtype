
const SimpleNativeValidator = require('../SimpleNativeValidator');
const testHelpers = require('../testHelpers');

const expect = testHelpers.expect;
const expectValueMismatchToThrow = testHelpers.expectValueMismatchToThrow;
const expectMissingParamToThrow = testHelpers.expectMissingParamToThrow;
const expectTypeMismatchToThrow = testHelpers.expectTypeMismatchToThrow;

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
  it ("identifies simple natives", function(){
    expect(SimpleNativeValidator.identify(val)).to.eql(true);
  });
  it ('allows matching values', function(){
    const validator = new SimpleNativeValidator(val);
    expect(validator.validate(val)).to.eql(true);
    expect(validator.toJSON()).to.eql(val);
    validator.assert(val);
  });
}

describe('SimpleNativeValidator', function(){
  describe("with strings", function(){
    testLiteral("a string", "another string", 12, "string", "number");
  });
  describe("number", function(){
    testLiteral(12, 13, "not number", "number", "string");
  });
  describe("boolean", function(){
    testLiteral(true, false, "not boolean", "boolean", "string");
    it("fails when expecting true and getting false", function(){
      try {
        new SimpleNativeValidator(true).assert(false);
        throw new Error("expected error didn't throw");
      } catch (err) {
        expect(err.message).to.eql("ValueError");
      }
    });
  });
});
