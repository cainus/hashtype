
var error = {};

error.InvalidKey = function(actual, expected, key){
  const err = new Error('InvalidKey');
  err.InvalidKey = true;
  err.expected = expected;
  err.actual = actual;
  if (key != null){
    err.key = key;
  }
  return err;
};

error.InvalidLength = function(actual, expected, key){
  const err = new Error('InvalidLength');
  err.InvalidLength = true;
  err.expected = expected;
  err.actual = actual;
  if (key != null){
    err.key = key;
  }
  return err;
};

error.MismatchedValue = function(actual, expected, key){
  const err = new Error('MismatchedValue');
  err.MismatchedValue = true;
  err.expected = expected;
  err.actual = actual;
  if (key != null){
    err.key = key;
  }
  return err;
};

error.MissingValue = function(expected, key){
  const err = new Error('MissingValue');
  err.MissingValue = true;
  err.expected = expected;
  err.actual = null;
  err.key = key;
  return err;
};

error.UnexpectedValue = function(actual, key){
  const err = new Error('UnexpectedValue');
  err.UnexpectedValue = true;
  err.expected = null;
  err.actual = actual;
  err.key = key;
  return err;
};

module.exports = error;
