let factory;

class AssertionError extends Error {
  constructor (message, actual, expected) {
    if (factory == null) factory = require("./");
    super(message);
    this.actual = actual;
    this.expected = expected;
    this.showDiff = true;
    Error.captureStackTrace(this, factory);
  }
}
AssertionError.prototype.name = 'AssertionError';

class InvalidKey extends AssertionError {
  constructor (actual, expected) {
    const message = `InvalidKey: expected ${JSON.stringify(actual)} to match ${JSON.stringify(expected)}`;
    super(message, actual, expected);
    this.InvalidKey = true;
    this.key = actual;
  }
}

class InvalidLength extends AssertionError {
  constructor (actual, expected, key) {
    const message = `InvalidLength: expected ${actual} to match ${expected}`;
    super(message, actual, expected);
    this.InvalidLength = true;
    this.expected = expected;
    this.actual = actual;
    if (key != null){
      this.key = key;
    }
  }
}

class MismatchedType extends AssertionError {
  constructor (actual, expectedType, expected, key) {
    const message = `MismatchedType: expected ${JSON.stringify(actual)} (type ${typeName(actual)}) to be of type ${expectedType}`;
    super(message, actual, expected);
    this.MismatchedType = true;
    if (key != null){
      this.key = key;
    }
  }
}

class MismatchedValue extends AssertionError {
  constructor (actual, expected, key) {
    if (typeName(actual) !== typeName(expected)) {
      return new MismatchedType(actual, typeName(expected), expected, key);
    }

    const message = `MismatchedValue: expected ${JSON.stringify(actual)} to match ${JSON.stringify(expected)}`;
    super(message, actual, expected);
    this.MismatchedValue = true;
    if (key != null){
      this.key = key;
    }
  }
}

class MissingValue extends AssertionError {
  constructor (expected, key) {
    const message = `MissingValue: expected ${JSON.stringify(expected)} to exist at key ${JSON.stringify(key)}`;
    super(message, undefined, expected);
    this.MissingValue = true;
    this.key = key;
  }
}

class UnexpectedValue extends AssertionError {
  constructor (actual, key) {
    const message = `UnexpectedValue: did not expect ${JSON.stringify(actual)} to exist at key ${JSON.stringify(key)}`;
    super(message, actual);
    this.UnexpectedValue = true;
    this.key = key;
  }
}

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

module.exports = {
  InvalidKey,
  InvalidLength,
  MismatchedType,
  MismatchedValue,
  MissingValue,
  UnexpectedValue,
};
