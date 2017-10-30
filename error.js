
var error = {};

var AssertionError = function (message, actual, expected) {
  this.message = message;
  this.actual = actual;
  this.expected = expected;
  this.showDiff = true;

  // capture stack trace
  const ssf = arguments[`calle${"e"}`];
  if (ssf && Error.captureStackTrace) {
    Error.captureStackTrace(this, ssf);
  } else {
    try {
      throw new Error();
    } catch(e) {
      this.stack = e.stack;
    }
  }


};
AssertionError.prototype = Object.create(Error.prototype);
AssertionError.prototype.name = 'AssertionError';
AssertionError.prototype.constructor = AssertionError;

error.InvalidKey = function(actual, expected){
  const msg = `InvalidKey: expected ${JSON.stringify(actual)} to match ${JSON.stringify(expected)}`;
  const err = new AssertionError(msg, actual, expected);
  err.InvalidKey = true;
  err.key = actual;
  return err;
};

error.InvalidLength = function(actual, expected, key){
  const msg = `InvalidLength: expected ${actual} to match ${expected}`;
  const err = new AssertionError(msg, actual, expected);
  err.InvalidLength = true;
  err.expected = expected;
  err.actual = actual;
  if (key != null){
    err.key = key;
  }
  return err;
};

error.MismatchedType = function(actual, expectedType, expected, key){
  const err = new AssertionError(
    `MismatchedType: expected ${JSON.stringify(actual)} (type ${typeName(actual)}) to be of type ${expectedType}`,
    actual,
    expected
  );
  err.MismatchedType = true;
  if (key != null){
    err.key = key;
  }
  return err;
};

error.MismatchedValue = function(actual, expected, key){
  if (typeName(actual) !== typeName(expected)) {
    return error.MismatchedType(actual, typeName(expected), expected, key);
  }

  const err = new AssertionError(
    `MismatchedValue: expected ${JSON.stringify(actual)} to match ${JSON.stringify(expected)}`,
    actual,
    expected
  );
  err.MismatchedValue = true;
  if (key != null){
    err.key = key;
  }
  return err;
};

error.MissingValue = function(expected, key){
  const err = new AssertionError(`MissingValue: expected ${JSON.stringify(expected)} to exist at key ${JSON.stringify(key)}`, undefined, expected);
  err.MissingValue = true;
  err.key = key;
  return err;
};

error.UnexpectedValue = function(actual, key){
  const err = new AssertionError(`UnexpectedValue: did not expect ${JSON.stringify(actual)} to exist at key ${JSON.stringify(key)}`, actual, undefined);
  err.UnexpectedValue = true;
  err.key = key;
  return err;
};

function typeName (x) {
  // if we have an object, it might be a JSON notation so we look for that first
  if (x != null) {
    const keys = Object.keys(x);
    for (const key of keys) {
      if (key[0] === "#") {
        return key.slice(1);
      }
    }
  }

  return Object.prototype.toString.call(x).slice(8, -1).
    toLowerCase();
}

module.exports = error;
