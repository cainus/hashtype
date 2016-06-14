var HashType = function(schema){
  if (this instanceof HashType) {
    this.schema = schema;
    this.validator = validator(schema);
  } else {
    return new HashType(schema);
  }

};

HashType.optional = function(type){
  return {
    ____hashtype: true,
    optional: true,
    type: type
  };
}

HashType.type = function(type, opts){
  
}

HashType.oneOf = function(){
  var args = Array.prototype.slice.call(arguments);
  return {
    ____hashtype: true,
    type: "oneOf",
    choices: args
  };
}

HashType.prototype.toJsonSchema = function(){
  props = {};
  for (var key in this.schema){
    props[key] = ht2jsonSchema(this.schema[key]);
  }
  return {
    type: 'object',
    properties: props,
    allowAdditionalProperties: false
  };
}

function ht2jsonSchema(htType){
  console.log("htType: ", htType);
  switch(true){
    case (htType == String): return { type: 'string', required: true};
    case (htType == Number): return {type: 'number', required: true};
    case (htType == Boolean): return {type: 'boolean', required: true};
    case (htType instanceof RegExp):
      return {type: "string", pattern: htType.toString().slice(1, -1), required: true}
    case (Array.isArray(htType)):
      var items = ht2jsonSchema(htType[0]);
      delete items.required;
      return { type: 'array', requred: true, items: items };
    case (isWrapped(htType)):
      if (htType.type == 'oneOf'){
        var enumVal = htType.choices.map(function(choice){
          var retval = ht2jsonSchema(choice);
          delete retval.required;
          return retval;
        });
        var retval = { 'enum': enumVal, required: true };
      } else {
        var retval = ht2jsonSchema(htType.type);
      }
      if (htType.optional){
        retval.required = false;
      }
      return retval;
    case (['string', 'number', 'boolean'].indexOf(typeof htType) !== -1):
      return {enum: [htType], required: true};
    default: throw new Error('unsupported jsonschema type: ' + htType);
  }

}

function isWrapped(htType){
  return ((typeof htType == 'object') && (htType.____hashtype));
}

function isOptional(htType){
  if (isWrapped(htType)){
    return !!htType.optional;
  }
  return false;
}

// returns as many errors as possible
HashType.prototype.validateAll = function(hash){
  return this.validator(hash, false);
}

// bails on the first error
HashType.prototype.validate = function(hash){
  return this.validator(hash, true);
}

module.exports = HashType;

function throwError(errors){
  if (!Array.isArray(errors)){
    errors = [errors]
  }
  var err = new TypeError('invalid hash type')
  err.errors = errors;
  throw err;
}

function missingProperty(path, expectedType){
  return {type: 'missing property', path: path, value: null, expected: expectedType, actual: null}
}
function invalidType(path, expectedType, value){
  console.log("invalidtype: ", expectedType);
  if (Array.isArray(expectedType)){
    expectedType = JSON.stringify(expectedType);
    console.log("stringif: ", expectedType);
  }
  return {type: 'invalid type', path: path, value: value, expected: expectedType, actual: typeof value}
}
function invalidValue(path, expectedType, value){
  return {type: 'invalid value', path: path, value: value, expected: expectedType, actual: value}
}

// takes a schema and returns a function that can be used to validate it.
function validator(schema){
  propValidators = {};
  //console.log("Schema: ", schema);
  for (var key in schema){
    var value = schema[key];
    //console.log("value: ", value, "key: ", key, value.prototype, String.prototype, value.prototype == String.prototype);
    propValidators[key] = type2Validator(value, key);
  }
  return function(obj, shouldBail){
    var errors = [];
    for(key in propValidators){
      var v = propValidators[key];
      var value = obj[v.path];
      var path = v.path;
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
    if (errors.length !== 0){
      throwError(errors);
    }
    return true;
  }

}

function type2ValidatorFn(typeVal){
  switch(true){
    case (typeVal === String):
      return stringFailTest;
    case (typeVal === Array):
      return arrayPrototypeFailTest;
    case (typeVal === Number):
      return numberFailTest;
    case (typeVal === Boolean):
      return booleanFailTest;
    case (typeVal instanceof RegExp):
      return regexpFailTest(typeVal);
    case (['string', 'number', 'boolean'].indexOf(typeof typeVal) !== -1):
      return literalFailTest(typeVal);
    case (typeof typeVal == 'function'):
      return functionFailTest(typeVal);
    case (Array.isArray(typeVal)):
      return arrayFailTest(typeVal[0]);
    case (isWrapped(typeVal)):
      // this is a wrapped type
      switch(true){
        case (typeVal.type == 'oneOf'):
          return oneOfFailTest(typeVal.choices);
        case (typeVal.optional):
          var test = type2ValidatorFn(typeVal.type);
          return function(val){
            if (val == null) return;
            return test(val);
          }
          break;
      }
    default:
      throw new Error('unknown schema type at key (' + key + '): ' + value)
  }
}


function type2Validator(value, key){
  return {path: key, test: type2ValidatorFn(value)};
}

function functionFailTest(fn){
  return function(val, key){
    if (!fn(val)){
      return invalidValue(key, 'function', val);
    }
  };
}

function arrayFailTest(type){
  return function(vals, key){
    var errors = [];
    //if (!Array.isArray(vals)){
    //  return invalidType();
    //}
    console.log("type iz: ", type);
    for (var val of vals){
      var failTest = type2ValidatorFn(type);
      if (failTest(val)){
        var error = invalidType(key, type, val);
        errors.push(error);
      }
    }
    if (errors){
      return errors;
    }
  };
}

function oneOfFailTest(choices){
  return function(val, key){
    for (var choice of choices){
      var failTest = type2ValidatorFn(choice);
      var error = failTest(val);
      if (!error){
        return;
      }
    }
    return invalidType(key, 'oneOf', val);
  };
}

function regexpFailTest(regex){
  return function(val, key){
    if (val == null){
      return missingProperty(key, 'String');
    }
    if (!regex.test(val)){
      return invalidValue(key, regex, val);
    }
  };
}

function literalFailTest(expected){
  return function(val, key){
    if (val == null){
      return missingProperty(key, expected);
    }
    if (val !== expected){
      return invalidValue(key, expected, val);
    }
  };
}

function numberFailTest(val, key){
  if (val == null){
    return missingProperty(key, 'Number');
  }
  if (!(typeof val === 'number' || val instanceof Number)){
    return invalidType(key, 'Number', val);
  }
}

function booleanFailTest(val, key){
  if (val == null){
    return missingProperty(key, 'Boolean');
  }
  if (!(typeof val === 'boolean' || val instanceof Boolean)){
    return invalidType(key, 'Boolean', val);
  }
};

function arrayPrototypeFailTest(val, key){
  if (val == null){
    return missingProperty(key, 'Array');
  }
  if (!Array.isArray(val)){
    return invalidType(key, 'Array', val);
  }
};

function stringFailTest(val, key){
  if (val == null){
    return missingProperty(key, 'String');
  }
  if (!(typeof val === 'string' || val instanceof String)){
    return invalidType(key, 'String', val);
  }
};
