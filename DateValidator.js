const error = require('./error');

function isValidDate (input) {
  if (input instanceof Date && !isNaN(input.valueOf())){
    return true;
  }
  return false;
}

function formatActual (actual) {
  return {'#date': actual.toISOString()};
}

class DateValidator {

  /* @schema : basically anything that will denote
   * that this validator should be used.
   *
   * Creates a validator.
   **/
  constructor (schema) {
    if (!DateValidator.identify(schema)){
      throw new Error("Invalid schema for validator");
    }
    switch(true){
      case schema['#date'] != null:
        this.schema = schema['#date'];
        break;
      case isValidDate(schema):
        this.schema = {
          equals: schema
        };
        break;
      case (schema === Date):
        this.schema = {
          // no criteria --> any date is fine
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
    if (!isValidDate(input)){
      throw error.MismatchedValue(formatActual(input), this.toJSON());
    }
    if (options.equals != null){
      if (input.getTime() !== options.equals.getTime()){
        throw error.MismatchedValue(formatActual(input), this.toJSON());
      }
    }
    if (options.recent != null){
      const tenSecondsAgo = new Date((new Date().getTime()) - (10 * 1000));
      if (options.recent === true){
        if (tenSecondsAgo > input){
          throw error.MismatchedValue(formatActual(input), this.toJSON());
        }
      } else {
        if (tenSecondsAgo > input){
          throw error.MismatchedValue(formatActual(input), this.toJSON());
        }
      }
    }
    if (options.before != null){
      if (input.getTime() >= options.before.getTime()){
        throw error.MismatchedValue(formatActual(input), this.toJSON());
      }
    }
    if (options.after != null){
      if (input.getTime() <= options.after.getTime()){
        throw error.MismatchedValue(formatActual(input), this.toJSON());
      }
    }
  }

  /* returns a JSON representation of the schema. */
  toJSON () {
    const subSchema = {};
    var that = this;
    ['before', 'after', 'equals'].forEach(function(key){
      if (that.schema[key]){
        subSchema[key] = that.schema[key].toISOString();
      }
    });
    if (this.schema.recent != null){
      subSchema.recent = this.schema.recent;
    }
    return {'#date' : subSchema};
  }

  /* @schema : basically anything that will denote that this
   * validator should be used.
   *
   * returns true if this validator should be used.
   */
  static identify (date) {
    if (date == null){
      return false;
    }
    if (isValidDate(date)){
      return true;
    }
    if (date === Date){
      return true;
    }
    if (date['#date']){
      return true;
    }
    return false;
  }

}

module.exports = DateValidator;
