const schemaToValidator = require('./schemaToValidator');

function factory (actual, schema){
  if (schema == null){
    schema = actual;
    const validator = schemaToValidator(schema);
    return validator.assert.bind(validator);
  }
  const validator = schemaToValidator(schema);
  validator.assert(actual);
}

/*
Liken.optional = function(type){
  return {
    ____liken: true,
    optional: true,
    type: type
  };
};*/

/*
Liken.oneOf = function(){
  var args = Array.prototype.slice.call(arguments);
  return {
    ____liken: true,
    type: "oneOf",
    choices: args
  };
};*/

module.exports = factory;
