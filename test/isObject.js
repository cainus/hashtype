
var assert = require('chai').assert;
var isObject = require('../isObject');

describe('isObject', function(){

  it ("returns false for various non-objects", function(){
    const failCases = {
      array: [],
      string: "asdf",
      number: 1234,
      'null': null,
      'undefined': undefined,
      date: new Date(),
      Date: Date,
      numberObject: new Number(),
      'function': function(){},
      boolean: true,
      booleanObject: new Boolean(true),
      booleanClass: Boolean,
      stringObj: new String("asdf"),
      emptyString: "",
      aNull: null,
      anUndefined: undefined,
      aFalse: false,
    };


    for (var name in failCases){
      var testable = failCases[name];
      assert.isNotOk(isObject(testable), name);
    }
  
  });

  it ("returns true for objects", function(){
    assert.isOk(isObject({}));
  });

});
