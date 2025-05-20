import { Schema } from '../molijv'

describe('Array', () => {

  describe('type validation', () => {
    test('should return value if valid array', () => {
      let schema = new Schema({ tags: { type: Array } })
      let arr = [1, 2, 3]
      expect(schema.validate({ tags: arr }).tags).toBe(arr)
    })

    test('should throw if value is not array and coerce is false', () => {
      let schema = new Schema({ tags: { type: Array, coerce: false } })
      expect(() => schema.validate({ tags: 'not-array' })).toThrow('must be an array')
      expect(() => schema.validate({ tags: 123 })).toThrow('must be an array')
      expect(() => schema.validate({ tags: null })).toThrow('must be an array')
      expect(() => schema.validate({ tags: {} })).toThrow('must be an array')
    })
  })

  describe('bad values', () => {
    test('should throw if value is not an array', () => {
      let schema = new Schema({ tags: { type: Array } })
      expect(() => schema.validate({ tags: 123 })).toThrow('must be an array')
      // expect(() => schema.validate({ tags: null })).toThrow('must be an array')
      expect(() => schema.validate({ tags: {} })).toThrow('must be an array')
      expect(() => schema.validate({ tags: 'string' })).toThrow('must be an array')
    })
  })

  describe('default', () => {
    test('should return default value if value is undefined', () => {
      let def = [1, 2]
      let schema = new Schema({ tags: { type: Array, default: def } })
      expect(schema.validate({}).tags).toBe(def)
    })
    test('should not override existing value with default', () => {
      let def = [1, 2]
      let arr = [3, 4]
      let schema = new Schema({ tags: { type: Array, default: def } })
      expect(schema.validate({ tags: arr }).tags).toBe(arr)
    })
  })

  describe('required', () => {
    test('should throw if value is undefined and required', () => {
      let schema = new Schema({ tags: { type: Array, required: true } })
      expect(() => schema.validate({})).toThrow('required')
    })
    test('should throw if value is null and required', () => {
      let schema = new Schema({ tags: { type: Array, required: true } })
      expect(() => schema.validate({ tags: null })).toThrow('required')
    })
    test('should throw if value is empty string and required', () => {
      let schema = new Schema({ tags: { type: Array, required: true } })
      expect(() => schema.validate({ tags: '' })).toThrow('required')
    })
    test('should return undefined if not required and value is undefined', () => {
      let schema = new Schema({ tags: { type: Array } })
      expect(schema.validate({}).tags).toBeUndefined()
    })
  })

  // describe('enum', () => {
  //   test('should throw if value is not in enum', () => {
  //     let arr1 = [1, 2]
  //     let arr2 = [3, 4]
  //     let schema = new Schema({ tags: { type: Array, enum: [arr1] } })
  //     expect(() => schema.validate({ tags: arr2 })).toThrow()
  //   })
  //   test('should return value if in enum', () => {
  //     let arr1 = [1, 2]
  //     let schema = new Schema({ tags: { type: Array, enum: [arr1] } })
  //     expect(schema.validate({ tags: arr1 }).tags).toBe(arr1)
  //   })
  // })

  describe('custom message', () => {
    test('should throw custom message if required', () => {
      let schema = new Schema({ tags: { type: Array, required: [true, 'custom message'] } })
      expect(() => schema.validate({})).toThrow('custom message')
    })
    test('should throw custom message if not array', () => {
      let schema = new Schema({ tags: { type: Array, coerce: false, message: 'not array' } })
      expect(() => schema.validate({ tags: 123 })).toThrow('not array')
    })
  })

  describe('validate', () => {
    test('should throw if custom validation fails', () => {
      let schema = new Schema({ tags: { type: Array, validate: (v) => v && v.length !== 2 } })
      expect(() => schema.validate({ tags: [1, 2] })).toThrow()
    })
    test('should return value if custom validation passes', () => {
      let schema = new Schema({ tags: { type: Array, validate: (v) => v && v.length !== 2 } })
      expect(schema.validate({ tags: [1] }).tags).toEqual([1])
    })
  })

})
