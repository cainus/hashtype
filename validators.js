var error = require('./error');
var isObject = require('./isObject');

var validators = {};

validators.all = function(typeVal){
  //console.log("typeVal: ", typeVal);
  if (!typeVal){
    throw new Error('missing typeVal');
  }
  switch(true){
    case isString(typeVal):
      return literalFailTest(typeVal);
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
    case (['number', 'boolean'].indexOf(typeof typeVal) !== -1):
      return literalFailTest(typeVal);
    case (typeof typeVal == 'function'):
      return functionFailTest(typeVal);
    case (Array.isArray(typeVal)):
      //console.log("array test");
      return arrayFailTest(typeVal);
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
              return error.invalidType(key, 'Array', val);
            }
          };
        case (typeVal.optional):
          var test = validators.all(typeVal.type);
          return function(val){
            if (val == null) return;
            return test(val);
          };
        default:
          throw new Error("wrapped type unknown");
      }
    case (isObject(typeVal)):
      return objectFailTest(typeVal);
    default:
      //console.log("typeVal: ", typeVal);
      throw new Error('unknown schema type: ' + typeVal);
  }
};

function isWrapped(lType){
  return ((typeof lType == 'object') && (lType.____liken));
}


function functionFailTest(fn){
  return function(val, key){
    if (!fn(val)){
      return error.invalidValue(key, 'function', val);
    }
  };
}

/*
function arrayFailTest(type){
  return function(vals, key){
    var errors = [];
    //if (!Array.isArray(vals)){
    //  return error.invalidType();
    //}
    console.log("type iz: ", type);
    for (var val of vals){
      var failTest = getValidator(type);
      if (failTest(val)){
        var err = error.invalidType(key, type, val);
        errors.push(err);
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
      var failTest = validators.all(choice);
      var err = failTest(val);
      if (!err){
        return;
      }
    }
    return error.invalidType(key, 'oneOf', val);
  };
}

function regexpFailTest(regex){
  return function(val, key){
    if (val == null){
      return error.missingValue(key, 'String');
    }
    if (!regex.test(val)){
      return error.invalidValue(key, regex, val);
    }
  };
}



function literalFailTest(expected){
  //console.log("literalFailTest called with: ", expected);
  return function(val, key){
    if (val == null){
      return error.missingValue(key, expected);
    }
    if (typeof val !== typeof expected){
      return error.invalidType(key, typeof expected, val, expected);
    }
    if (val !== expected){
      return error.invalidValue(key, expected, val);
    }
  };
}

function arrayFailTest(schema){
  //console.log("called arrayFailTest() with ", schema);
  return function(vals, key){
    if (!vals){
      return error.missingValue(key, schema);
    }
    if (!Array.isArray(vals)){
      return error.invalidType(key, 'array', vals, schema);
    }
    //console.log("schema iz: ", schema);
    var err = error.invalidValue(key, schema, vals);
    if (!key){
      key = [];
    }
    err.errors = [];
    var longestLength = Math.max(vals.length, schema.length);
    for (var i = 0; i < longestLength; i++){
      var val = vals[i];
      var itemKey = key.concat(i);
      if (schema[i] == null){
        var firstItemError = error.excessValue(itemKey, val);
        err.errors.push(firstItemError);
        break;
      }
      // any unfulfilled schema items are errors too
      if (val == null){
        var secondItemError = error.missingValue(itemKey, schema[i]);
        err.errors.push(secondItemError);
        break;
      }
      var failTest = validators.all(schema[i]);
      var thirdItemError = failTest(val, itemKey);
      if (thirdItemError){
        err.errors.push(thirdItemError);
      }
    }
    if (err.errors.length > 0){
      return err;
    }
  };
}

function numberFailTest(val, key){
  if (val == null){
    return error.missingValue(key, 'Number');
  }
  if (!(typeof val === 'number' || val instanceof Number)){
    return error.invalidType(key, 'Number', val);
  }
}

function booleanFailTest(val, key){
  if (val == null){
    return error.missingValue(key, 'Boolean');
  }
  if (!(typeof val === 'boolean' || val instanceof Boolean)){
    return error.invalidType(key, 'Boolean', val);
  }
}

function arrayPrototypeFailTest(val, key){
  if (val == null){
    return error.missingValue(key, 'Array');
  }
  if (!Array.isArray(val)){
    return error.invalidType(key, 'Array', val);
  }
}

function stringFailTest(val, key){
  if (val == null){
    return error.missingValue(key, 'String');
  }
  if (!isString(val)){
    return error.invalidType(key, 'String', val);
  }
}


const O = require('./object');
validators.object = O;

function objectFailTest(schema){
  var tester = O(schema);
  return function(vals, key){
    if (vals == null){
      return error.missingValue(key, schema);
    }
    var retval = tester.test(vals);
    // console.log("retval: ", retval);
    return retval;
  };
}

// -------------------------------------------------
// type checkers
// -------------------------------------------------
function isString(val){
  return (typeof val === 'string' || val instanceof String);
}


module.exports = validators;
