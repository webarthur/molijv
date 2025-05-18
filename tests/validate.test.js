import { Schema, Int32, Decimal128, Double } from '../molijv'

describe('Schema validate attribute', () => {
  test('Number validate (function)', () => {
    const schema = new Schema({ n: { type: Number, validate: v => v % 2 === 0 } })
    expect(schema.validate({ n: 4 }).n).toBe(4)
    expect(() => schema.validate({ n: 3 })).toThrow(/custom|validate/)
  })

  test('Number validate (object)', () => {
    const schema = new Schema({ n: { type: Number, validate: { validator: v => v > 0, message: 'Must be positive' } } })
    expect(schema.validate({ n: 1 }).n).toBe(1)
    expect(() => schema.validate({ n: -1 })).toThrow('Must be positive')
  })

  test('String validate (function)', () => {
    const schema = new Schema({ s: { type: String, validate: v => v.length === 3 } })
    expect(schema.validate({ s: 'abc' }).s).toBe('abc')
    expect(() => schema.validate({ s: 'ab' })).toThrow(/custom|validate/)
  })

  test('String validate (object)', () => {
    const schema = new Schema({ s: { type: String, validate: { validator: v => v.startsWith('A'), message: 'Must start with A' } } })
    expect(schema.validate({ s: 'Arthur' }).s).toBe('Arthur')
    expect(() => schema.validate({ s: 'Bob' })).toThrow('Must start with A')
  })

  test('Boolean validate', () => {
    const schema = new Schema({ b: { type: Boolean, validate: v => v === true } })
    expect(schema.validate({ b: true }).b).toBe(true)
    expect(() => schema.validate({ b: false })).toThrow(/custom|validate/)
  })

  // test('Date validate', () => {
  //   const schema = new Schema({ d: { type: Date, validate: v => v.getFullYear() === 2022 } })
  //   expect(schema.validate({ d: '2022-01-01' }).d).toBeInstanceOf(Date)
  //   expect(() => schema.validate({ d: '2021-01-01' })).toThrow(/custom|validate/)
  // })

  test('Object validate', () => {
    const schema = new Schema({ o: { type: Object, validate: v => v && v.hasOwnProperty('foo') } })
    expect(schema.validate({ o: { foo: 1 } }).o).toEqual({ foo: 1 })
    expect(() => schema.validate({ o: { bar: 2 } })).toThrow(/custom|validate/)
  })

  test('Array validate', () => {
    const schema = new Schema({ arr: [{ type: Number, validate: v => v > 0 }] })
    expect(schema.validate({ arr: [1, 2] }).arr).toEqual([1, 2])
    expect(() => schema.validate({ arr: [0, -1] })).toThrow(/custom|validate/)
  })

  test('Int32 validate', () => {
    const schema = new Schema({ n: { type: Int32, validate: v => v % 2 === 0 } })
    expect(schema.validate({ n: 2 }).n).toBe(2)
    expect(() => schema.validate({ n: 3 })).toThrow(/custom|validate/)
  })

  test('Decimal128 validate', () => {
    const schema = new Schema({ d: { type: Decimal128, validate: v => v > 0 } })
    expect(schema.validate({ d: 1.23 }).d).toBe(1.23)
    expect(() => schema.validate({ d: -1.23 })).toThrow(/custom|validate/)
  })

  test('Double validate', () => {
    const schema = new Schema({ x: { type: Double, validate: v => v < 10 } })
    expect(schema.validate({ x: 5 }).x).toBe(5)
    expect(() => schema.validate({ x: 20 })).toThrow(/custom|validate/)
  })

  test('Validate with custom message', () => {
    const schema = new Schema({ n: { type: Number, validate: { validator: v => v % 2 === 0, message: 'Must be even' } } })
    expect(() => schema.validate({ n: 3 })).toThrow('Must be even')
  })
})