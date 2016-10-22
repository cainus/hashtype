
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
  describe("null", function(){
    it ('throws error on unmatched value', function(){
      try {
        new SimpleNativeValidator(null).assert(false);
        throw new Error("expected exception was not raised");
      } catch (ex) {
        expect(ex.message).to.eql('MismatchedValue');
        expect(ex.actual).to.eql(false);
        expect(ex.expected).to.eql(null);
      }
    });
    it ("identifies simple natives", function(){
      expect(SimpleNativeValidator.identify(null)).to.eql(true);
    });
    it ('allows matching values', function(){
      const validator = new SimpleNativeValidator(null);
      expect(validator.validate(null)).to.eql(true);
      expect(validator.validate(false)).to.eql(false);
      expect(validator.toJSON()).to.eql(null);
      validator.assert(null); // we can check schema as input here because it's the same
    });
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
