getValidator = require('./getValidator');
array = require('./array');


var Liken = function(schema){
  if (this instanceof Liken) {
    this.schema = schema;
    this.validator = validator(schema);
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
}

Liken.type = function(type, opts){
  
}

Liken.array = function(arr, options){
  return array(arr, options);
}

Liken.oneOf = function(){
  var args = Array.prototype.slice.call(arguments);
  return {
    ____liken: true,
    type: "oneOf",
    choices: args
  };
}

Liken.prototype.toJsonSchema = function(){
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

function ht2jsonSchema(lType){
  console.log("lType: ", lType);
  switch(true){
    case (lType == String): return { type: 'string', required: true};
    case (lType == Number): return {type: 'number', required: true};
    case (lType == Boolean): return {type: 'boolean', required: true};
    case (lType instanceof RegExp):
      return {type: "string", pattern: lType.toString().slice(1, -1), required: true}
    case (Array.isArray(lType)):
      var items = ht2jsonSchema(lType[0]);
      delete items.required;
      return { type: 'array', requred: true, items: items };
    case (isWrapped(lType)):
      if (lType.type == 'oneOf'){
        var enumVal = lType.choices.map(function(choice){
          var retval = ht2jsonSchema(choice);
          delete retval.required;
          return retval;
        });
        var retval = { 'enum': enumVal, required: true };
      } else {
        var retval = ht2jsonSchema(lType.type);
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

function isWrapped(lType){
  return ((typeof lType == 'object') && (lType.____liken));
}

function isOptional(lType){
  if (isWrapped(lType)){
    return !!lType.optional;
  }
  return false;
}

// returns as many errors as possible
Liken.prototype.validateAll = function(hash){
  return this.validator(hash, false);
}

// bails on the first error
Liken.prototype.validate = function(hash){
  return this.validator(hash, true);
}

module.exports = Liken;

function throwError(errors){
  if (!Array.isArray(errors)){
    errors = [errors]
  }
  var err = new TypeError('invalid hash type')
  err.errors = errors;
  throw err;
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

function type2Validator(value, key){
  return {path: key, test: getValidator(value)};
}

