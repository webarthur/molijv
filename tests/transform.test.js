import { Schema } from '../molijv.js'

describe('transform', () => {
  test('should apply transform function to field value', () => {
    const schema = new Schema({
      name: {
        type: String,
        transform: (val) => val.toUpperCase()
      }
    })

    const result = schema.parse({ name: 'arthur' })
    expect(result.name).toBe('ARTHUR')
  })

  test('should transform after type coercion', () => {
    const schema = new Schema({
      age: {
        type: Number,
        transform: (val) => val * 2
      }
    })

    const result = schema.parse({ age: '10' })
    expect(result.age).toBe(20)
  })

  test('should transform multiple fields independently', () => {
    const schema = new Schema({
      name: {
        type: String,
        transform: (val) => val.trim().toUpperCase()
      },
      email: {
        type: String,
        transform: (val) => val.toLowerCase()
      }
    })

    const result = schema.parse({ name: '  john  ', email: 'JOHN@EXAMPLE.COM' })
    expect(result.name).toBe('JOHN')
    expect(result.email).toBe('john@example.com')
  })

  test('should not transform undefined values for optional fields', () => {
    const schema = new Schema({
      nickname: {
        type: String,
        transform: (val) => val.toUpperCase()
      }
    })

    const result = schema.parse({})
    expect(result.nickname).toBeUndefined()
  })

  test('should apply transform after required validation', () => {
    const schema = new Schema({
      name: {
        type: String,
        required: true,
        transform: (val) => val.trim()
      }
    })

    expect(() => schema.parse({ name: '  ' })).toThrow('required')
    const result = schema.parse({ name: '  arthur  ' })
    expect(result.name).toBe('arthur')
  })

  test('should apply transform after enum validation', () => {
    const schema = new Schema({
      status: {
        type: String,
        enum: ['active', 'inactive'],
        transform: (val) => val.toUpperCase()
      }
    })

    const result = schema.parse({ status: 'active' })
    expect(result.status).toBe('ACTIVE')
  })

  test('should apply transform after custom validation', () => {
    const schema = new Schema({
      code: {
        type: String,
        validate: (val) => val.length >= 3,
        transform: (val) => val.toUpperCase()
      }
    })

    expect(() => schema.parse({ code: 'ab' })).toThrow()
    const result = schema.parse({ code: 'abc' })
    expect(result.code).toBe('ABC')
  })

  test('should work with partial()', () => {
    const schema = new Schema({
      name: {
        type: String,
        required: true,
        transform: (val) => val.toUpperCase()
      }
    })

    const partial = schema.partial()
    const result = partial.parse({})
    expect(result.name).toBeUndefined()
  })

  test('should work with pick()', () => {
    const schema = new Schema({
      name: {
        type: String,
        transform: (val) => val.toUpperCase()
      },
      email: {
        type: String,
        transform: (val) => val.toLowerCase()
      }
    })

    const picked = schema.pick(['name'])
    const result = picked.parse({ name: 'john', email: 'JOHN@EXAMPLE.COM' })
    expect(result.name).toBe('JOHN')
    expect(result.email).toBeUndefined()
  })

  test('should throw error if transform is not a function', () => {
    expect(() => {
      new Schema({
        name: {
          type: String,
          transform: 'not a function'
        }
      })
    }).toThrow('transform must be a function')
  })

  test('should transform complex field values', () => {
    const schema = new Schema({
      name: {
        type: String,
        transform: (val) => val.split('').reverse().join('')
      }
    })

    const result = schema.parse({ name: 'abc' })
    expect(result.name).toBe('cba')
  })
})
