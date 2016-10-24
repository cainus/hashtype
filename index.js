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

factory.addNotation = function(name, whatever){
  if (factory[name]){
    throw new Error('property already exists: ' + name);
  }
  factory[name] = whatever;
  return factory;
};

factory.number = function(){
  return new NumberNotation();
};

factory.optional = function(schema){
  return {
    '#optional': schema
  };
};

factory.oneOf = function(){
  var args = Array.prototype.slice.call(arguments);
  args.forEach(function(arg){
    // ensure there are validators for these schemas
    schemaToValidator(arg);
  });
  return {
    '#oneOf': args
  };
};

module.exports = factory;
