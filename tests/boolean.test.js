import { Schema } from '../molijv'

describe('Boolean', () => {

  describe('type validation', () => {
    test('should return value if valid boolean', () => {
      let schema = new Schema({ active: Boolean })
      expect(schema.validate({ active: false }).active).toBe(false)
    })
    test('should return value if valid boolean', () => {
      let schema = new Schema({ active: { type: Boolean } })
      expect(schema.validate({ active: true }).active).toBe(true)
      expect(schema.validate({ active: false }).active).toBe(false)
    })

    test('should return value if valid boolean string (coerce)', () => {
      let schema = new Schema({ active: { type: Boolean } })
      expect(schema.validate({ active: 'true' }).active).toBe(true)
      expect(schema.validate({ active: 'false' }).active).toBe(false)
      expect(schema.validate({ active: 'yes' }).active).toBe(true)
      expect(schema.validate({ active: 'no' }).active).toBe(false)
      expect(schema.validate({ active: '1' }).active).toBe(true)
      expect(schema.validate({ active: '0' }).active).toBe(false)
      expect(schema.validate({ active: 1 }).active).toBe(true)
      expect(schema.validate({ active: 0 }).active).toBe(false)
    })

    test('should throw if value is not boolean and coerce is false', () => {
      let schema = new Schema({ active: { type: Boolean, coerce: false } })
      expect(() => schema.validate({ active: 'true' })).toThrow('must be a boolean')
      expect(() => schema.validate({ active: 1 })).toThrow('must be a boolean')
    })
  })

  describe('bad values', () => {
    test('should throw if string is not allowed', () => {
      let schema = new Schema({ active: { type: Boolean } })
      expect(() => schema.validate({ active: 'maybe' })).toThrow('must be a boolean')
    })

    test('should throw if value is not boolean', () => {
      let schema = new Schema({ active: { type: Boolean } })
      expect(() => schema.validate({ active: 123 })).toThrow('must be a boolean')
      expect(() => schema.validate({ active: {} })).toThrow('must be a boolean')
    })
  })

  describe('default', () => {
    test('should return default value if value is undefined', () => {
      let schema = new Schema({ active: { type: Boolean, default: true } })
      expect(schema.validate({}).active).toBe(true)
    })
    test('should not override existing value with default', () => {
      let schema = new Schema({ active: { type: Boolean, default: false } })
      expect(schema.validate({ active: true }).active).toBe(true)
    })
  })

  describe('required', () => {
    test('should throw if value is undefined and required', () => {
      let schema = new Schema({ active: { type: Boolean, required: true } })
      expect(() => schema.validate({})).toThrow('required')
    })
    test('should return undefined if not required and value is undefined', () => {
      let schema = new Schema({ active: { type: Boolean } })
      expect(schema.validate({}).active).toBeUndefined()
    })
    test('should not treat false as empty', () => {
      let schema = new Schema({ active: { type: Boolean, required: true } })
      expect(schema.validate({ active: false }).active).toBe(false)
    })
  })

  describe('enum', () => {
    test('should throw if value is not in enum', () => {
      let schema = new Schema({ active: { type: Boolean, enum: [true] } })
      expect(() => schema.validate({ active: false })).toThrow()
    })
    test('should return value if in enum', () => {
      let schema = new Schema({ active: { type: Boolean, enum: [false] } })
      expect(schema.validate({ active: false }).active).toBe(false)
    })
  })

  describe('custom message', () => {
    test('should throw custom message if required', () => {
      let schema = new Schema({ active: { type: Boolean, required: [true, 'custom message'] } })
      expect(() => schema.validate({})).toThrow('custom message')
    })
    test('should throw custom message if not boolean', () => {
      let schema = new Schema({ active: { type: Boolean, coerce: false, message: 'not bool' } })
      expect(() => schema.validate({ active: 'true' })).toThrow('not bool')
    })
  })

  describe('validate', () => {
    test('should throw if custom validation fails', () => {
      let schema = new Schema({ active: { type: Boolean, validate: (v) => v !== true } })
      expect(() => schema.validate({ active: true })).toThrow()
    })
    test('should return value if custom validation passes', () => {
      let schema = new Schema({ active: { type: Boolean, validate: (v) => v !== true } })
      expect(schema.validate({ active: false }).active).toBe(false)
    })
  })

})
