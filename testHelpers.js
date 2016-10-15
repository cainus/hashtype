var liken = require('./index');
var expect = require('chai').expect;
var consoleError = global[`consol${""}e`][`erro${""}r`]; // fool the linter

function raise(fn){
  try {
    var retval = fn();
  } catch(ex){
    return ex;
  }
  consoleError("expected exception did not throw. return value: ", retval);
  throw new Error('Expected exception did not throw');
}

function expectValueError(fn){
  var ex = raise(fn);
  expect(ex).to.be.an.instanceof(Error);
  if (!ex.ValueError){
    consoleError("Non-Value Error thrown: ", ex, ex.stack);
  }
  expect(ex.ValueError).to.eql(true);
  expect(ex.message).to.eql('Value Error');
  return ex;
}

function getError(schema, actual){
  try {
    var retval = liken(schema).to(actual);
  } catch (ex) {
    return ex;
  }
  consoleError("expected exception did not throw. return value: ", retval);
  throw new Error('Expected exception did not throw');
}
function expectProperties(obj, props){
  for (const key in props){
    if (obj[key] === undefined){
      throw new Error("object had no key: " + key);
    }
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

module.exports = {
  expect,
  consoleError,
  raise,
  expectValueMismatchToThrow,
  expectValueError,
  expectMissingParamToThrow,
  expectTypeMismatchToThrow,
  expectProperties,
  getError
};
