

function getError (actual, expected) {
  const err = new Error('MismatchedValue');
  err.actual = actual;
  err.expected = expected;
  return err;
}

class NumberValidator {

  /* @schema : basically anything that will denote
   * that this validator should be used.
   *
   * Creates a validator.
   **/
  constructor (schema) {
    if (!NumberValidator.identify(schema)){
      throw new Error("Invalid schema for validator");
    }
    switch(true){
      case schema['#number'] != null:
        this.schema = schema['#number'];
        break;
      case (schema === Number):
        this.schema = {
          // no criteria --> any number is fine
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
    if (typeof input !== 'number'){
      throw getError(input, this.toJSON());
    }
    if (options.integer === true){
      if (!Number.isInteger(input)){
        throw getError(input, this.toJSON());
      }
    }
  }

  /* returns a JSON representation of the schema. */
  toJSON () {
    const subSchema = {};
    if (this.schema.integer != null){
      subSchema.integer = this.schema.integer;
    }
    return {'#number' : subSchema};
  }

  /* @schema : basically anything that will denote that this
   * validator should be used.
   *
   * returns true if this validator should be used.
   */
  static identify (input) {
    if (input === Number){
      return true;
    }
    if (input == null){
      return false;
    }
    if (input['#number']){
      return true;
    }
    return false;
  }

}

module.exports = NumberValidator;
