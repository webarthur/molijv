import { Schema } from '../molijv'

describe('String', () => {

  describe('type validation', () => {
    test('should return value if valid string', () => {
      let schema = new Schema({ name: String })
      expect(schema.validate({ name: 'Arthur' }).name).toBe('Arthur')
    })
    test('should return value if valid string', () => {
      let schema = new Schema({ name: String })
      expect(schema.validate({ name: 42 }).name).toBe('42')
    })
    test('should return value if valid string', () => {
      let schema = new Schema({ name: { type: String } })
      expect(schema.validate({ name: 'Arthur' }).name).toBe('Arthur')
    })
    test('should return value if valid string', () => {
      let schema = new Schema({ name: { type: 'String' } })
      expect(schema.validate({ name: 'Arthur' }).name).toBe('Arthur')
    })
    test('should allow empty string if not required', () => {
      let schema = new Schema({ name: { type: String } })
      expect(schema.validate({ name: '' }).name).toBe('')
    })
    test('should throw if value is not a string and coerce is false', () => {
      let schema = new Schema({ name: { type: String, coerce: false } })
      expect(() => schema.validate({ name: 123 })).toThrow('must be a string')
    })
  })

  describe('bad values', () => {
    // test('should throw if value is not a string and coerce is not set', () => {
    //   let schema = new Schema({ name: { type: String } })
    //   expect(() => schema.validate({ name: 123 })).toThrow('must be a string')
    // })
    test('should throw if string shorter than minLength', () => {
      let schema = new Schema({ name: { type: String, minLength: 5 } })
      expect(() => schema.validate({ name: 'abc' })).toThrow('length must be >= 5')
    })
    test('should throw if string longer than maxLength', () => {
      let schema = new Schema({ name: { type: String, maxLength: 3 } })
      expect(() => schema.validate({ name: 'abcd' })).toThrow('length must be <= 3')
    })
    test('should throw if string is empty and required', () => {
      let schema = new Schema({ name: { type: String, trim: true, required: true } })
      expect(() => schema.validate({ name: '  ' })).toThrow('is required')
    })
    test('should throw if value is an object', () => {
      let schema = new Schema({ name: { type: String } })
      expect(() => schema.validate({ name: {} })).toThrow('string')
    })
  })

  describe('default', () => {
    test('should return default value if value is undefined', () => {
      let schema = new Schema({ name: { type: String, default: 'Arthur' } })
      expect(schema.validate({}).name).toBe('Arthur')
    })
    test('should not override existing value with default', () => {
      let schema = new Schema({ name: { type: String, default: 'Arthur' } })
      expect(schema.validate({ name: 'Bob' }).name).toBe('Bob')
    })
  })

  describe('required', () => {
    test('should throw if empty string and required', () => {
      let schema = new Schema({ name: { type: String, required: true } })
      expect(() => schema.validate({ name: '' })).toThrow('required')
    })
    test('should return undefined if not required and value is undefined', () => {
      let schema = new Schema({ name: { type: String } })
      expect(schema.validate({}).name).toBeUndefined()
    })
    test('should throw if value is null and required', () => {
      let schema = new Schema({ name: { type: String, required: true } })
      expect(() => schema.validate({ name: null })).toThrow('required')
    })
  })

  describe('enum', () => {
    test('should throw if value is not in enum', () => {
      let schema = new Schema({ name: { type: String, enum: ['Arthur', 'Bob'] } })
      expect(() => schema.validate({ name: 'Charlie' })).toThrow()
    })
    test('should return value if in enum', () => {
      let schema = new Schema({ name: { type: String, enum: ['Arthur', 'Bob'] } })
      expect(schema.validate({ name: 'Arthur' }).name).toBe('Arthur')
    })
  })

  describe('match', () => {
    test('should throw if value does not match regex', () => {
      let schema = new Schema({ name: { type: String, match: /^[A-Z]/ } })
      expect(() => schema.validate({ name: 'arthur' })).toThrow()
    })
    test('should return value if matches regex', () => {
      let schema = new Schema({ name: { type: String, match: /^[A-Z]/ } })
      expect(schema.validate({ name: 'Arthur' }).name).toBe('Arthur')
    })
  })

  describe('custom message', () => {
    test('should throw if required and value is undefined', () => {
      let schema = new Schema({ name: { type: String, required: [true, 'custom message'] } })
      expect(() => schema.validate({})).toThrow('custom message')
    })
  })

  describe('validate', () => {
    test('should throw if custom validation fails', () => {
      let schema = new Schema({ name: { 
        type: String, 
        validate: (value) => value !== 'Arthur' } 
      })
      expect(() => schema.validate({ name: 'Arthur' })).toThrow()
    })
    test('should return value if custom validation passes', () => {
      let schema = new Schema({ name: { type: String, validate: (value) => value !== 'Arthur' } })
      expect(schema.validate({ name: 'Bob' }).name).toBe('Bob')
    })
  })

  describe('extra', () => {
    test('should trim string if trim is true', () => {
      let schema = new Schema({ name: { type: String, trim: true } })
      expect(schema.validate({ name: '  Arthur  ' }).name).toBe('Arthur')
    })
    test('should lowercase string if lowercase is true', () => {
      let schema = new Schema({ name: { type: String, lowercase: true } })
      expect(schema.validate({ name: 'ARTHUR' }).name).toBe('arthur')
    })
    test('should uppercase string if uppercase is true', () => {
      let schema = new Schema({ name: { type: String, uppercase: true } })
      expect(schema.validate({ name: 'arthur' }).name).toBe('ARTHUR')
    })
  })

})

