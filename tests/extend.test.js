import { Schema } from '../molijv.js'

describe('extend()', () => {
  test('should add new fields to schema', () => {
    const schema = new Schema({
      name: { type: String, required: true }
    })

    const extended = schema.extend({
      age: { type: Number, required: true }
    })

    expect(Object.keys(extended.shape)).toContain('name')
    expect(Object.keys(extended.shape)).toContain('age')
  })

  test('should override existing fields', () => {
    const schema = new Schema({
      name: { type: String, required: true }
    })

    const extended = schema.extend({
      name: { type: String, required: false }
    })

    expect(extended.shape.name.required).toBe(false)
  })

  test('should return a new Schema instance', () => {
    const schema = new Schema({
      name: { type: String }
    })

    const extended = schema.extend({ age: { type: Number } })
    expect(extended).not.toBe(schema)
    expect(extended).toBeInstanceOf(Schema)
  })

  test('should not mutate original schema', () => {
    const schema = new Schema({
      name: { type: String }
    })

    schema.extend({ age: { type: Number } })
    expect(Object.keys(schema.shape)).toEqual(['name'])
  })

  test('should allow chaining with other methods', () => {
    const schema = new Schema({
      name: { type: String, required: true }
    })

    const result = schema.extend({
      age: { type: Number, required: true }
    }).partial(['age'])

    expect(result).toBeInstanceOf(Schema)
    expect(() => result.parse({ name: 'Arthur' })).not.toThrow()
  })

  test('should validate with extended fields', () => {
    const schema = new Schema({
      name: { type: String }
    })

    const extended = schema.extend({
      age: { type: Number, required: true }
    })

    expect(() => extended.parse({ name: 'Arthur' })).toThrow()
    expect(() => extended.parse({ name: 'Arthur', age: 25 })).not.toThrow()
  })
})
