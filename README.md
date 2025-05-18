# MoliJV - Mongoose-Like JSON Validador

JSON validator inspired by Mongoose for Node.js.

- Type validation and coercion similar to Mongoose, but with no external dependencies.
- Supports types: String, Number, Boolean, Date, Int32, Decimal128, Double, Array, Object.
- Allows defining validation schemas in a simple and flexible way.

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
- Returns: validated/coerced object (may be the same or a new object)
- Throws: `Error` if validation fails

#### Supported types

- `String`, `Number`, `Boolean`, `Date`, `Int32`, `Decimal128`, `Double`, `Array`, `Object`

#### Field options

- `type`: Field type
- `required`: `true` or `[true, "message"]`
- `min`, `max`: For numbers or dates. Ex: `{ min: 0 }`
- `enum`: List of allowed values or `[values, "message"]`
- `match`: Regex or `[regex, "message"]`
- `default`: Default value
- `validate`: Custom function or `[function, "message"]`
- `trim`, `lowercase`, `uppercase`: For strings

#### Full schema example

```javascript
const schema = new Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  age: { type: Int32, min: 0, max: 120 },
  email: { type: String, match: [/@/, 'Invalid email'] },
  tags: [String],
  createdAt: { type: Date, default: () => new Date() }
})
```

---

## License

MIT
