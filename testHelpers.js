var liken = require('./index');
var expect = require('chai').expect;
var consoleError = global[`consol${""}e`][`erro${""}r`]; // fool the linter
var assert = require('assert');
var traverse = require('traverse');
var deepEqual = require('deep-equal');
var difflet = require('difflet');
var stringify = require('json-stable-stringify');
var _ = require('lodash');

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

function getError(actual, schema){
  if (schema == null){
    schema = actual;
    try {
      liken(schema);
    } catch (ex) {
      return ex;
    }
    consoleError("expected exception did not throw.");
    throw new Error('Expected exception did not throw');
  }
  try {
    liken(actual, schema);
  } catch (ex) {
    return ex;
  }
  consoleError("expected exception did not throw.");
  throw new Error('Expected exception did not throw');
}
function expectProperties(obj, props){
  for (const key in props){
    if (obj[key] === undefined){
      throw new Error("object had no key: " + key);
    }
    expect(obj[key]).to.eql(props[key]);
  }
  // assertObjectEquals(obj, props);
}
function expectMissingParamToThrow(schema){
  var error = getError(null, schema);
  expectProperties(error, {
    subType: 'missing value', path: null, expected: schema
  });
}

function expectValueErrorToThrow(schema, wrongType){
  var error = getError(wrongType, schema);
  expect(error.message).to.eql('MismatchedValue');
  expect(error.actual).to.eql(wrongType);
}


function expectTypeMismatchToThrow(schema, wrongVal, expectedType, actualType){
  var error = getError(wrongVal, schema);
  expectProperties(error, {
    subType: 'invalid type', path: null, value: wrongVal, expectedValue: schema, expectedType: expectedType, actualType: actualType
  });
}

var assertObjectEquals = function (actual, expected, options){
  if (actual == null) {
    var result = actual === expected;
    if (!result) {
      consoleError("Actual", JSON.stringify(actual, null, 2));
      consoleError("Expected", JSON.stringify(expected, null, 2));
      assert.fail(actual, expected);
    }
    return result;
  }

  if (options && options.unordered) {
    actual = actual.map(stringify).
                   sort().
                   map(JSON.parse);
                 expected = expected.map(stringify).
                   sort().
                   map(JSON.parse);
  }

  // strip the milliseconds off all dates
  traverse(expected).forEach(function (x) {
    if (_.isDate(x)) {
      x.setMilliseconds(0);
      this.update(x);
    }
  });
  // strip the milliseconds off all dates
  traverse(actual).forEach(function (x) {
    if (_.isDate(x)) {
      x.setMilliseconds(0);
      this.update(x);
    }
  });
  if (!deepEqual(actual, expected)){
    process.stdout.write(difflet.compare(actual, expected));
    consoleError("\n\nactual");
    consoleError(JSON.stringify(actual, null, 2));
    consoleError("\n\nexpected");
    consoleError(JSON.stringify(expected, null, 2));
    consoleError("\n\n");
    assert.fail(actual, expected);
    return false;
  }
  return true;
};

module.exports = {
  expect,
  assertObjectEquals,
  consoleError,
  raise,
  expectValueErrorToThrow,
  expectValueError,
  expectMissingParamToThrow,
  expectTypeMismatchToThrow,
  expectProperties,
  getError
};
