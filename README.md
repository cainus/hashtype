## liken

** liken is experimental only **

liken is a library for declarative pattern matching and
validation for javascript objects.

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

### Features:

* Schemas are memoized for faster repeated exection.
* TODO It can bail on the first error (for speed), or return all errors
* TODO It can show pretty diffs

### Types:

#### Array:

Arrays are supported 3 ways:

* Array of anything:

```javascript
{
  arrayOfAnything: Array,
  arrayOfNumbers: Array(Number),
  arrayWithElements: [Number, String, "literal"]
  arrayWithElementsUnordered: unordered([Number, String, "literal"])
  arrayWithSegment: slice([Number, String, "literal"])

}
```

#####


### Goals:
* less verbose than similar options (react proptypes, jsonschema, mongoose)
* supports literals annotated as themselves for easy matching in tests
* can be used for run-time input-checking
* easily extendable with new types
* can return all failures, or stop at the first
* can be extended to output other schema types (react proptypes,
  jsonschema, mongoose)


### Plan:
make these work
* DONE literal string
* DONE literal number
* DONE literal boolean
* DONE arrays of simple literals
* DONE objects of simple literals
* DONE arrays with arrays
* DONE arrays of objects
* DONE objects with arrays
* DONE objects with arrays
* dates with precision options
* DONE any string using regex
* DONE enum of literals (oneOf)
* some type extension
* DONE any string
* DONE any number
* any boolean
* DONE any string (optional)
* any array
* any array of type
* any array (unordered)
* any array with segment (slice)
* any object
* objects with additional props
* arrays with additional items
* any function

### Misc:
* maybe all type descriptions should be lowercase like typeof does?

### Questions:
* how to do dates?
* are circular references an issue?
* can we do anything like chai's deep? http://chaijs.com/api/bdd/#method_deep. do we need to?









