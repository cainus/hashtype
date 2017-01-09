const schemaToValidator = require('./schemaToValidator');
const error = require('./error');

class ArrayValidator {
  constructor (schema) {
    const allowedOptions = [
      'matches',
      'ofAll',
      'containing',
      'length'
    ];
    this.schema = {};
    // NB: DO NOT MUTATE schema argument
    if (!ArrayValidator.identify(schema)){
      throw new Error("Invalid schema for validator");
    }
    if (schema === Array || !schema){
      return;
    }
    if (Array.isArray(schema)){
      this.schema.matches = schema.slice();
    } else {
      // translate #array children up to the root
      allowedOptions.forEach((prop) => {
        if (schema['#array']){
          if (typeof schema['#array'][prop] !== 'undefined'){
            this.schema[prop] = schema['#array'][prop];
          }
        } else {
          if (typeof schema[prop] !== 'undefined'){
            this.schema[prop] = schema[prop];
          }
        }
      });
    }
    // translate sub values to schemas too
    if (this.schema.matches){
      this.schema.matches = this.schema.matches.map(function(item){
        return schemaToValidator(item);
      });
    }
    if (this.schema.ofAll){
      this.schema.ofAll = schemaToValidator(this.schema.ofAll);
    }
  }

  validate (input) {
    try {
      this.assert(input);
    } catch(ex) {
      return false;
    }
    return true;
  }

  assert (input) {
    if (!Array.isArray(input)){
      throw error.MismatchedValue(input, this.toJSON());
    }
    const schema = this.schema;
    const errors = [];
    var tested = [];

    if (schema.ofAll){
      input.forEach(function(item, key){
        try {
          schema.ofAll.assert(item);
        } catch (ex) {
          ex.key = key;
          errors.push(ex);
        }
      });
    }

    if (schema.length || schema.length === 0){
      if (input.length !== schema.length){
        const err = error.InvalidLength(input.length, schema.length);
        errors.push(err);
      }
    }

    if (schema.matches){
      const matches = schema.matches;
      input.forEach(function(item, key){
        tested.push(key);
        if (matches[key] == null){
          const err = error.UnexpectedValue(item, key);
          errors.push(err);
        } else {
          try {
            matches[key].assert(item);
          } catch (ex) {
            ex.key = key;
            errors.push(ex);
          }
        }
      });

      // get the diff between tested and the keys of matches.
      // those are the missing key / values on input
      matches.forEach(function(item, key){
        if (!tested.includes(key)){
          const err = error.MissingValue(matches[key].toJSON(), key);
          errors.push(err);
        }
      });
    }

    if (errors.length > 0){
      const expected = betterExpected(input, errors);
      const err = error.MismatchedValue(input, expected);
      err.errors = errors;
      throw err;
    }
  }

  toJSON () {
    const schema = this.schema;
    const json = {};
    if (schema.matches){
      json.matches = schema.matches.map(function(item){
        return item.toJSON();
      });
    }
    if (schema.length){
      json.length = schema.length;
    }
    if (schema.ofAll){
      json.ofAll = schema.ofAll.toJSON();
    }
    return {'#array' : json};
  }

  static identify (schema) {
    if (schema === Array){
      return true;
    }
    if (schema && schema['#array']){
      return true;
    }
    if (!Array.isArray(schema)){
      return false;
    }
    return true;
  }
}


/*

 Takes an actual value and an error list and creates an expected object
 that mirrors the actual value in all ways except for the error cases,
 in which case the appropriate part of the schema is substituted.

 This creates better "expected" values than just spitting out the entire
 schema, because a differ can just highlight the broken parts.

*/
function betterExpected(actual, errors) {
  const expected = actual.slice();
  const extraItemIndices = [];
  let invalidLengthError = null;
  errors.forEach(function(error, idx){
    switch(true){
      case error.UnexpectedValue:
        extraItemIndices.push(idx);
        break;
      case error.MissingValue:
        expected[error.key] = error.expected;
        break;
      case error.InvalidLength:
        invalidLengthError = error;
        break;
      case error.MismatchedValue:
        if (error.key == null){
          throw new Error("no key for mismatch error");
        }
        expected[error.key] = error.expected;
        break;
      default:
        throw new Error('unknown error type');
    }
  });
  const retval = [];
  expected.forEach(function(item, idx){
    if (!extraItemIndices.includes(idx)){
      retval.push(item);
    }
  });
  if (invalidLengthError){
    retval.push({"LikenErrors": [invalidLengthError]});
  }
  //console.log("returning: ", expected);
  return retval;
}


module.exports = ArrayValidator;
