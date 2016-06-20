
function getValidator(typeVal){
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
        case (typeVal.type == 'array'):
          return function(val, key){
            try {
              typeVal.test(val);
              return null;
            } catch (ex){
              return invalidType(key, 'Array', val);
            }
          };
        case (typeVal.optional):
          var test = getValidator(typeVal.type);
          return function(val){
            if (val == null) return;
            return test(val);
          }
          break;
      }
    default:
      console.log("typeVal: ", typeVal);
      throw new Error('unknown schema type: ' + typeVal);
  }
}

function isWrapped(htType){
  return ((typeof htType == 'object') && (htType.____hashtype));
}


function functionFailTest(fn){
  return function(val, key){
    if (!fn(val)){
      return invalidValue(key, 'function', val);
    }
  };
}

/*
function arrayFailTest(type){
  return function(vals, key){
    var errors = [];
    //if (!Array.isArray(vals)){
    //  return invalidType();
    //}
    console.log("type iz: ", type);
    for (var val of vals){
      var failTest = getValidator(type);
      if (failTest(val)){
        var error = invalidType(key, type, val);
        errors.push(error);
      }
    }
    if (errors){
      return errors;
    }
  };
}*/

function oneOfFailTest(choices){
  return function(val, key){
    for (var choice of choices){
      var failTest = getValidator(choice);
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
function missingProperty(path, expectedType){
  return {type: 'missing property', path: path, value: null, expected: expectedType, actual: null}
}



module.exports = getValidator;
