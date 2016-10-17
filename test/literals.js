var liken = require('../index');
const testHelpers = require('../testHelpers');

const expect = testHelpers.expect;
const expectMissingParamToThrow = testHelpers.expectMissingParamToThrow;
const expectTypeMismatchToThrow = testHelpers.expectTypeMismatchToThrow;
const expectProperties = testHelpers.expectProperties;
const getError = testHelpers.getError;

describe('liken literals', function(){
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
