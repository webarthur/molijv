import { Schema } from '../molijv.js'

describe('merge', () => {
  test('merge combines schemas', () => {
    const schema1 = new Schema({
      name: { type: String, required: true },
      age: { type: Number }
    })

    const schema2 = new Schema({
      email: { type: String, required: true }
    })

    const merged = schema1.merge(schema2)

    const result = merged.parse({
      name: 'John',
      age: 30,
      email: 'john@example.com'
    })

    expect(result).toEqual({
      name: 'John',
      age: 30,
      email: 'john@example.com'
    })
  })

  test('merge overrides fields from first schema', () => {
    const schema1 = new Schema({
      name: { type: String },
      role: { type: String, default: 'user' }
    })

    const schema2 = new Schema({
      role: { type: String, default: 'admin' }
    })

    const merged = schema1.merge(schema2)

    const result = merged.parse({})

    expect(result.role).toBe('admin')
  })

  test('merge does not mutate original schemas', () => {
    const schema1 = new Schema({
      name: { type: String }
    })

    const schema2 = new Schema({
      email: { type: String }
    })

    const merged = schema1.merge(schema2)

    expect(Object.keys(schema1.shape)).toEqual(['name'])
    expect(Object.keys(schema2.shape)).toEqual(['email'])
  })

  test('merge with empty schema', () => {
    const schema1 = new Schema({
      name: { type: String, required: true }
    })

    const schema2 = new Schema({})

    const merged = schema1.merge(schema2)

    expect(merged.parse({ name: 'John' })).toEqual({ name: 'John' })
  })

  test('merge is chainable', () => {
    const schema1 = new Schema({
      name: String
    })

    const schema2 = new Schema({
      email: String
    })

    const schema3 = new Schema({
      age: Number
    })

    const merged = schema1.merge(schema2).merge(schema3)

    const result = merged.parse({
      name: 'John',
      email: 'john@example.com',
      age: 30
    })

    expect(result).toEqual({
      name: 'John',
      email: 'john@example.com',
      age: 30
    })
  })

  test('merge with required fields', () => {
    const schema1 = new Schema({
      name: { type: String, required: true },
      age: { type: Number }
    })

    const schema2 = new Schema({
      email: { type: String, required: true }
    })

    const merged = schema1.merge(schema2)

    expect(() => {
      merged.parse({ name: 'John' })
    }).toThrow()
  })

  test('merge throws on non-Schema argument', () => {
    const schema = new Schema({ name: String })

    expect(() => {
      schema.merge({ name: String })
    }).toThrow(TypeError)
  })

  test('merge with partial schemas', () => {
    const schema1 = new Schema({
      name: { type: String, required: true }
    }).partial()

    const schema2 = new Schema({
      email: { type: String, required: true }
    })

    const merged = schema1.merge(schema2)

    const result = merged.parse({ email: 'test@example.com' })

    expect(result).toEqual({ email: 'test@example.com' })
  })
})
