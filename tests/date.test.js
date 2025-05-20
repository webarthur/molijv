import { Schema } from '../molijv'

describe('Date', () => {

  describe('type validation', () => {
    test('should return value if valid Date', () => {
      let schema = new Schema({ created: { type: Date } })
      let d = new Date('2020-01-01')
      expect(schema.validate({ created: d }).created).toEqual(d)
    })
    test('should coerce string to Date if allowed', () => {
      let schema = new Schema({ created: { type: Date } })
      let d = '2020-01-01'
      expect(schema.validate({ created: d }).created).toEqual(new Date(d))
    })
    test('should throw if value is not Date and coerce is false', () => {
      let schema = new Schema({ created: { type: Date, coerce: false } })
      expect(() => schema.validate({ created: '2020-01-01' })).toThrow('must be a valid date')
      expect(() => schema.validate({ created: 123 })).toThrow('must be a valid date')
    })
  })

  describe('bad values', () => {
    test('should throw if value is invalid date', () => {
      let schema = new Schema({ created: { type: Date } })
      expect(() => schema.validate({ created: 'not-a-date' })).toThrow('must be a valid date')
    })
    test('should throw if value is not a date', () => {
      let schema = new Schema({ created: { type: Date } })
      expect(() => schema.validate({ created: {} })).toThrow('must be a valid date')
      expect(() => schema.validate({ created: [] })).toThrow('must be a valid date')
    })
  })

  describe('default', () => {
    test('should return default value if value is undefined', () => {
      let d = new Date('2020-01-01')
      let schema = new Schema({ created: { type: Date, default: d } })
      expect(schema.validate({}).created).toEqual(d)
    })
    test('should not override existing value with default', () => {
      let d = new Date('2020-01-01')
      let d2 = new Date('2022-01-01')
      let schema = new Schema({ created: { type: Date, default: d } })
      expect(schema.validate({ created: d2 }).created).toEqual(d2)
    })
  })

  describe('required', () => {
    test('should throw if value is undefined and required', () => {
      let schema = new Schema({ created: { type: Date, required: true } })
      expect(() => schema.validate({})).toThrow('required')
    })
    test('should throw if value is null and required', () => {
      let schema = new Schema({ created: { type: Date, required: true } })
      expect(() => schema.validate({ created: null })).toThrow('required')
    })
    test('should throw if value is empty string and required', () => {
      let schema = new Schema({ created: { type: Date, required: true } })
      expect(() => schema.validate({ created: '' })).toThrow('required')
    })
    test('should return undefined if not required and value is undefined', () => {
      let schema = new Schema({ created: { type: Date } })
      expect(schema.validate({}).created).toBeUndefined()
    })
  })

  describe('min/max', () => {
    test('should throw if value is less than min', () => {
      let min = new Date('2020-01-01')
      let schema = new Schema({ created: { type: Date, min } })
      expect(() => schema.validate({ created: new Date('2019-01-01') })).toThrow('must be after')
    })
    test('should throw if value is greater than max', () => {
      let max = new Date('2020-01-01')
      let schema = new Schema({ created: { type: Date, max } })
      expect(() => schema.validate({ created: new Date('2021-01-01') })).toThrow('must be before')
    })
    test('should return value if within min/max', () => {
      let min = new Date('2020-01-01')
      let max = new Date('2022-01-01')
      let schema = new Schema({ created: { type: Date, min, max } })
      let d = new Date('2021-01-01')
      expect(schema.validate({ created: d }).created).toEqual(d)
    })
  })

  describe('enum', () => {
    test('should throw if value is not in enum', () => {
      let d1 = new Date('2020-01-01')
      let d2 = new Date('2021-01-01')
      let schema = new Schema({ created: { type: Date, enum: [d1] } })
      expect(() => schema.validate({ created: d2 })).toThrow()
    })
    test('should return value if in enum', () => {
      let d1 = new Date('2020-01-01')
      let schema = new Schema({ created: { type: Date, enum: [d1] } })
      expect(schema.validate({ created: d1 }).created).toEqual(d1)
    })
  })

  describe('custom message', () => {
    test('should throw custom message if required', () => {
      let schema = new Schema({ created: { type: Date, required: [true, 'custom message'] } })
      expect(() => schema.validate({})).toThrow('custom message')
    })
    test('should throw custom message if not date', () => {
      let schema = new Schema({ created: { type: Date, coerce: false, message: 'not date' } })
      expect(() => schema.validate({ created: '2020-01-01' })).toThrow('not date')
    })
    test('should throw custom message for min', () => {
      let min = new Date('2020-01-01')
      let schema = new Schema({ created: { type: Date, min: [min, 'too early'] } })
      expect(() => schema.validate({ created: new Date('2019-01-01') })).toThrow('too early')
    })
    test('should throw custom message for max', () => {
      let max = new Date('2020-01-01')
      let schema = new Schema({ created: { type: Date, max: [max, 'too late'] } })
      expect(() => schema.validate({ created: new Date('2021-01-01') })).toThrow('too late')
    })
  })

  describe('validate', () => {
    test('should throw if custom validation fails', () => {
      let schema = new Schema({ created: { 
        type: Date, 
        validate: (v) => v.getFullYear() !== 2020 
      } })
      expect(() => schema.validate({ created: new Date('2020-10-01') })).toThrow()
    })
    test('should return value if custom validation passes', () => {
      let schema = new Schema({ created: { 
        type: Date, 
        validate: (v) => v.getFullYear() !== 2020 
      } })
      expect(schema.validate({ created: new Date('2021-10-01') }).created).toEqual(new Date('2021-10-01'))
    })
  })

})
