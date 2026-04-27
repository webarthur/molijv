import { Schema } from '../molijv.js'

describe('pick()', () => {
  test('should select only specified fields', () => {
    const schema = new Schema({
      name: { type: String },
      age: { type: Number },
      email: { type: String }
    })

    const pickedSchema = schema.pick(['name', 'age'])
    const result = pickedSchema.parse({ name: 'Arthur', age: 25, email: 'test@example.com' })
    expect(result.name).toBe('Arthur')
    expect(result.age).toBe(25)
    expect(result.email).toBeUndefined()
  })

  test('should return a new Schema instance', () => {
    const schema = new Schema({
      name: { type: String },
      age: { type: Number }
    })

    const pickedSchema = schema.pick(['name'])
    expect(pickedSchema).not.toBe(schema)
    expect(pickedSchema).toBeInstanceOf(Schema)
  })

  test('should not mutate original schema', () => {
    const schema = new Schema({
      name: { type: String },
      age: { type: Number },
      email: { type: String }
    })

    schema.pick(['name'])
    const result = schema.parse({ name: 'Arthur', age: 25, email: 'test@example.com' })
    expect(result.email).toBeDefined()
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

  test('pick(true) keeps all fields on a new Schema', () => {
    const schema = new Schema({
      name: { type: String },
      age: { type: Number }
    })

    const pickedSchema = schema.pick(true)
    expect(pickedSchema).not.toBe(schema)
    const result = pickedSchema.parse({ name: 'Arthur', age: 25 })
    expect(result.name).toBe('Arthur')
    expect(result.age).toBe(25)
  })

  test('should ignore fields not in original schema', () => {
    const schema = new Schema({
      name: { type: String },
      age: { type: Number }
    })

    const pickedSchema = schema.pick(['name', 'nonexistent'])
    const result = pickedSchema.parse({ name: 'Arthur' })
    expect(result.name).toBe('Arthur')
  })
})
