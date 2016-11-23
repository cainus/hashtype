
// eg: array(exact match?)
//        .of(liken type)
//        .containing(some subset)
//        .length(2)


class ArrayNotation {
  constructor (input) {
    this['#array'] = {};
    if (Array.isArray(input)){
      this['#array'].matches = input;
    }
  }

  ofAll (likenType) {
    this['#array'].ofAll = likenType;
    return this;
  }

  containing (likenType) {
    if (!Array.isArray(likenType)){
      likenType = [likenType];
    }
    this['#array'].containing = likenType;
    return this;
  }

  length (len) {
    this['#array'].length = len;
    return this;
  }

  toObject () {
    return { '#array' : this['#array'] };
  }

}

module.exports = ArrayNotation;
