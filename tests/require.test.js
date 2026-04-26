import { Schema } from '../molijv.js'

describe('require()', () => {
  test('should make all fields required when called without arguments', () => {
    const schema = new Schema({
      name: { type: String },
      age: { type: Number }
    })

    const requiredSchema = schema.require()
    expect(() => requiredSchema.parse({})).toThrow()
    expect(() => requiredSchema.parse({ name: 'Arthur' })).toThrow()
  })

  test('should make specific fields required', () => {
    const schema = new Schema({
      name: { type: String },
      age: { type: Number }
    })

    const requiredSchema = schema.require(['name'])
    expect(() => requiredSchema.parse({ age: 25 })).toThrow()
    expect(() => requiredSchema.parse({ name: 'Arthur' })).not.toThrow()
  })

  test('should return a new Schema instance', () => {
    const schema = new Schema({
      name: { type: String }
    })

    const requiredSchema = schema.require()
    expect(requiredSchema).not.toBe(schema)
    expect(requiredSchema).toBeInstanceOf(Schema)
  })

  test('should not mutate original schema', () => {
    const schema = new Schema({
      name: { type: String },
      age: { type: Number }
    })

    schema.require()
    expect(() => schema.parse({})).not.toThrow()
  })
})
