const schemaToValidator = require('./schemaToValidator');
const error = require('./error');


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
          let err = ex;
          err = error.InvalidKey(this.options.keys.toJSON(), actualKeys);
          errors.push(err);
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
      const err = error.MismatchedValue(input, this.toJSON());
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


module.exports = PlainObjectValidator;
