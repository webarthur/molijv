# MoliJV - Mongoose-Like JSON Validador

JSON validator inspired by Mongoose for Node.js.

- Type validation and coercion similar to Mongoose, but with no external dependencies.
- Supports types: String, Number, Boolean, Date, Int32, Decimal128, Double, Array, Object.
- Allows defining validation schemas in a simple and flexible way.
- Zod-like schema transformation methods: `partial()`, `require()`, `pick()`, `omit()`, `extend()`, `merge()`
- Safe validation with `safeParse()` / `safeValidate()` - returns result object instead of throwing
- Field-level transformations with `transform()` function

## Installation

```bash
npm install molijv
```

## Quick Example

```javascript
import { Schema } from 'molijv'

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, min: 0 },
  email: { type: String, match: /@/, message: 'Invalid email' }
})

const user = {
  name: '  Arthur  ',
  age: '22',
  email: 'arthur@email.com'
}

userSchema.validate(user) // returns validated/coerced object or throws error
```

## Features

- Type validation and automatic coercion (optional)
- Customizable error messages
- Supports custom validation, enum, min/max, required, match (regex), default, etc.
- **Schema transformation methods**:
  - `partial()` - make fields optional
  - `require()` - make fields required
  - `pick()` - select specific fields
  - `omit()` - exclude specific fields
  - `extend()` - add or override fields
  - `merge()` - combine with another schema
- **Safe validation**:
  - `safeParse()` / `safeValidate()` - returns `{ success, data, error }` instead of throwing
- **Field transformations** - apply functions to transform values after validation
- Inspired by Mongoose schema API

---

## API Documentation

### Class: `Schema`

Creates a validator from a schema.

#### `new Schema(schemaDef, options?)`

- `schemaDef`: Object that defines the schema (types, validations, etc)
- `options`: (optional) `{ coerce: boolean }` (default: `true`)

#### `validate(data)`

Validates and (optionally) coerces the input data.

- `data`: Object to be validated
- Returns: validated/coerced object
- Throws: `Error` if validation fails

#### `parse(data)`

Alias for `validate()` - same behavior.

#### `safeParse(data)` / `safeValidate(data)`

Validate data without throwing errors. Returns a result object instead of throwing.

```javascript
const result = schema.safeParse(data)

if (result.success) {
  // Use result.data - validation passed
} else {
  // Use result.error - validation failed
}
```

#### `shape`

Get the schema definition (read-only property).

```javascript
const schema = new Schema({ name: String, age: Number })
console.log(schema.shape) // { name: String, age: Number }
```

### Schema Transformation Methods

#### `partial(fields?)`

Make fields optional. Returns a new Schema without mutating the original.

```javascript
const schema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true }
})

// All fields optional
schema.partial().parse({}) // ✓ valid

// Specific fields optional
schema.partial(['age']).parse({ name: 'John' }) // ✓ valid

// Chainable
schema.partial().pick(['name']).parse({}) // ✓ valid
```

#### `require(fields?)`

Make fields required. Returns a new Schema without mutating the original.

```javascript
const schema = new Schema({
  name: { type: String },
  email: { type: String }
})

schema.require() // all required
schema.require(['email']) // only email required
```

#### `pick(fields)`

Select only specific fields. Returns a new Schema without mutating the original.

```javascript
const schema = new Schema({
  name: String,
  email: String,
  password: String
})

const publicSchema = schema.pick(['name', 'email'])
// password field is removed
```

#### `omit(fields)`

Remove specific fields. Returns a new Schema without mutating the original.

```javascript
const schema = new Schema({
  name: String,
  email: String,
  password: String
})

const publicSchema = schema.omit(['password'])
// password field is removed
```

#### `extend(fields)`

Add or override fields. Returns a new Schema without mutating the original.

```javascript
const schema = new Schema({
  name: { type: String, required: true }
})

const extended = schema.extend({
  email: { type: String, required: true },
  age: { type: Number }
})
```

#### `merge(other)`

Merge with another schema. Returns a new Schema combining both schemas.
Fields from the other schema override fields in this schema.

```javascript
const schema1 = new Schema({
  name: { type: String, required: true }
})

const schema2 = new Schema({
  email: { type: String, required: true },
  age: { type: Number }
})

const merged = schema1.merge(schema2)
// merged includes name, email, and age
```

#### `safeParse(data)` / `safeValidate(data)`

Validate data without throwing errors. Returns a result object.

```javascript
const schema = new Schema({
  name: { type: String, required: true }
})

const result = schema.safeParse({ name: 'John' })

if (result.success) {
  console.log(result.data) // { name: 'John' }
} 
else {
  console.log(result.error.message) // error message
}
```

### Supported types

- `String`, `Number`, `Boolean`, `Date`, `Int32`, `Decimal128`, `Double`, `Array`, `Object`

### Field options

- `type`: Field type
- `required`: `true` or `[true, "message"]`
- `min`, `max`: For numbers or dates. Ex: `{ min: 0 }`
- `enum`: List of allowed values or `[values, "message"]`
- `match`: Regex or `[regex, "message"]`
- `default`: Default value
- `validate`: Custom function or `[function, "message"]`
- `transform`: Transform function applied after validation
- `trim`, `lowercase`, `uppercase`: For strings

### Transform function

Apply transformations to field values after validation:

```javascript
const schema = new Schema({
  name: {
    type: String,
    required: true,
    transform: (val) => val.trim().toUpperCase()
  },
  email: {
    type: String,
    transform: (val) => val.toLowerCase()
  },
  birthYear: {
    type: Number,
    transform: (val) => new Date().getFullYear() - val // convert age to birth year
  }
})

const result = schema.parse({
  name: '  john doe  ',
  email: 'JOHN@EXAMPLE.COM',
  birthYear: 25
})

// result = {
//   name: 'JOHN DOE',
//   email: 'john@example.com',
//   birthYear: 2001
// }
```

### Full schema example

```javascript
const schema = new Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  age: { type: Int32, min: 0, max: 120 },
  email: { type: String, match: [/@/, 'Invalid email'], transform: (v) => v.toLowerCase() },
  tags: [String],
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  createdAt: { type: Date, default: () => new Date() }
})

// Get public schema (omit sensitive fields)
const publicSchema = schema.omit(['_id'])

// Get optional fields version
const partialSchema = schema.partial()

// Get specific fields only
const summarySchema = schema.pick(['name', 'email', 'role'])
```

---

## License

MIT
