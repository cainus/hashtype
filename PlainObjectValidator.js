const schemaToValidator = require('./schemaToValidator');

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
    for(var key in input){
      tested.push(key);
      if (this.schema[key] == null){
        const err = new Error('UnexpectedValue');
        err.expected = null;
        err.actual = input[key];
        errors.push(err);
      } else {
        try {
          this.schema[key].assert(input[key]);
        } catch (ex) {
          errors.push(ex);
        }
      }
    }
    // get the diff between tested and the keys of schema.
    // those are the missing key / values on input
    for (const name in this.schema){
      if (!tested.includes(name)){
        const err = new Error('MissingValue');
        err.expected = this.schema[name].toJSON();
        err.actual = null;
        errors.push(err);
      }
    }

    if (errors.length > 0){
      const err = new Error('MismatchedValue');
      err.actual = input;
      err.expected = this.toJSON();
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
