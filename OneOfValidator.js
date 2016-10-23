const error = require('./error');
const schemaToValidator = require('./schemaToValidator');

class OneOfValidator {

  /* @schema : basically anything that will denote
   * that this validator should be used.
   *
   * Creates a validator.
   **/
  constructor (schema) {
    if (!OneOfValidator.identify(schema)){
      throw new Error("Invalid schema for validator");
    }
    this.schemas = schema['#oneOf'];
    this.validators = this.schemas.map((schema) => schemaToValidator(schema));
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
    if (!this.validators.some((v) => v.validate(input))){
      throw error.MismatchedValue(input, this.toJSON());
    }
  }

  /* returns a JSON representation of the schema. */
  toJSON () {
    return {'#oneOf' : this.validators.map((v) => v.toJSON())};
  }

  /* @schema : basically anything that will denote that this
   * validator should be used.
   *
   * returns true if this validator should be used.
   */
  static identify (input) {
    return (!!input['#oneOf']);
  }

}

module.exports = OneOfValidator;
