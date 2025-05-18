import { Schema, Int32, Decimal128, Double } from '../molijv'


describe('Schema default attribute', () => {
  test('String default', () => {
    const schema = new Schema({ name: { type: String, default: 'anon' } })
    expect(schema.validate({}).name).toBe('anon')
    expect(schema.validate({ name: 'Arthur' }).name).toBe('Arthur')
  })

  test('Number default', () => {
    const schema = new Schema({ age: { type: Number, default: 18 } })
    expect(schema.validate({}).age).toBe(18)
    expect(schema.validate({ age: 30 }).age).toBe(30)
  })

  test('Boolean default', () => {
    const schema = new Schema({ flag: { type: Boolean, default: true } })
    expect(schema.validate({}).flag).toBe(true)
    expect(schema.validate({ flag: false }).flag).toBe(false)
  })

  test('Date default (static)', () => {
    const schema = new Schema({ created: { type: Date, default: new Date('2022-10-01') } })
    const val = schema.validate({}).created
    expect(val).toBeInstanceOf(Date)
    expect(val.getFullYear()).toBe(2022)
  })

  test('Date default (function)', () => {
    const schema = new Schema({ created: { type: Date, default: () => new Date('2020-10-01') } })
    const val = schema.validate({}).created
    expect(val).toBeInstanceOf(Date)
    expect(val.getFullYear()).toBe(2020)
  })

  test('Date default (Date.now)', () => {
    const schema = new Schema({ created: { type: Date, default: Date.now } })
    const val = schema.validate({}).created
    expect(val).toBeInstanceOf(Date)
    expect(Math.abs(Date.now() - val.getTime())).toBeLessThan(2000)
  })

  test('Object default', () => {
    const schema = new Schema({ obj: { type: Object, default: { a: 1 } } })
    expect(schema.validate({}).obj).toEqual({ a: 1 })
    expect(schema.validate({ obj: { b: 2 } }).obj).toEqual({ b: 2 })
  })

  // test('Array default', () => {
  //   const schema = new Schema({ arr: [{ type: Number, default: 5 }] })
  //   expect(schema.validate({}).arr).toEqual([])
  //   expect(schema.validate({ arr: [1, 2] }).arr).toEqual([1, 2])
  // })

  test('Nested object default', () => {
    const schema = new Schema({
      profile: {
        first: { type: String, default: 'A' },
        last: { type: String, default: 'B' }
      }
    })
    expect(schema.validate({}).profile).toEqual({ first: 'A', last: 'B' })
    expect(schema.validate({ profile: { first: 'X' } }).profile).toEqual({ first: 'X', last: 'B' })
  })

  test('Int32 default', () => {
    const schema = new Schema({ n: { type: Int32, default: 42 } })
    expect(schema.validate({}).n).toBe(42)
    expect(schema.validate({ n: 10 }).n).toBe(10)
  })

  test('Decimal128 default', () => {
    const schema = new Schema({ d: { type: Decimal128, default: 1.23 } })
    expect(schema.validate({}).d).toBe(1.23)
    expect(schema.validate({ d: 4.56 }).d).toBe(4.56)
  })

  test('Double default', () => {
    const schema = new Schema({ x: { type: Double, default: 2.34 } })
    expect(schema.validate({}).x).toBe(2.34)
    expect(schema.validate({ x: 5.67 }).x).toBe(5.67)
  })
})