import { Schema, types } from '../molijv'
const { Int32 } = types

describe('Int32', () => {

  describe('type validation', () => {
    test('should return value if valid int32', () => {
      let schema = new Schema({ count: { type: 'Int' } })
      expect(schema.validate({ count: 42 }).count).toBe(42)
    })
    test('should return value if valid int32', () => {
      let schema = new Schema({ count: { type: Int32 } })
      expect(schema.validate({ count: 42 }).count).toBe(42)
    })

    test('should coerce string to int32 if allowed', () => {
      let schema = new Schema({ count: { type: Int32 } })
      expect(schema.validate({ count: '42' }).count).toBe(42)
    })

    test('should throw if value is not integer and coerce is false', () => {
      let schema = new Schema({ count: { type: 'Int', coerce: false } })
      expect(() => schema.validate({ count: '42' })).toThrow('must be an integer')
      expect(() => schema.validate({ count: 3.14 })).toThrow('must be an integer')
    })

    test('should throw if value is not integer', () => {
      let schema = new Schema({ count: { type: Int32 } })
      expect(() => schema.validate({ count: 3.14 })).toThrow('must be an integer')
      expect(() => schema.validate({ count: 'abc' })).toThrow('must be an integer')
    })
  })

  describe('int32 range', () => {
    test('should throw if value is less than INT32_MIN', () => {
      let schema = new Schema({ count: { type: Int32 } })
      expect(() => schema.validate({ count: -2147483649 })).toThrow('must be an integer')
    })
    test('should throw if value is greater than INT32_MAX', () => {
      let schema = new Schema({ count: { type: Int32 } })
      expect(() => schema.validate({ count: 2147483648 })).toThrow('must be an integer')
    })
    test('should accept INT32_MIN and INT32_MAX', () => {
      let schema = new Schema({ count: { type: Int32 } })
      expect(schema.validate({ count: -2147483648 }).count).toBe(-2147483648)
      expect(schema.validate({ count: 2147483647 }).count).toBe(2147483647)
    })
  })

  describe('default', () => {
    test('should return default value if value is undefined', () => {
      let schema = new Schema({ count: { type: Int32, default: 10 } })
      expect(schema.validate({}).count).toBe(10)
    })
    test('should not override existing value with default', () => {
      let schema = new Schema({ count: { type: Int32, default: 5 } })
      expect(schema.validate({ count: 7 }).count).toBe(7)
    })
  })

  describe('required', () => {
    test('should throw if value is undefined and required', () => {
      let schema = new Schema({ count: { type: Int32, required: true } })
      expect(() => schema.validate({})).toThrow('required')
    })
    test('should throw if value is null and required', () => {
      let schema = new Schema({ count: { type: Int32, required: true } })
      expect(() => schema.validate({ count: null })).toThrow('required')
    })
    test('should throw if value is empty string and required', () => {
      let schema = new Schema({ count: { type: Int32, required: true } })
      expect(() => schema.validate({ count: '' })).toThrow('required')
    })
    test('should return undefined if not required and value is undefined', () => {
      let schema = new Schema({ count: { type: Int32 } })
      expect(schema.validate({}).count).toBeUndefined()
    })
  })

  describe('min/max', () => {
    test('should throw if value is less than min', () => {
      let schema = new Schema({ count: { type: Int32, min: 10 } })
      expect(() => schema.validate({ count: 5 })).toThrow('must be >= 10')
    })
    test('should throw if value is greater than max', () => {
      let schema = new Schema({ count: { type: Int32, max: 20 } })
      expect(() => schema.validate({ count: 21 })).toThrow('must be <= 20')
    })
    test('should return value if within min/max', () => {
      let schema = new Schema({ count: { type: Int32, min: 5, max: 10 } })
      expect(schema.validate({ count: 7 }).count).toBe(7)
    })
  })

  describe('enum', () => {
    test('should throw if value is not in enum', () => {
      let schema = new Schema({ count: { type: Int32, enum: [1, 2, 3] } })
      expect(() => schema.validate({ count: 4 })).toThrow()
    })
    test('should return value if in enum', () => {
      let schema = new Schema({ count: { type: Int32, enum: [1, 2, 3] } })
      expect(schema.validate({ count: 2 }).count).toBe(2)
    })
  })

  describe('custom message', () => {
    test('should throw custom message if required', () => {
      let schema = new Schema({ count: { type: Int32, required: [true, 'custom message'] } })
      expect(() => schema.validate({})).toThrow('custom message')
    })
    test('should throw custom message if not integer', () => {
      let schema = new Schema({ count: { type: Int32, coerce: false, message: 'not int' } })
      expect(() => schema.validate({ count: '42' })).toThrow('not int')
    })
    test('should throw custom message for min', () => {
      let schema = new Schema({ count: { type: Int32, min: [10, 'too small'] } })
      expect(() => schema.validate({ count: 5 })).toThrow('too small')
    })
    test('should throw custom message for max', () => {
      let schema = new Schema({ count: { type: Int32, max: [20, 'too big'] } })
      expect(() => schema.validate({ count: 25 })).toThrow('too big')
    })
  })

  describe('validate', () => {
    test('should throw if custom validation fails', () => {
      let schema = new Schema({ count: { type: Int32, validate: (v) => v !== 42 } })
      expect(() => schema.validate({ count: 42 })).toThrow()
    })
    test('should return value if custom validation passes', () => {
      let schema = new Schema({ count: { type: Int32, validate: (v) => v !== 42 } })
      expect(schema.validate({ count: 10 }).count).toBe(10)
    })
  })

})
