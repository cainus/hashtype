
const validators = require('./validators');

/*
 * options are:
 *  - type: any type annotation: Number, String, Boolean, etc
 *  - ordered: true/false for whether order matters
 *  - required: true/false for whether this object needs to exist
*/

const L = function(arr, options){
  if (this instanceof L) {
    this.specified = true;  // an actual array for matching has been provided
    if (!Array.isArray(arr)){
      this.specified = false;
      switch(true){
        case (arr == null):
          break;
        case ((arr.type != null) || (arr.ordered != null) || arr.required != null):
          // detected an options object as first param
          options = arr;
          break;
        default:
          throw new Error('first parameter must be an array or options object');
      }
    }
    options = options || {};
    this.input = arr;
    this.typed = false;
    if (options.type){
      this.dataType = options.type;
      this.validator = validators.all(options.type);
      this.typed = true;
    }
    this.____liken = true;
    this.type = "array";
    // required default is true:
    this.required = (options.required === false) ? false : true;
    // ordered default is true:
    this.ordered = (options.ordered === false) ? false : true;
    if (this.specified && !this.ordered){
      this.input = this.input.sort();
    }
    // this.validator = this.getValidator();
  } else {
    return new L(arr, options);
  }
};

// features? minLength, maxLength, length, any, all, some

L.prototype.test = function(input){
  if (!Array.isArray(input)){
    throw new Error('not an array');
  }
  if (this.specified){
    if (input.length !== this.input.length){
      throw new Error('non-match');
    }
    if (!this.ordered){
      input = input.sort();
    }
    for(var i = 0; i < input.length; i++){
      if (input[i] !== this.input[i]){
        throw new Error('non-match');
      }
    }
  } else {
    // unspecified
    if (this.typed){
      for(var i = 0; i < input.length; i++){
        var err = this.validator(input[i]);
        console.log("err", err);
        if (err){
          throw err;
        }
      }
    } else {
      // do nothing.  It's untyped and unspecifed, so anything matches
    }

  }

  return true;
};

module.exports = L;
