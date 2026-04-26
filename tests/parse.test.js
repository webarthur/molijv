import { Schema } from '../molijv.js'

describe('parse()', () => {
  test('should validate and return parsed data', () => {
    const schema = new Schema({
      name: { type: String, required: true },
      age: { type: Number, required: true }
    })

    const result = schema.parse({ name: 'Arthur', age: 25 })
    expect(result.name).toBe('Arthur')
    expect(result.age).toBe(25)
  })

  test('should throw if validation fails', () => {
    const schema = new Schema({
      name: { type: String, required: true }
    })

    expect(() => schema.parse({})).toThrow()
  })

  test('should be equivalent to validate()', () => {
    const schema = new Schema({
      name: { type: String }
    })

    const data = { name: 'Arthur' }
    expect(schema.parse(data)).toEqual(schema.validate(data))
  })

  test('should coerce types', () => {
    const schema = new Schema({
      age: { type: Number }
    })

    const result = schema.parse({ age: '25' })
    expect(result.age).toBe(25)
  })
})
