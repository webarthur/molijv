import { ObjectId } from 'mongodb'
import { Schema } from '../molijv'

// Example of a valid ObjectId (24 hexadecimal characters)
const validObjectId = '682b4638d6cdaa22c7e74b7c'
const invalidObjectIdShort = '507f1f77bcf86cd7994390'
const invalidObjectIdLong = '507f1f77bcf86cd79943901111'
const invalidObjectIdChars = '507f1f77bcf86cd79943901g' // contains 'g', invalid

describe('ObjectId', () => {

  describe('type validation', () => {
    test('should validate valid ObjectId string', () => {
      let schema = new Schema({ _id: { type: 'ObjectId' } })
      let result = schema.validate({ _id: validObjectId })
      expect(result._id).toBeDefined()
      expect(typeof result._id).toBe('object')
      expect(result._id.toString()).toBe(validObjectId)
    })

    test('should validate ObjectId as an instance of ObjectId class', () => {
      let schema = new Schema({ _id: { type: 'ObjectId' } })
      let objectIdInstance = new ObjectId(validObjectId)
      let result = schema.validate({ _id: objectIdInstance })
      expect(result._id).toBeDefined()
      expect(result._id instanceof ObjectId).toBe(true)
      expect(result._id.toString()).toBe(validObjectId)
    })
  })

  describe('bad values', () => {
    test('should reject ObjectId with invalid length', () => {
      let schema = new Schema({ _id: { type: 'ObjectId' } })
      expect(() => schema.validate({ _id: invalidObjectIdShort })).toThrow()
      expect(() => schema.validate({ _id: invalidObjectIdLong })).toThrow()
    })

    test('should reject ObjectId with invalid characters', () => {
      let schema = new Schema({ _id: { type: 'ObjectId' } })
      expect(() => schema.validate({ _id: invalidObjectIdChars })).toThrow()
    })

    test('should reject non-string ObjectId', () => {
      let schema = new Schema({ _id: { type: 'ObjectId' } })
      expect(() => schema.validate({ _id: 12345 })).toThrow()
      expect(() => schema.validate({ _id: {} })).toThrow()
      expect(() => schema.validate({ _id: [] })).toThrow()
    })

    test('should reject invalid ObjectId as an instance of ObjectId class', () => {
      let schema = new Schema({ _id: { type: 'ObjectId' } })
      let invalidInstance = { toString: () => invalidObjectIdChars }
      expect(() => schema.validate({ _id: invalidInstance })).toThrow()
    })
  })

  describe('default', () => {
    test('should return default value if value is undefined', () => {
      let def = new ObjectId(validObjectId)
      let schema = new Schema({ _id: { type: 'ObjectId', default: def } })
      expect(schema.validate({})._id.toString()).toBe(validObjectId)
    })
    test('should not override existing value with default', () => {
      let def = new ObjectId(validObjectId)
      let other = new ObjectId('507f1f77bcf86cd799439011')
      let schema = new Schema({ _id: { type: 'ObjectId', default: def } })
      expect(schema.validate({ _id: other })._id.toString()).toBe(other.toString())
    })
  })

  describe('required', () => {
    test('should reject missing ObjectId when required', () => {
      let schema = new Schema({ _id: { type: 'ObjectId', required: true } })
      expect(() => schema.validate({})).toThrow()
    })
    test('should reject null ObjectId when required', () => {
      let schema = new Schema({ _id: { type: 'ObjectId', required: true } })
      expect(() => schema.validate({ _id: null })).toThrow()
    })
    test('should reject empty string ObjectId when required', () => {
      let schema = new Schema({ _id: { type: 'ObjectId', required: true } })
      expect(() => schema.validate({ _id: '' })).toThrow()
    })
    test('should accept missing ObjectId when not required', () => {
      let schema = new Schema({ _id: { type: 'ObjectId', required: false } })
      let result = schema.validate({})
      expect(result._id).toBeUndefined()
    })
  })

  describe('enum', () => {
    test('should throw if value is not in enum', () => {
      let oid1 = new ObjectId(validObjectId)
      let oid2 = new ObjectId('507f1f77bcf86cd799439011')
      let schema = new Schema({ _id: { type: 'ObjectId', enum: [oid1] } })
      expect(() => schema.validate({ _id: oid2 })).toThrow()
    })
    test('should return value if in enum', () => {
      let oid1 = new ObjectId(validObjectId)
      let schema = new Schema({ _id: { type: 'ObjectId', enum: [oid1] } })
      expect(schema.validate({ _id: oid1 })._id.toString()).toBe(oid1.toString())
    })
  })

  describe('custom message', () => {
    test('should throw custom message if required', () => {
      let schema = new Schema({ _id: { type: 'ObjectId', required: [true, 'custom message'] } })
      expect(() => schema.validate({})).toThrow('custom message')
    })
    test('should throw custom message if not valid', () => {
      let schema = new Schema({ _id: { type: 'ObjectId', message: 'not objectid' } })
      expect(() => schema.validate({ _id: 'invalid' })).toThrow('not objectid')
    })
  })

  describe('validate', () => {
    test('should throw if custom validation fails', () => {
      let schema = new Schema({ _id: { type: 'ObjectId', validate: (v) => v.toString() !== validObjectId } })
      expect(() => schema.validate({ _id: validObjectId })).toThrow()
    })
    test('should return value if custom validation passes', () => {
      let schema = new Schema({ _id: { type: 'ObjectId', validate: (v) => v.toString() !== validObjectId } })
      let other = new ObjectId('507f1f77bcf86cd799439011')
      expect(schema.validate({ _id: other })._id.toString()).toBe(other.toString())
    })
  })

})