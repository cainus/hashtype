const schemaToValidator = require('./schemaToValidator');
const error = require('./error');

class ArrayValidator {
  constructor (schema) {
    if (!ArrayValidator.identify(schema)){
      throw new Error("Invalid schema for validator");
    }
    this.schema = schema.map(function(item){
      return schemaToValidator(item);
    });
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
    const errors = [];
    var tested = [];
    for(var key in input){
      tested.push(key);
      if (this.schema[key] == null){
        const err = error.UnexpectedValue(input[key], key);
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
        const err = error.MissingValue(this.schema[name].toJSON(), name);
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
    const json = this.schema.map(function(item){
      return item.toJSON();
    });
    return json;
  }

  static identify (schema) {
    if (!Array.isArray(schema)){
      return false;
    }
    return true;
  }
}


module.exports = ArrayValidator;
