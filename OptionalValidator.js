const schemaToValidator = require('./schemaToValidator');

class OptionalValidator {

  /* @schema : basically anything that will denote
   * that this validator should be used.
   *
   * Creates a validator.
   **/
  constructor (schema) {
    if (!OptionalValidator.identify(schema)){
      throw new Error("Invalid schema for validator");
    }
    this.validator = schemaToValidator(schema['#optional']);
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
    if (input != null){
      this.validator.assert(input);
    }
  }

  /* returns a JSON representation of the schema. */
  toJSON () {
    return {'#optional' : this.validator.toJSON()};
  }

  /* @schema : basically anything that will denote that this
   * validator should be used.
   *
   * returns true if this validator should be used.
   */
  static identify (input) {
    return (input['#optional'] != null);
  }

}

module.exports = OptionalValidator;
