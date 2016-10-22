const error = require('./error');

class SimpleNativeValidator {

  /* @schema : basically anything that will denote
   * that this validator should be used.
   *
   * Creates a validator.
   **/
  constructor (schema) {
    if (!SimpleNativeValidator.identify(schema)){
      throw new Error("Invalid schema for validator");
    }
    this.schema = schema;
  }

  /* @input takes some input to validate against the schema
   *
   * Returns a boolean indicating whether or not the schema
   * was passed.
   */
  validate (input) {
    return this.schema === input;
  }

  /* @input takes some input to validate against the schema
   *
   * throws an Error if the validation failed.  Returns
   * null otherwise.
   **/
  assert (input) {
    if (!this.validate(input)){
      throw error.MismatchedValue(input, this.schema);
    }
  }

  /* returns a JSON representation of the schema. */
  toJSON () {
    return this.schema;
  }

  /* @schema : basically anything that will denote that this
   * validator should be used.
   *
   * returns true if this validator should be used.
   */
  static identify (schema) {
    if (['number', 'boolean'].indexOf(typeof schema) !== -1){
      return true;
    }
    if ((typeof schema === 'string') || (schema instanceof String)){
      return true;
    }
    return false;
  }

}

module.exports = SimpleNativeValidator;
