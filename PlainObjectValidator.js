const schemaToValidator = require('./schemaToValidator');
const error = require('./error');

class PlainObjectValidator {
  constructor (schema) {
    if (!PlainObjectValidator.identify(schema)){
      throw new Error("Invalid schema for validator");
    }
    this.schema = null;
    this.options = {};
    let matches = null;
    if (schema['#object']){
      if (schema['#object'].keys){
        this.options.keys = schemaToValidator(schema['#object'].keys);
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
      for (var x in matches){
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
    const errors = [];

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
    }

    if (this.schema){
      const tested = [];
      for(var key in this.schema){
        tested.push(key);
        try {
          this.schema[key].assert(input[key]);
        } catch (ex) {
          let err = ex;
          if (input[key] == null){
            err = error.MissingValue(this.schema[key].toJSON(), key);
          }
          err.key = key;
          errors.push(err);
        }
      }

      // get the diff between tested and the keys of input.
      // those are the missing key / values on input
      for (const name in input){
        if (!tested.includes(name)){
          //const err = error.MissingValue(this.schema[name].toJSON(), name);
          const err = error.UnexpectedValue(input[name], name);
          errors.push(err);
        }
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
      for (var key in this.options){
        retval[key] = this.options[key].toJSON();
      }
    }
    return {'#object': retval};
  }

  static identify (schema) {
    // pretty incomplete, but good enough for now
    if (schema == null){
      return false;
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
