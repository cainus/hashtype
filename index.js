/*

 PLAN:

 for now, just make throw work.  returning false is easy later.
 for now, try to return all errors validating.  bailing is easy later.
 for now, literals are more interesting.  replace assertObjectEquals() usage,
   then we can make it more dynamic.

*/



const validators = require('./validators');
const array = require('./array');


var Liken = function(schema){
  if (this instanceof Liken) {
    this.schema = schema;
    this.validator = validator(schema);
    //console.log("validator is ", this.validator);
  } else {
    return new Liken(schema);
  }

};

Liken.optional = function(type){
  return {
    ____liken: true,
    optional: true,
    type: type
  };
};

/*
Liken.type = function(type, opts){
  
}*/

Liken.array = function(arr, options){
  return array(arr, options);
};

Liken.oneOf = function(){
  var args = Array.prototype.slice.call(arguments);
  return {
    ____liken: true,
    type: "oneOf",
    choices: args
  };
};

Liken.liken = Liken;


function isWrapped(lType){
  return ((typeof lType == 'object') && (lType.____liken));
}

/*
function isOptional(lType){
  if (isWrapped(lType)){
    return !!lType.optional;
  }
  return false;
}*/

// returns as many errors as possible
Liken.prototype.validateAll = function(hash){
  return this.validator(hash, false);
};

// TODO: flatten this error?!?
Liken.prototype.to = function(input){
  var result = this.validator(input, null);
  if (!result){
    return;
  }
  var err = new Error("Value Error");
  err.ValueError = true;
  for (const key in result){
    err[key] = result[key];
  }
  throw err;
};

// bails on the first error
Liken.prototype.validate = function(hash){
  return this.validator(hash, true);
};

module.exports = Liken;

/* old code? delete?
 *
function throwError(errors){
  if (!Array.isArray(errors)){
    errors = [errors]
  }
  var err = new TypeError('invalid type')
  err.errors = errors;
  throw err;
}*/

// takes a schema and returns a function that can be used to validate it.
function validator(schema){
  return validators.all(schema);

  /* old code below?  deletable?
  const propValidators = {};

  //console.log("Schema: ", schema);
  for (var key in schema){
    var value = schema[key];
    //console.log("value: ", value, "key: ", key, value.prototype, String.prototype, value.prototype == String.prototype);
    propValidators[key] = type2Validator(value, key);
  }
  return function(obj, shouldBail){
    var errors = [];
    for(const key in propValidators){
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

  */
}

/* old code? delete?
function type2Validator(value, key){
  return {path: key, test: validators.all(value)};
  }
  */


// JSONSchema stuff
Liken.prototype.toJsonSchema = function(){
  const props = {};
  for (var key in this.schema){
    props[key] = ht2jsonSchema(this.schema[key]);
  }
  return {
    type: 'object',
    properties: props,
    allowAdditionalProperties: false
  };
};


function ht2jsonSchema(lType){
  //console.log("lType: ", lType);
  let retval = null;
  switch(true){
    case (lType == String): return { type: 'string', required: true};
    case (lType == Number): return {type: 'number', required: true};
    case (lType == Boolean): return {type: 'boolean', required: true};
    case (lType instanceof RegExp):
      return {type: "string", pattern: lType.toString().slice(1, -1), required: true};
    case (Array.isArray(lType)):
      var items = ht2jsonSchema(lType[0]);
      delete items.required;
      return { type: 'array', requred: true, items: items };
    case (isWrapped(lType)):
      if (lType.type == 'oneOf'){
        var enumVal = lType.choices.map(function(choice){
          retval = ht2jsonSchema(choice);
          delete retval.required;
          return retval;
        });
        retval = { 'enum': enumVal, required: true };
      } else {
        retval = ht2jsonSchema(lType.type);
      }
      if (lType.optional){
        retval.required = false;
      }
      return retval;
    case (['string', 'number', 'boolean'].indexOf(typeof lType) !== -1):
      return {enum: [lType], required: true};
    default: throw new Error('unsupported jsonschema type: ' + lType);
  }

}
