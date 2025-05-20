import { Schema } from '../molijv'

describe('Object', () => {

  describe('type validation', () => {
    // test('should return value if valid object', () => {
    //   let schema = new Schema({ meta: { type: Object } })
    //   let obj = { foo: 'bar' }
    //   expect(schema.validate({ meta: obj }).meta.foo).toBe('bar')
    // })

    test('should throw if value is not object and coerce is false', () => {
      let schema = new Schema({ meta: { type: Object, coerce: false } })
      expect(() => schema.validate({ meta: 'not-object' })).toThrow('must be an object')
      expect(() => schema.validate({ meta: 123 })).toThrow('must be an object')
      expect(() => schema.validate({ meta: null })).toThrow('must be an object')
      expect(() => schema.validate({ meta: [] })).toThrow('must be an object')
    })
  })

  describe('bad values', () => {
    test('should throw if value is not an object', () => {
      let schema = new Schema({ meta: { type: Object } })
      expect(() => schema.validate({ meta: 123 })).toThrow('must be an object')
      // expect(() => schema.validate({ meta: null })).toThrow('must be an object')
      expect(() => schema.validate({ meta: [] })).toThrow('must be an object')
      expect(() => schema.validate({ meta: 'string' })).toThrow('must be an object')
    })
  })

  describe('default', () => {
    test('should return default value if value is undefined', () => {
      let def = { foo: 1 }
      let schema = new Schema({ meta: { type: Object, default: def } })
      expect(schema.validate({}).meta.foo).toBe(1)
    })
    test('should not override existing value with default', () => {
      let schema = new Schema({ meta: { type: Object, default: { foo: 1 } } })
      expect(schema.validate({ meta: { foo: 2 } }).meta.foo).toBe(2)
    })
  })

  describe('required', () => {
    test('should throw if value is undefined and required', () => {
      let schema = new Schema({ meta: { type: Object, required: true } })
      expect(() => schema.validate({})).toThrow('required')
    })
    test('should throw if value is null and required', () => {
      let schema = new Schema({ meta: { type: Object, required: true } })
      expect(() => schema.validate({ meta: null })).toThrow('required')
    })
    test('should throw if value is empty string and required', () => {
      let schema = new Schema({ meta: { type: Object, required: true } })
      expect(() => schema.validate({ meta: '' })).toThrow('required')
    })
    test('should return undefined if not required and value is undefined', () => {
      let schema = new Schema({ meta: { type: Object } })
      expect(schema.validate({}).meta).toBeUndefined()
    })
  })

  describe('custom message', () => {
    test('should throw custom message if required', () => {
      let schema = new Schema({ meta: { type: Object, required: [true, 'custom message'] } })
      expect(() => schema.validate({})).toThrow('custom message')
    })
    test('should throw custom message if not object', () => {
      let schema = new Schema({ meta: { type: Object, coerce: false, message: 'not object' } })
      expect(() => schema.validate({ meta: 123 })).toThrow('not object')
    })
  })

  describe('validate', () => {
    test('should throw if custom validation fails', () => {
      let schema = new Schema({ meta: { type: Object, validate: (v) => v && v.foo !== 1 } })
      expect(() => schema.validate({ meta: { foo: 1 } })).toThrow()
    })
    // test('should return value if custom validation passes', () => {
    //   let schema = new Schema({ meta: { type: Object, validate: (v) => v && v.foo !== 1 } })
    //   expect(schema.validate({ meta: { foo: 2 } }).meta).toEqual({ foo: 2 })
    // })
  })

})
