import { Schema } from '../molijv.js'

describe('omit()', () => {
  test('should exclude specified fields', () => {
    const schema = new Schema({
      name: { type: String },
      age: { type: Number },
      email: { type: String }
    })

    const omitSchema = schema.omit(['email'])
    const result = omitSchema.parse({ name: 'Arthur', age: 25, email: 'test@example.com' })
    expect(result.name).toBe('Arthur')
    expect(result.age).toBe(25)
    expect(result.email).toBeUndefined()
  })

  test('should exclude multiple fields', () => {
    const schema = new Schema({
      name: { type: String },
      age: { type: Number },
      email: { type: String },
      phone: { type: String }
    })

    const omitSchema = schema.omit(['email', 'phone'])
    const result = omitSchema.parse({ name: 'Arthur', age: 25, email: 'test@example.com', phone: '123' })
    expect(result.name).toBe('Arthur')
    expect(result.age).toBe(25)
    expect(result.email).toBeUndefined()
    expect(result.phone).toBeUndefined()
  })

  test('should return a new Schema instance', () => {
    const schema = new Schema({
      name: { type: String },
      age: { type: Number }
    })

    const omitSchema = schema.omit(['age'])
    expect(omitSchema).not.toBe(schema)
    expect(omitSchema).toBeInstanceOf(Schema)
  })

  test('should not mutate original schema', () => {
    const schema = new Schema({
      name: { type: String },
      age: { type: Number },
      email: { type: String }
    })

    schema.omit(['email'])
    const result = schema.parse({ name: 'Arthur', age: 25, email: 'test@example.com' })
    expect(result.email).toBeDefined()
  })

  test('should allow chaining with other methods', () => {
    const schema = new Schema({
      name: { type: String, required: true },
      age: { type: Number, required: true },
      email: { type: String, required: true }
    })

    const result = schema.omit(['email']).partial()
    expect(result).toBeInstanceOf(Schema)
    expect(() => result.parse({})).not.toThrow()
  })
})
