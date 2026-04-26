import { Schema } from '../molijv.js'

describe('shape', () => {
  test('should return the schema definition', () => {
    const schemaDef = {
      name: { type: String, required: true },
      age: { type: Number, required: true }
    }
    const schema = new Schema(schemaDef)
    
    expect(schema.shape).toEqual(schemaDef)
  })

  test('should return the shape after partial()', () => {
    const schema = new Schema({
      name: { type: String, required: true },
      age: { type: Number, required: true }
    })

    const partialSchema = schema.partial()
    expect(partialSchema.shape.name.required).toBe(false)
    expect(partialSchema.shape.age.required).toBe(false)
  })

  test('should return the shape after pick()', () => {
    const schema = new Schema({
      name: { type: String },
      age: { type: Number },
      email: { type: String }
    })

    const pickedSchema = schema.pick(['name', 'age'])
    expect(Object.keys(pickedSchema.shape)).toEqual(['name', 'age'])
  })

  test('should return the shape after omit()', () => {
    const schema = new Schema({
      name: { type: String },
      age: { type: Number },
      email: { type: String }
    })

    const omitSchema = schema.omit(['email'])
    expect(Object.keys(omitSchema.shape)).toEqual(['name', 'age'])
  })

  test('should return the shape after extend()', () => {
    const schema = new Schema({
      name: { type: String }
    })

    const extended = schema.extend({ age: { type: Number } })
    expect(Object.keys(extended.shape)).toEqual(['name', 'age'])
  })
})
