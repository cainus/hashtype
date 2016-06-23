## liken

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


