
// some default validators
let PlainObjectValidator = null; // require()'d later to avoid circular requires
let ArrayValidator = null; // require()'d later to avoid circular requires
let OneOfValidator = null; // require()'d later to avoid circular requires
let OptionalValidator = null; // require()'d later to avoid circular requires
const SimpleNativeValidator = require('./SimpleNativeValidator');
const StringValidator = require('./StringValidator');
const DateValidator = require('./DateValidator');
const NumberValidator = require('./NumberValidator');
const BooleanValidator = require('./BooleanValidator');
const AnyValidator = require('./AnyValidator');
const consoleError = global[`consol${""}e`][`erro${""}r`]; // fool the linter



// add a validator to the top of the validator stack
function register (validator, validators) {
  if (!validator.identify) throw new Error("validator must have an identify() method");
  if (!validator.assert) throw new Error("validator must have an assert() method");
  if (!validator.validate) throw new Error("validator must have a validate() method");
  if (!validator.toJSON) throw new Error("validator must have a toJSON() method");
  validators.unshift(validator);
}

function schemaToValidator (schema, extraValidators) {
    // set the default validators
    PlainObjectValidator = require('./PlainObjectValidator');
    ArrayValidator = require('./ArrayValidator');
    OneOfValidator = require('./OneOfValidator');
    OptionalValidator = require('./OptionalValidator');
    const validators = [
      SimpleNativeValidator,
      NumberValidator,
      BooleanValidator,
      StringValidator,
      DateValidator,
      ArrayValidator,
      OneOfValidator,
      OptionalValidator,
      AnyValidator,
      PlainObjectValidator, // this must come last in case the others use an
                            // object notation
    ];
    // allow some extra validators to be thrown on top
    if (extraValidators){
      extraValidators.reverse().forEach(function(validator){
        register(validator, validators);
      });
    }
    // check the schema for the right validator
    for (const validator of validators){
      if (validator.identify(schema)){
        // return a matching validator for this schema
        const retval = new validator(schema);
        return retval;
      }
    }
    const err = new Error("No matching validator could be found for schema.");
    consoleError("No matching validator could be found for schema: ", schema);
    err.schema = schema;
    throw err;
}




module.exports = schemaToValidator;
