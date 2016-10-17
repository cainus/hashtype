var liken = require('../index');
const testHelpers = require('../testHelpers');

const expect = testHelpers.expect;
const expectValueErrorToThrow = testHelpers.expectValueErrorToThrow;
const getError = testHelpers.getError;

describe('liken literals', function(){
  describe("arrays of literals", function(){
    it ('throws error on wrong type', function(){
      expectValueErrorToThrow([], 'asdf', 'array', 'string');
    });
    it ('throws value error on null', function(){
      expectValueErrorToThrow([]);
    });
    it ('allows matching values', function(){
      liken([], []);
    });
    it ('errors for excess items', function(){
      var error = getError(["asdf"], []);
      expect(error.message).to.eql("MismatchedValue");
      expect(error.expected).to.eql([]);
      expect(error.actual).to.eql(["asdf"]);
      expect(error.errors).to.have.length(1);
      var subError = error.errors[0];
      expect(subError.message).to.eql("UnexpectedValue");
      expect(subError.actual).to.eql("asdf");
      expect(subError.expected).to.eql(null);
    });
    it ('errors for missing items', function(){
      var error = getError([], ["asdf"]);
      expect(error.message).to.eql("MismatchedValue");
      expect(error.expected).to.eql(["asdf"]);
      expect(error.actual).to.eql([]);
      expect(error.errors).to.have.length(1);
      var subError = error.errors[0];
      expect(subError.message).to.eql("MissingValue");
      expect(subError.actual).to.eql(null);
      expect(subError.expected).to.eql("asdf");
    });
  });
});
