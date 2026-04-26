import { Schema } from '../molijv.js'

describe('partial()', () => {
  test('should make all fields optional when called without arguments', () => {
    const schema = new Schema({
      name: { type: String, required: true },
      age: { type: Number, required: true }
    })

    const partialSchema = schema.partial()
    expect(() => partialSchema.parse({})).not.toThrow()
    expect(partialSchema.parse({}).name).toBeUndefined()
  })

  test('should make specific fields optional', () => {
    const schema = new Schema({
      name: { type: String, required: true },
      age: { type: Number, required: true }
    })

    const partialSchema = schema.partial(['age'])
    expect(() => partialSchema.parse({ name: 'Arthur' })).not.toThrow()
    expect(() => schema.parse({ name: 'Arthur' })).toThrow()
  })

  test('should return a new Schema instance', () => {
    const schema = new Schema({
      name: { type: String, required: true }
    })

    const partialSchema = schema.partial()
    expect(partialSchema).not.toBe(schema)
    expect(partialSchema).toBeInstanceOf(Schema)
  })

  test('should not mutate original schema', () => {
    const schema = new Schema({
      name: { type: String, required: true },
      age: { type: Number, required: true }
    })

    schema.partial(['age'])
    expect(() => schema.parse({ name: 'Arthur' })).toThrow()
  })

  test('should allow chaining with other methods', () => {
    const schema = new Schema({
      name: { type: String, required: true },
      age: { type: Number, required: true },
      email: { type: String, required: true }
    })

    const result = schema.partial().pick(['name'])
    expect(result).toBeInstanceOf(Schema)
    expect(() => result.parse({})).not.toThrow()
  })
})
