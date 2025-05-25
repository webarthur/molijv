import { Schema } from '../molijv'

describe('Number', () => {

  describe('type validation', () => {
    test('should return value if valid number', () => {
      let schema = new Schema({ age: { type: Number } })
      expect(schema.validate({ age: 42 }).age).toBe(42)
    })
    test('should return value if valid number', () => {
      let schema = new Schema({ age: { type: 'Number' } })
      expect(schema.validate({ age: 42 }).age).toBe(42)
    })

    test('should coerce string to number if allowed', () => {
      let schema = new Schema({ age: { type: Number } })
      expect(schema.validate({ age: '42' }).age).toBe(42)
      expect(schema.validate({ age: '3.14' }).age).toBe(3.14)
    })

    test('should throw if value is not number and coerce is false', () => {
      let schema = new Schema({ age: { type: Number, coerce: false } })
      expect(() => schema.validate({ age: '42' })).toThrow()
    })

    test('should throw if value is NaN or not finite', () => {
      let schema = new Schema({ age: { type: Number } })
      expect(() => schema.validate({ age: Infinity })).toThrow('must be a valid finite number')
      expect(() => schema.validate({ age: -Infinity })).toThrow('must be a valid finite number')
    })
  })

  describe('bad values', () => {
    test('should throw if value is not a number', () => {
      let schema = new Schema({ age: { type: Number } })
      expect(() => schema.validate({ age: NaN })).toThrow('must be a number')
      expect(() => schema.validate({ age: 'abc' })).toThrow('must be a number')
      expect(() => schema.validate({ age: {} })).toThrow('must be a number')
    })
  })

  describe('default', () => {
    test('should return default value if value is undefined', () => {
      let schema = new Schema({ age: { type: Number, default: 10 } })
      expect(schema.validate({}).age).toBe(10)
    })
    test('should not override existing value with default', () => {
      let schema = new Schema({ age: { type: Number, default: 5 } })
      expect(schema.validate({ age: 7 }).age).toBe(7)
    })
  })

  describe('required', () => {
    test('should throw if value is undefined and required', () => {
      let schema = new Schema({ age: { type: Number, required: true } })
      expect(() => schema.validate({})).toThrow('required')
    })
    test('should throw if value is null and required', () => {
      let schema = new Schema({ age: { type: Number, required: true } })
      expect(() => schema.validate({ age: null })).toThrow('required')
    })
    test('should throw if value is a empty string and required', () => {
      let schema = new Schema({ age: { type: Number, required: true } })
      expect(() => schema.validate({ age: '' })).toThrow('required')
    })
    test('should return undefined if not required and value is undefined', () => {
      let schema = new Schema({ age: { type: Number } })
      expect(schema.validate({}).age).toBeUndefined()
    })
  })

  describe('min/max', () => {
    test('should throw if value is less than min', () => {
      let schema = new Schema({ age: { type: Number, min: 10 } })
      expect(() => schema.validate({ age: 5 })).toThrow('must be >= 10')
    })
    test('should throw if value is greater than max', () => {
      let schema = new Schema({ age: { type: Number, max: 20 } })
      expect(() => schema.validate({ age: 21 })).toThrow('must be <= 20')
    })
    test('should return value if within min/max', () => {
      let schema = new Schema({ age: { type: Number, min: 5, max: 10 } })
      expect(schema.validate({ age: 7 }).age).toBe(7)
    })
  })

  describe('enum', () => {
    test('should throw if value is not in enum', () => {
      let schema = new Schema({ age: { type: Number, enum: [1, 2, 3] } })
      expect(() => schema.validate({ age: 4 })).toThrow()
    })
    test('should return value if in enum', () => {
      let schema = new Schema({ age: { type: Number, enum: [1, 2, 3] } })
      expect(schema.validate({ age: 2 }).age).toBe(2)
    })
  })

  describe('custom message', () => {
    test('should throw custom message if required', () => {
      let schema = new Schema({ age: { type: Number, required: [true, 'custom message'] } })
      expect(() => schema.validate({})).toThrow('custom message')
    })
    test('should throw custom message if not number', () => {
      let schema = new Schema({ age: { type: Number, coerce: false, message: 'not number' } })
      expect(() => schema.validate({ age: '42' })).toThrow('not number')
    })
    test('should throw custom message for min', () => {
      let schema = new Schema({ age: { type: Number, min: [10, 'too small'] } })
      expect(() => schema.validate({ age: 5 })).toThrow('too small')
    })
    test('should throw custom message for max', () => {
      let schema = new Schema({ age: { type: Number, max: [20, 'too big'] } })
      expect(() => schema.validate({ age: 25 })).toThrow('too big')
    })
  })

  describe('validate', () => {
    test('should throw if custom validation fails', () => {
      let schema = new Schema({ age: { type: Number, validate: (v) => v !== 42 } })
      expect(() => schema.validate({ age: 42 })).toThrow()
    })
    test('should return value if custom validation passes', () => {
      let schema = new Schema({ age: { type: Number, validate: (v) => v !== 42 } })
      expect(schema.validate({ age: 10 }).age).toBe(10)
    })
  })

})
