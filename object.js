var error = require('./error');
var isObject = require('./isObject');
// ------------------------------
// object validator
// ------------------------------
const O = function(obj, options){
  if (this instanceof O) {
    this.specified = true;  // an actual object for matching has been provided,
                            // rather than allowing any object
    if (!obj || !isObject(obj)){
      this.specified = false;
      switch(true){
        case (obj == null):
          break;
        case (obj.required != null):
          // detected an options object as first param
          options = obj;
          break;
        default:
          throw new Error('first parameter must be an array or options object');
      }
    }
    //console.log("specified: ", this.specified);
    options = options || {};
    this.input = obj;
    this.____liken = true;
    this.type = "object";
    // required default is true:
    this.required = (options.required === false) ? false : true;
    if (this.specified){
      this.validate = objectValidator(obj);
    } else {
      this.validate = function(o){
        if (!isObject(o)){
          throw new Error("Input was not an object");
        }
        return true;
      };
    }
  } else {
    return new O(obj, options);
  }
};

// TODO allow additional attributes?

O.prototype.test = function(input){
  var testretval = this.validate(input);
  //console.log("testretval: ", testretval);
  return testretval;
};

function type2Validator(value, key){
  const validators = require('./validators');
  return {path: key, test: validators.all(value)};
}

function throwError(errors){
  if (!Array.isArray(errors)){
    errors = [errors];
  }
  var err = new TypeError('invalid type');
  err.errors = errors;
  throw err;
}

// takes a schema and returns a function that can be used to validate it.
function objectValidator(schema){
  const propValidators = {};
  for (var key in schema){
    var value = schema[key];
    propValidators[key] = type2Validator(value, key);
  }
  return function(obj, shouldBail){
    if (!isObject(obj)){
      throw error.invalidType(null, 'object', obj, schema);
    }
    var errors = [];
    var tested = [];
    for(key in propValidators){
      var v = propValidators[key];
      var value = obj[v.path];
      var path = v.path;
      tested.push(v.path);
      var err = v.test(value, path);
      if (err){
        if (Array.isArray(err)){
          errors = errors.concat(err);
        } else {
          errors.push(err);
        }
        if (shouldBail){
          throwError(errors);
        }
      }
    }
    // all the keys outside the schema are excessValue errors
    for(key in obj){
      if (tested.indexOf(key) !== -1){
        continue;
      }
      errors.push(error.excessValue(key, obj[key]));
    }
    if (errors.length !== 0){
      throwError(errors);
    }
    return true;
  };

}

module.exports = O;
