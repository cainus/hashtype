const schemaToValidator = require('./schemaToValidator');

class DateNotification {
  constructor () {
    this['#date'] = {};
  }

  recent () {
    this['#date'].recent = true;
    return this;
  }

  toObject () {
    return {
      '#date': this['#date']
    };
  }

}


function factory (actual, schema){
  if (schema == null){
    schema = actual;
    const validator = schemaToValidator(schema);
    return validator.assert.bind(validator);
  }
  const validator = schemaToValidator(schema);
  validator.assert(actual);
}

factory.date = function(){
  return new DateNotification();
};

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
