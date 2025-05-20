import { Schema, Decimal128 } from '../molijv'

describe('Decimal128', () => {

  describe('type validation', () => {
    test('should return value if valid decimal', () => {
      let schema = new Schema({ value: { type: Decimal128 } })
      expect(schema.validate({ value: 3.14 }).value).toBe(3.14)
    })

    test('should coerce string to decimal if allowed', () => {
      let schema = new Schema({ value: { type: Decimal128 } })
      expect(schema.validate({ value: '3.14' }).value).toBe(3.14)
      expect(schema.validate({ value: '42' }).value).toBe(42)
    })

    test('should throw if value is not number and coerce is false', () => {
      let schema = new Schema({ value: { type: Decimal128, coerce: false } })
      expect(() => schema.validate({ value: '3.14' })).toThrow('must be a finite decimal number')
      // expect(() => schema.validate({ value: null })).toThrow('must be a finite decimal number')
    })

    test('should throw if value is not finite', () => {
      let schema = new Schema({ value: { type: Decimal128 } })
      expect(() => schema.validate({ value: NaN })).toThrow('must be a finite decimal number')
      expect(() => schema.validate({ value: Infinity })).toThrow('must be a finite decimal number')
    })
  })

  describe('bad values', () => {
    test('should throw if value is not a number', () => {
      let schema = new Schema({ value: { type: Decimal128 } })
      expect(() => schema.validate({ value: 'abc' })).toThrow('must be a finite decimal number')
      expect(() => schema.validate({ value: {} })).toThrow('must be a finite decimal number')
    })
  })

  describe('default', () => {
    test('should return default value if value is undefined', () => {
      let schema = new Schema({ value: { type: Decimal128, default: 1.23 } })
      expect(schema.validate({}).value).toBe(1.23)
    })
    test('should not override existing value with default', () => {
      let schema = new Schema({ value: { type: Decimal128, default: 1.23 } })
      expect(schema.validate({ value: 2.34 }).value).toBe(2.34)
    })
  })

  describe('required', () => {
    test('should throw if value is undefined and required', () => {
      let schema = new Schema({ value: { type: Decimal128, required: true } })
      expect(() => schema.validate({})).toThrow('required')
    })
    test('should throw if value is null and required', () => {
      let schema = new Schema({ value: { type: Decimal128, required: true } })
      expect(() => schema.validate({ value: null })).toThrow('required')
    })
    test('should throw if value is empty string and required', () => {
      let schema = new Schema({ value: { type: Decimal128, required: true } })
      expect(() => schema.validate({ value: '' })).toThrow('required')
    })
    test('should return undefined if not required and value is undefined', () => {
      let schema = new Schema({ value: { type: Decimal128 } })
      expect(schema.validate({}).value).toBeUndefined()
    })
  })

  describe('min/max', () => {
    test('should throw if value is less than min', () => {
      let schema = new Schema({ value: { type: Decimal128, min: 1.5 } })
      expect(() => schema.validate({ value: 1.4 })).toThrow('must be >= 1.5')
    })
    test('should throw if value is greater than max', () => {
      let schema = new Schema({ value: { type: Decimal128, max: 2.5 } })
      expect(() => schema.validate({ value: 2.6 })).toThrow('must be <= 2.5')
    })
    test('should return value if within min/max', () => {
      let schema = new Schema({ value: { type: Decimal128, min: 1.5, max: 2.5 } })
      expect(schema.validate({ value: 2.0 }).value).toBe(2.0)
    })
  })

  describe('enum', () => {
    test('should throw if value is not in enum', () => {
      let schema = new Schema({ value: { type: Decimal128, enum: [1.1, 2.2, 3.3] } })
      expect(() => schema.validate({ value: 4.4 })).toThrow()
    })
    test('should return value if in enum', () => {
      let schema = new Schema({ value: { type: Decimal128, enum: [1.1, 2.2, 3.3] } })
      expect(schema.validate({ value: 2.2 }).value).toBe(2.2)
    })
  })

  describe('custom message', () => {
    test('should throw custom message if required', () => {
      let schema = new Schema({ value: { type: Decimal128, required: [true, 'custom message'] } })
      expect(() => schema.validate({})).toThrow('custom message')
    })
    test('should throw custom message if not decimal', () => {
      let schema = new Schema({ value: { type: Decimal128, coerce: false, message: 'not decimal' } })
      expect(() => schema.validate({ value: '3.14' })).toThrow('not decimal')
    })
    test('should throw custom message for min', () => {
      let schema = new Schema({ value: { type: Decimal128, min: [1.5, 'too small'] } })
      expect(() => schema.validate({ value: 1.4 })).toThrow('too small')
    })
    test('should throw custom message for max', () => {
      let schema = new Schema({ value: { type: Decimal128, max: [2.5, 'too big'] } })
      expect(() => schema.validate({ value: 2.6 })).toThrow('too big')
    })
  })

  describe('validate', () => {
    test('should throw if custom validation fails', () => {
      let schema = new Schema({ value: { type: Decimal128, validate: (v) => v !== 3.14 } })
      expect(() => schema.validate({ value: 3.14 })).toThrow()
    })
    test('should return value if custom validation passes', () => {
      let schema = new Schema({ value: { type: Decimal128, validate: (v) => v !== 3.14 } })
      expect(schema.validate({ value: 2.71 }).value).toBe(2.71)
    })
  })

})
