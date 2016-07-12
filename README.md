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
* literal string
* literal number
* literal boolean
* arrays of simple literals
* objects of simple literals
* arrays with arrays
* arrays of objects
* objects with arrays
* objects with arrays
* any string using regex
* enum of literals (oneOf)
* some type extension
* any string
* any number
* any boolean
* any string (optional)
* any array
* any array of type
* any array (unordered)
* any array with segment (slice)
* any object
* any function

### Misc:
* maybe all type descriptions should be lowercase like typeof does?

### Questions:
* how to do dates?
* are circular references an issue?
* can we do anything like chai's deep? http://chaijs.com/api/bdd/#method_deep. do we need to?









