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

  test('pick(string) selects one field', () => {
    const schema = new Schema({
      name: { type: String },
      age: { type: Number }
    })

    const pickedSchema = schema.pick('name')
    const result = pickedSchema.parse({ name: 'Arthur', age: 25 })
    expect(result.name).toBe('Arthur')
    expect(result.age).toBeUndefined()
  })

  test('pick(object map) selects keys with truthy values', () => {
    const schema = new Schema({
      name: { type: String },
      age: { type: Number },
      email: { type: String }
    })

    const pickedSchema = schema.pick({ name: 1, age: 0, email: true })
    const result = pickedSchema.parse({ name: 'Arthur', age: 25, email: 'a@b.co' })
    expect(result.name).toBe('Arthur')
    expect(result.email).toBe('a@b.co')
    expect(result.age).toBeUndefined()
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

  test('pick(Mongo-style projection object) with many keys', () => {
    const schema = new Schema({
      name: { type: String },
      cpf: { type: String },
      email: { type: String },
      phone: { type: String },
      status: { type: String },
      type: { type: String },
      city: { type: String },
      state: { type: String },
      zipcode: { type: String }
    })

    const projection = {
      name: 1,
      cpf: 1,
      email: 1,
      phone: 1,
      status: 1,
      type: 1,
      city: 1,
      state: 1,
      zipcode: 1
    }

    const pickedSchema = schema.pick(projection)
    const result = pickedSchema.parse({
      name: 'A',
      cpf: '1',
      email: 'a@b.co',
      phone: '0',
      status: 'x',
      type: 'y',
      city: 'c',
      state: 's',
      zipcode: 'z',
      extra: 'ignored'
    })

    expect(Object.keys(result).sort()).toEqual(
      ['city', 'cpf', 'email', 'name', 'phone', 'state', 'status', 'type', 'zipcode'].sort()
    )
    expect(result.extra).toBeUndefined()
  })

  test('pick after schema uses string type names in field objects', () => {
    const schema = new Schema({
      name: { type: 'string', required: true },
      age: { type: 'number' },
      email: { type: 'string' }
    })

    const pickedSchema = schema.pick({ name: 1, email: 1 })
    const result = pickedSchema.parse({ name: 'Arthur', age: 30, email: 'a@b.co' })
    expect(result.name).toBe('Arthur')
    expect(result.email).toBe('a@b.co')
    expect(result.age).toBeUndefined()
  })

  test('pick with top-level string shorthand field defs', () => {
    const schema = new Schema({
      name: 'string',
      age: 'number',
      email: 'string'
    })

    const pickedSchema = schema.pick({ name: 1, email: 1 })
    const result = pickedSchema.parse({ name: 'Arthur', age: 25, email: 'a@b.co' })
    expect(result.name).toBe('Arthur')
    expect(result.email).toBe('a@b.co')
    expect(result.age).toBeUndefined()
  })
})
