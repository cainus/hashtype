getValidator = require('./getValidator');
array = require('./array');


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

HashType.array = function(arr, options){
  return array(arr, options);
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

