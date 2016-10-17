var error = require('./error');
var isObject = require('./PlainObjectValidator').identify;

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
        return;
      };
    }
  } else {
    return new O(obj, options);
  }
};

// TODO allow additional attributes?

O.prototype.test = function(input){
  //console.log("testing...");
  var testretval = this.validate(input);
  //console.log("testretval: ", testretval);
  return testretval;
};

function type2Validator(value, key){
  const validators = require('./validators');
  return {path: key, test: validators.all(value)};
}

function throwError(errors, addedProps){
  var err = new TypeError('invalid type');
  if (!Array.isArray(errors)){
    errors = [errors];
  }
  if (addedProps){
    for (var x in addedProps){
      err[x] = addedProps[x];
    }
  }
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
    //console.log("testing input obj: ", obj);
    if (!isObject(obj)){
      //console.log("failed isObject");
      const err = new TypeError('invalid type');
      const subError = error.invalidType(null, 'object', obj, schema);
      err.path = subError.path;
      err.value = subError.value;
      err.expectedType = subError.expectedType;
      err.actualType = subError.actualType;
      throw err;
    }
    //console.log("passed isObject");
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
    //console.log("validators passed");
    // all the keys outside the schema are excessValue errors
    for(key in obj){
      if (tested.indexOf(key) !== -1){
        continue;
      }
      errors.push(error.excessValue(key, obj[key]));
      //console.log("throwing for excess");
    }
    if (errors.length !== 0){
      throwError(errors, {subType: 'invalid type', path: null, expected: schema, actual: obj});
    }
    return;
  };

}




module.exports = O;
