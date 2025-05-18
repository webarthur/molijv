import { Schema, Int32, Decimal128, Double } from '../molijv'

describe('Schema type attribute', () => {
  test('String type', () => {
    const schema = new Schema({ s: { type: String } })
    expect(schema.validate({ s: 'abc' }).s).toBe('abc')
    expect(() => schema.validate({ s: 123 })).toThrow(/string/)
  })

  test('Number type', () => {
    const schema = new Schema({ n: { type: Number } })
    expect(schema.validate({ n: 42 }).n).toBe(42)
    expect(schema.validate({ n: '42' }).n).toBe(42)
    expect(() => schema.validate({ n: 'notanumber' })).toThrow(/number/)
    expect(() => schema.validate({ n: NaN })).toThrow(/number/)
    expect(() => schema.validate({ n: Infinity })).toThrow(/number/)
  })

  test('Boolean type', () => {
    const schema = new Schema({ b: { type: Boolean } })
    expect(schema.validate({ b: true }).b).toBe(true)
    expect(schema.validate({ b: false }).b).toBe(false)
    expect(schema.validate({ b: '1' }).b).toBe(true)
    expect(schema.validate({ b: '0' }).b).toBe(false)
    expect(() => schema.validate({ b: 'maybe' })).toThrow(/not allowed/)
  })

  test('Date type', () => {
    const schema = new Schema({ d: { type: Date } })
    expect(schema.validate({ d: new Date('2022-10-01') }).d).toBeInstanceOf(Date)
    expect(schema.validate({ d: '2022-10-01' }).d).toBeInstanceOf(Date)
    expect(() => schema.validate({ d: 'notadate' })).toThrow(/date/)
  })

  test('Object type', () => {
    const schema = new Schema({ o: { type: Object } })
    expect(schema.validate({ o: { a: 1 } }).o).toEqual({ a: 1 })
    expect(schema.validate({ o: null }).o).toBeNull()
    expect(() => schema.validate({ o: [] })).toThrow(/object/)
    expect(() => schema.validate({ o: 123 })).toThrow(/object/)
  })

  // test('Array of primitives type', () => {
  //   const schema = new Schema({ arr: [{ type: Number }] })
  //   expect(schema.validate({ arr: [1, 2, 3] }).arr).toEqual([1, 2, 3])
  //   expect(() => schema.validate({ arr: ['a', 'b'] })).toThrow(/number/)
  //   expect(() => schema.validate({ arr: 'notarray' })).toThrow(/array/)
  // })

  test('Array of objects type', () => {
    const schema = new Schema({ items: [{ name: { type: String } }] })
    expect(schema.validate({ items: [{ name: 'x' }] }).items[0].name).toBe('x')
    expect(() => schema.validate({ items: [{ name: 1 }] })).toThrow(/string/)
  })

  test('Nested object type', () => {
    const schema = new Schema({
      profile: {
        first: { type: String },
        last: { type: String }
      }
    })
    expect(schema.validate({ profile: { first: 'A', last: 'B' } }).profile.first).toBe('A')
    expect(() => schema.validate({ profile: { first: 1 } })).toThrow(/string/)
  })

  test('Int32 type', () => {
    const schema = new Schema({ n: { type: Int32 } })
    expect(schema.validate({ n: 123 }).n).toBe(123)
    expect(schema.validate({ n: '456' }).n).toBe(456)
    expect(() => schema.validate({ n: 1.5 })).toThrow(/integer/)
    expect(() => schema.validate({ n: 2147483648 })).toThrow(/32-bit/)
    expect(() => schema.validate({ n: -2147483649 })).toThrow(/32-bit/)
  })

  test('Decimal128 type', () => {
    const schema = new Schema({ d: { type: Decimal128 } })
    expect(schema.validate({ d: 123.456 }).d).toBe(123.456)
    expect(schema.validate({ d: '789.01' }).d).toBe(789.01)
    expect(() => schema.validate({ d: 'notanumber' })).toThrow(/decimal/)
    expect(() => schema.validate({ d: Infinity })).toThrow(/finite/)
  })

  test('Double type', () => {
    const schema = new Schema({ x: { type: Double } })
    expect(schema.validate({ x: 1.23 }).x).toBe(1.23)
    expect(schema.validate({ x: '4.56' }).x).toBe(4.56)
    expect(() => schema.validate({ x: 'notanumber' })).toThrow(/double/)
    expect(() => schema.validate({ x: NaN })).toThrow(/finite/)
  })
})

describe('Schema simplified type attribute', () => {
  test('String type (simplified)', () => {
    let schema = new Schema({ foo: String })
    expect(schema.validate({ foo: 'abc' }).foo).toBe('abc')
    expect(() => schema.validate({ foo: 123 })).toThrow(/string/)
  })

  test('Number type (simplified)', () => {
    let schema = new Schema({ foo: Number })
    expect(schema.validate({ foo: 42 }).foo).toBe(42)
    expect(schema.validate({ foo: '42' }).foo).toBe(42)
    expect(() => schema.validate({ foo: 'notanumber' })).toThrow(/number/)
  })

  test('Boolean type (simplified)', () => {
    let schema = new Schema({ foo: Boolean })
    expect(schema.validate({ foo: true }).foo).toBe(true)
    expect(schema.validate({ foo: false }).foo).toBe(false)
    expect(schema.validate({ foo: '1' }).foo).toBe(true)
    expect(schema.validate({ foo: '0' }).foo).toBe(false)
    expect(() => schema.validate({ foo: 'maybe' })).toThrow(/not allowed/)
  })

  test('Date type (simplified)', () => {
    let schema = new Schema({ foo: Date })
    expect(schema.validate({ foo: new Date('2022-10-01') }).foo).toBeInstanceOf(Date)
    expect(schema.validate({ foo: '2022-10-01' }).foo).toBeInstanceOf(Date)
    expect(() => schema.validate({ foo: 'notadate' })).toThrow(/date/)
  })

  test('Object type (simplified)', () => {
    let schema = new Schema({ foo: Object })
    expect(schema.validate({ foo: { a: 1 } }).foo).toEqual({ a: 1 })
    expect(schema.validate({ foo: null }).foo).toBeNull()
    expect(() => schema.validate({ foo: [] })).toThrow(/object/)
    expect(() => schema.validate({ foo: 123 })).toThrow(/object/)
  })

  test('Int32 type (simplified)', () => {
    let schema = new Schema({ foo: Int32 })
    expect(schema.validate({ foo: 123 }).foo).toBe(123)
    expect(schema.validate({ foo: '456' }).foo).toBe(456)
    expect(() => schema.validate({ foo: 1.5 })).toThrow(/integer/)
  })

  test('Decimal128 type (simplified)', () => {
    let schema = new Schema({ foo: Decimal128 })
    expect(schema.validate({ foo: 123.456 }).foo).toBe(123.456)
    expect(schema.validate({ foo: '789.01' }).foo).toBe(789.01)
    expect(() => schema.validate({ foo: 'notanumber' })).toThrow(/decimal/)
  })

  test('Double type (simplified)', () => {
    let schema = new Schema({ foo: Double })
    expect(schema.validate({ foo: 1.23 }).foo).toBe(1.23)
    expect(schema.validate({ foo: '4.56' }).foo).toBe(4.56)
    expect(() => schema.validate({ foo: 'notanumber' })).toThrow(/double/)
  })
})
