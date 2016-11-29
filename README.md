## liken

** liken is experimental only **

liken is a library for declarative pattern matching and validation for javascript objects.  It can be used in test expectations or for verifying that variables in application code adhere to certain expectations.

### Example:

```javascript
liken({
  firstName: String,
  lastName: optional(String),
  age: Number
});
```

...can be used to match objects like:
```javascript
{
  firstName: 'Joey',
  age: 49
}

```


### Features

* Schemas are memoized for faster repeated exection.
* TODO It can bail on the first error (for speed), or return all errors
* TODO It can show pretty diffs

### Types

#### Strings
```javascript
liken({
  literal: "literal",
  regex: "literal",
  any: "blah blah blah"
}, {
  literal: "literal",
  regex: /liter[a]{1}l/,
  any: String
});  // this passes
```

#### Numbers
```javascript
liken({
  literal: 47,
  integer: 38,
  any: 123.34
}, {
  literal: 47,
  integer: liken.number().integer(),
  any: Number
});  // this passes
```


#### Booleans
```javascript
liken({
  anybool: false,
  sure: true,
  noway: false
}, {
  anybool: Boolean,
  sure: true,
  noway: false
});  // this passes
```

#### Dates
```javascript
liken({
  anydate: new Date(1975),
  recentDate: new Date(),
  now: new Date();
}, {
  anydate: Date,
  recentDate: liken.date().recent(), // within 10 seconds
  now: new Date();
});  // this passes
```

### Enumerables (#oneOf())

```javascript
liken(
  "test",
  liken.oneOf(1,2,3,4,"test")
);  // this passes
```

### Optionals (#optional())
```javascript
liken({
  test: "test"
}, {
  test: "test",
  maybe: liken.optional(Number)
);  // this passes
```

#### Objects
```javascript
liken({
  whatever: {
    matchEverything: "sure",
    why: "not"
  }
  works: true,
  subObject: {
    broken: false
  },
  keyPairs: {
    key0: "this",
    key1: "is",
    key2: "an",
    key3: "example",
  },
  partial: {
    atLeast: true,
    butMaybeAlso: true
  }
}, {
  whatever: Object,
  works: true,
  subObject: {
    broken: false
  },
  keyPairs: liken.object().keys(liken.array().ofAll(/^key/)),
  partial: liken.object().contains({atLeast: true})
);  // this passes
```

#### Arrays
```javascript
liken({
  any: [1,2,3],
  ofAll: [false,false,true]
  literal: [4,5,6]
  withlength: [{obj: 1}, {obj: 2}]
}, {
  any: Array,
  ofAll: liken.array().ofAll(Boolean),
      // ^^^ sort of like a typed array, but more powerful
  literal: [4,5,6]
  withlength: liken.array().length(2)
);  // this passes
```

#### Anything / Everything (#any())
```javascript
liken({
  tryThis: {test: true}
}, {
  tryThis: liken.any()
}); // this passes
```


### Goals:
* less verbose than similar options (react proptypes, jsonschema, mongoose, chai, expect.js)
* supports literals annotated as themselves for easy matching in tests
* can be used for run-time input-checking or for test assertions
* easily extendable with new types
* can return all failures, or stop at the first
* can be extended to output other schema types (react proptypes,
  jsonschema, mongoose)
* make error-messages as obvious as possible
* keep the library dependency-free (except for test dependencies)

### Future Plans:
* dates with precision options
* dates with before options
* dates with after options
* user-defined validators
* any array with segment (slice)
* any function

### Design Choices:
* Notations are always JSON serializable so that they are
  over-the-wire serializable and easy to parse. (eg, no functions)
* Notations all have a chainable interface, always using functions for
  consistency and configurability.
* All "types" have a notation that is an object with the type (preceded
  by a hash, all lower-case) as its first key and an options object for a value.  (eg {"#boolean": {}} , which is for the Boolean type, with an empty options object).
* There is no pre-processing of input.  Only-validation.
* There will always be validations that are not possible declaratively
  (eg "Is this email address taken?").  This only needs to be an 80% solution.
* In functions where actual and expected values are both parameters, the
  actual value should precede the expected value as per convention.
* unordered array matching is pretty expensive with how fuzzy these
  matchers can be and how multiple items can match the same matchers.  Instead of solving this problem, the user should sort arrays for comparison first.

### Questions:
* are circular references an issue?
* do we need negation?









