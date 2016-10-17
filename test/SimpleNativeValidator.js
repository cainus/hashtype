
const SimpleNativeValidator = require('../SimpleNativeValidator');
const testHelpers = require('../testHelpers');

const expect = testHelpers.expect;
const expectValueErrorToThrow = testHelpers.expectValueErrorToThrow;

function testLiteral(schema, unmatched){
  it ('throws error on unmatched value', function(){
    expectValueErrorToThrow(schema, unmatched);
  });
  it ('throws missing error on null', function(){
    expectValueErrorToThrow(schema, null);
  });
  it ("identifies simple natives", function(){
    expect(SimpleNativeValidator.identify(schema)).to.eql(true);
  });
  it ('allows matching values', function(){
    const validator = new SimpleNativeValidator(schema);
    expect(validator.validate(schema)).to.eql(true);
    expect(validator.toJSON()).to.eql(schema);
    validator.assert(schema); // we can check schema as input here because it's the same
  });
}

describe('SimpleNativeValidator', function(){
  describe("with strings", function(){
    testLiteral("a string", "another string");
  });
  describe("number", function(){
    testLiteral(12, 13);
  });
  describe("boolean", function(){
    testLiteral(true, false);
    it("fails when expecting true and getting false", function(){
      try {
        new SimpleNativeValidator(true).assert(false);
        throw new Error("expected error didn't throw");
      } catch (err) {
        expect(err.message).to.eql("MismatchedValue");
      }
    });
  });
});
