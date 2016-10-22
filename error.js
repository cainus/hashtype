
var error = {};


error.MismatchedValue = function(actual, expected, key){
  const err = new Error('MismatchedValue');
  err.expected = expected;
  err.actual = actual;
  if (key != null){
    err.key = key;
  }
  return err;
};

error.MissingValue = function(expected, key){
  const err = new Error('MissingValue');
  err.expected = expected;
  err.actual = null;
  err.key = key;
  return err;
};

error.UnexpectedValue = function(actual, key){
  const err = new Error('UnexpectedValue');
  err.expected = null;
  err.actual = actual;
  err.key = key;
  return err;
};

module.exports = error;
