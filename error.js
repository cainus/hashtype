
var errors = {};

errors.invalidType = function(path, expectedType, value, expectedValue){
  //console.log("invalidtype: ", expectedType);
  //if (Array.isArray(expectedType)){
  //  expectedType = JSON.stringify(expectedType);
  //  console.log("stringif: ", expectedType);
  //}
  var errorData = {subType: 'invalid type', path: path, value: value, expectedType: expectedType, actualType: typeof value}
  if (expectedValue){
    errorData.expectedValue = expectedValue;
  }
  return errorData;
}
errors.invalidValue = function(path, expected, value){
  return {subType: 'invalid value', path: path, expected: expected, actual: value}
}
errors.missingValue = function(path, expected){
  return {subType: 'missing value', path: path, expected: expected}
}
errors.excessValue = function(path, actual){
  return {subType: 'excess value', path: path, actual: actual}
}

module.exports = errors;
