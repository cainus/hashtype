const schemaToValidator = require('./schemaToValidator');

class DateNotation {
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

class NumberNotation {
  constructor () {
    this['#number'] = {};
  }

  integer () {
    this['#number'].integer = true;
    return this;
  }

  toObject () {
    return {
      '#number': this['#number']
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
  return new DateNotation();
};

factory.number = function(){
  return new NumberNotation();
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
