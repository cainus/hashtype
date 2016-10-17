/*

 PLAN:

 for now, just make throw work.  returning false is easy later.
 for now, try to return all errors validating.  bailing is easy later.
 for now, literals are more interesting.  replace assertObjectEquals() usage,
   then we can make it more dynamic.

*/



const validators = require('./validators');
const array = require('./array');

function factory (actual, schema){
  if (schema == null){
    schema = actual;
    const validator = Liken(schema);
    return validator.to.bind(validator);
  }
  const validator = Liken(schema);
  return validator.to(actual);
}

var Liken = function(schema){
  if (this instanceof Liken) {
    this.schema = schema;
    this.validator = validator(schema);
    //console.log("validator is ", this.validator);
  } else {
    return new Liken(schema);
  }

};

/*
Liken.optional = function(type){
  return {
    ____liken: true,
    optional: true,
    type: type
  };
};*/

factory.array = function(arr, options){
  return array(arr, options);
};

/*
Liken.oneOf = function(){
  var args = Array.prototype.slice.call(arguments);
  return {
    ____liken: true,
    type: "oneOf",
    choices: args
  };
};*/

Liken.liken = Liken;


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
  var err = new TypeError("Value Error");
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

module.exports = factory;

// takes a schema and returns a function that can be used to validate it.
function validator(schema){
  return validators.all(schema);
}
