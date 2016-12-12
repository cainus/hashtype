const schemaToValidator = require('./schemaToValidator');
const error = require('./error');
const InvalidKey = error.InvalidKey;


function testObjectAgainstSchema (input, schema, options) {
  // A schema here is a plain object, with schema objects as the values in it
  // The options object can contain a boolean `partial` value to indicate if
  // extra values are okay
  const errors = [];
  const tested = [];

  options = options || {};
  options.partial = options.partial || false;

  for(const key in schema){
    tested.push(key);
    try {
      schema[key].assert(input[key]);
    } catch (ex) {
      let err = ex;
      if (input[key] == null){
        err = error.MissingValue(schema[key].toJSON(), key);
      }
      err.key = key;
      errors.push(err);
    }
  }

  if (!options.partial){
    // get the diff between tested and the keys of input.
    // those are the unexpected key / values on input
    for (const name in input){
      if (!tested.includes(name)){
        const err = error.UnexpectedValue(input[name], name);
        errors.push(err);
      }
    }
  }

  return errors;
}


class PlainObjectValidator {
  constructor (schema) {
    if (!PlainObjectValidator.identify(schema)){
      throw new Error("Invalid schema for validator");
    }
    this.schema = null;
    this.options = {};
    if (schema === Object){
      // no criteria for matching.  Any object works
      return;
    }
    let matches = null;
    if (schema['#object']){
      if (schema['#object'].keys){
        this.options.keys = schemaToValidator(schema['#object'].keys);
      }
      if (schema['#object'].contains){
        const contains = schema['#object'].contains;
        this.options.contains = {};
        for (const x in contains){
          this.options.contains[x] = schemaToValidator(contains[x]);
        }
      }
      if (schema['#object'].matches){
        matches = schema['#object'].matches;
      }
    } else {
      if (schema){
        matches = schema;
      }
    }
    if (matches){
      this.schema = {};
      for (const x in matches){
        this.schema[x] = schemaToValidator(matches[x]);
      }
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
    let errors = [];

    if (this.options){

      if (this.options.keys){
        const actualKeys = Object.keys(input);
        try {
          this.options.keys.assert(actualKeys);
        } catch (ex) {
          ex.errors.forEach(function(subError){
            errors.push(
              InvalidKey(
                subError.actual,
                subError.expected,
                subError.actual
              )
            );
          });
        }
      }

      if (this.options.contains){
        const schemaErrors = testObjectAgainstSchema(input, this.options.contains, {partial: true});
        if (schemaErrors.length){
          errors = errors.concat(schemaErrors);
        }
      }

    }

    if (this.schema){
      const schemaErrors = testObjectAgainstSchema(input, this.schema);
      if (schemaErrors.length){
        errors = errors.concat(schemaErrors);
      }
    }

    if (errors.length > 0){
      const expected = betterExpected(input, errors);
      const err = error.MismatchedValue(input, expected);
      err.errors = errors;
      throw err;
    }
  }

  toJSON () {
    const retval = {};
    if (this.schema){
      retval.matches = {};
      for (const x in this.schema){
        retval.matches[x] = this.schema[x].toJSON();
      }
    }
    if (this.options){
      if (this.options.keys){
        retval.keys = this.options.keys.toJSON();
      }
      if (this.options.contains){
        retval.contains = {};
        for (const x in this.options.contains){
          retval.contains[x] = this.options.contains[x].toJSON();
        }
      }
    }
    return {'#object': retval};
  }

  static identify (schema) {
    // pretty incomplete, but good enough for now
    if (schema == null){
      return false;
    }
    if (schema === Object){
      return true;
    }
    var type = typeof schema;
    if (type !== 'object'){
      return false;
    }
    if (Array.isArray(schema)){
      return false;
    }
    if (schema instanceof Date){
      return false;
    }
    if (schema instanceof String){
      return false;
    }
    if (schema instanceof Number){
      return false;
    }
    if (schema instanceof Boolean){
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
  const expected = {};
  for (const key in actual){
    expected[key] = actual[key];
  }
  let invalidKeyError = null;
  errors.forEach(function(error){
    if (error.key){
      switch(true){
        case error.InvalidKey:
          invalidKeyError = error;
          break;
        case error.MissingValue:
          expected[error.key] = error.expected;
          break;
        case error.UnexpectedValue:
          delete expected[error.key];
          break;
        case error.MismatchedValue:
          expected[error.key] = error.expected;
          break;
        default:
          throw new Error("unknown error type");
          //expected[error.key] = error.expected;
      }
    }
  });
  if (invalidKeyError){
    delete expected[invalidKeyError.actual];
    expected.LikenErrors = [invalidKeyError];
  }
  return expected;
}

module.exports = PlainObjectValidator;
