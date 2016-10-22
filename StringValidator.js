const error = require('./error');

function isRegExp (input) {
  return (input instanceof RegExp);
}

function isString(input){
  return (typeof input === 'string' || input instanceof String);
}

class StringValidator {

  /* @schema : basically anything that will denote
   * that this validator should be used.
   *
   * Creates a validator.
   **/
  constructor (schema) {
    if (!StringValidator.identify(schema)){
      throw new Error("Invalid schema for validator");
    }
    switch(true){
      case isRegExp(schema):
        this.schema = {
          matches: schema
        };
        break;
      case (schema === String):
        this.schema = {
          // no criteria --> any string is fine
        };
        break;
      default: throw new Error('schema could not be determined');
    }
  }

  /* @input takes some input to validate against the schema
   *
   * Returns a boolean indicating whether or not the schema
   * was passed.
   */
  validate (input) {
    try {
      this.assert(input);
    } catch(ex) {
      return false;
    }
    return true;
  }

  /* @input takes some input to validate against the schema
   *
   * throws an Error if the validation failed.  Returns
   * null otherwise.
   **/
  assert (input) {
    const options = this.schema;
    if (!isString(input)){
      throw error.MismatchedValue(input, this.toJSON());
    }
    if (options.matches != null){
      if (!options.matches.test(input)){
        throw error.MismatchedValue(input, this.toJSON());
      }
    }
  }

  /* returns a JSON representation of the schema. */
  toJSON () {
    const subSchema = {};
    if (this.schema.matches != null){
      subSchema.matches = this.schema.matches.toString();
    }
    const retval = {'#string' : subSchema};
    return retval;
  }

  /* @schema : basically anything that will denote that this
   * validator should be used.
   *
   * returns true if this validator should be used.
   */
  static identify (str) {
    if (str === String){
      return true;
    }
    if (str instanceof RegExp){
      return true;
    }
    return false;
  }

}

module.exports = StringValidator;
