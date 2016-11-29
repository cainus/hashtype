
// eg: object(exact match?)
//        .keys(array notation)


class ObjectNotation {
  constructor (input) {
    this['#object'] = {};
    if (input){
      this['#object'].matches = input;
    }
  }

  keys (arrayNotation) {
    this['#object'].keys = arrayNotation;
    return this;
  }

  contains (input) {
    this['#object'].contains = input;
    return this;
  }

  toObject () {
    return { '#object' : this['#object'] };
  }

}

module.exports = ObjectNotation;
