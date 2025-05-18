import { Schema, Int32, Decimal128, Double } from '../molijv'


describe('Schema required attribute', () => {
  test('String required', () => {
    const schema = new Schema({ name: { type: String, required: true } })
    expect(() => schema.validate({})).toThrow(/required/)
    expect(schema.validate({ name: 'abc' }).name).toBe('abc')
  })

  test('Number required', () => {
    const schema = new Schema({ age: { type: Number, required: true } })
    expect(() => schema.validate({})).toThrow(/required/)
    expect(schema.validate({ age: 10 }).age).toBe(10)
  })

  test('Boolean required', () => {
    const schema = new Schema({ flag: { type: Boolean, required: true } })
    expect(() => schema.validate({})).toThrow(/required/)
    expect(schema.validate({ flag: false }).flag).toBe(false)
    expect(schema.validate({ flag: true }).flag).toBe(true)
  })

  test('Date required', () => {
    const schema = new Schema({ created: { type: Date, required: true } })
    expect(() => schema.validate({})).toThrow(/required/)
    expect(schema.validate({ created: new Date('2022-01-01') }).created).toBeInstanceOf(Date)
  })

  test('Object required', () => {
    const schema = new Schema({ obj: { type: Object, required: true } })
    expect(() => schema.validate({})).toThrow(/required/)
    expect(schema.validate({ obj: { a: 1 } }).obj).toEqual({ a: 1 })
  })

  test('Array of primitives required', () => {
    const schema = new Schema({ arr: [{ type: Number, required: true }] })
    expect(() => schema.validate({})).toThrow(/required/)
    expect(schema.validate({ arr: [1, 2] }).arr).toEqual([1, 2])
  })

  // test('Array of objects required', () => {
  //   const schema = new Schema({ items: [{ name: { type: String, required: true } }] })
  //   expect(() => schema.validate({})).toThrow(/required/)
  //   expect(() => schema.validate({ items: [{}] })).toThrow(/required/)
  //   expect(schema.validate({ items: [{ name: 'x' }] }).items[0].name).toBe('x')
  // })

  test('Nested object required', () => {
    const schema = new Schema({
      profile: {
        first: { type: String, required: true },
        last: { type: String }
      }
    })
    expect(() => schema.validate({})).toThrow(/required/)
    expect(() => schema.validate({ profile: { last: 'B' } })).toThrow(/required/)
    expect(schema.validate({ profile: { first: 'A' } }).profile.first).toBe('A')
  })

  test('Int32 required', () => {
    const schema = new Schema({ n: { type: Int32, required: true } })
    expect(() => schema.validate({})).toThrow(/required/)
    expect(schema.validate({ n: 123 }).n).toBe(123)
  })

  test('Decimal128 required', () => {
    const schema = new Schema({ d: { type: Decimal128, required: true } })
    expect(() => schema.validate({})).toThrow(/required/)
    expect(schema.validate({ d: 1.23 }).d).toBe(1.23)
  })

  test('Double required', () => {
    const schema = new Schema({ x: { type: Double, required: true } })
    expect(() => schema.validate({})).toThrow(/required/)
    expect(schema.validate({ x: 2.34 }).x).toBe(2.34)
  })

  test('Required with custom message', () => {
    const schema = new Schema({ foo: { type: String, required: true, message: 'Foo is mandatory' } })
    expect(() => schema.validate({})).toThrow('Foo is mandatory')
  })

  test('Required estilo mongoose', () => {
    const schema = new Schema({ name: { type: String, required: [true, 'Name is required'] } })
    expect(() => schema.validate({})).toThrow('Name is required')
  })
})
