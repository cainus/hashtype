const schemaToValidator = require('./schemaToValidator');
const error = require('./error');

class PlainObjectValidator {
  constructor (schema) {
    if (!PlainObjectValidator.identify(schema)){
      throw new Error("Invalid schema for validator");
    }
    this.schema = {};
    for (var x in schema){
      this.schema[x] = schemaToValidator(schema[x]);
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
    var tested = [];
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

    if (errors.length > 0){
      const err = error.MismatchedValue(input, this.toJSON());
      err.errors = errors;
      throw err;
    }
  }

  toJSON () {
    const retval = {};
    for (const x in this.schema){
      retval[x] = this.schema[x].toJSON();
    }
    return retval;
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
