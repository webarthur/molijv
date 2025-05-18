import { Schema, Int32, Decimal128, Double } from '../molijv'

describe('Schema type coercion', () => {
  test('String: no coercion from number', () => {
    const schema = new Schema({ s: { type: String } })
    expect(() => schema.validate({ s: 123 })).toThrow(/string/)
  })

  test('Number: string to number', () => {
    const schema = new Schema({ n: { type: Number } })
    expect(schema.validate({ n: '42' }).n).toBe(42)
    expect(() => schema.validate({ n: 'notanumber' })).toThrow(/number/)
    expect(schema.validate({ n: '' }).n).toBe('')
  })

  test('Boolean: string to boolean', () => {
    const schema = new Schema({ b: { type: Boolean } })
    expect(schema.validate({ b: '1' }).b).toBe(true)
    expect(schema.validate({ b: 'true' }).b).toBe(true)
    expect(schema.validate({ b: '0' }).b).toBe(false)
    expect(schema.validate({ b: 'false' }).b).toBe(false)
    expect(() => schema.validate({ b: 'maybe' })).toThrow(/not allowed/)
  })

  test('Date: string to Date', () => {
    const schema = new Schema({ d: { type: Date } })
    const val = schema.validate({ d: '2022-10-01' }).d
    expect(val).toBeInstanceOf(Date)
    expect(val.getFullYear()).toBe(2022)
    expect(() => schema.validate({ d: 'notadate' })).toThrow(/date/)
  })

  test('Int32: string to int', () => {
    const schema = new Schema({ n: { type: Int32 } })
    expect(schema.validate({ n: '123' }).n).toBe(123)
    expect(() => schema.validate({ n: 1.5 })).toThrow(/integer/)
    expect(() => schema.validate({ n: 2147483648 })).toThrow(/32-bit/)
  })

  test('Decimal128: string to decimal', () => {
    const schema = new Schema({ d: { type: Decimal128 } })
    expect(schema.validate({ d: '123.45' }).d).toBe(123.45)
    expect(() => schema.validate({ d: 'notanumber' })).toThrow(/decimal/)
    expect(() => schema.validate({ d: Infinity })).toThrow(/finite/)
  })

  test('Double: string to double', () => {
    const schema = new Schema({ x: { type: Double } })
    expect(schema.validate({ x: '4.56' }).x).toBe(4.56)
    expect(() => schema.validate({ x: 'notanumber' })).toThrow(/double/)
    expect(() => schema.validate({ x: NaN })).toThrow(/finite/)
  })

  test('Object: null allowed if not required', () => {
    const schema = new Schema({ o: { type: Object } })
    expect(schema.validate({ o: null }).o).toBeNull()
    expect(() => schema.validate({ o: [] })).toThrow(/object/)
    expect(() => schema.validate({ o: 123 })).toThrow(/object/)
  })

  test('Array: type error', () => {
    const schema = new Schema({ arr: [{ type: Number }] })
    expect(() => schema.validate({ arr: 'notarray' })).toThrow(/array/)
    expect(schema.validate({ arr: [1, 2] }).arr).toEqual([1, 2])
  })

  test('Boolean: coercion in simplified schema', () => {
    const schema = new Schema({ flag: Boolean })
    expect(schema.validate({ flag: 'true' }).flag).toBe(true)
    expect(schema.validate({ flag: '0' }).flag).toBe(false)
  })

  test('Number: coercion in simplified schema', () => {
    const schema = new Schema({ n: Number })
    expect(schema.validate({ n: '42' }).n).toBe(42)
    expect(() => schema.validate({ n: 'notanumber' })).toThrow(/number/)
  })

  test('Date: coercion in simplified schema', () => {
    const schema = new Schema({ d: Date })
    expect(schema.validate({ d: '2022-10-01' }).d).toBeInstanceOf(Date)
    expect(() => schema.validate({ d: 'notadate' })).toThrow(/date/)
  })

  // Novos testes para coerce: false
  describe('coerce: false', () => {
    test('Number: string is not coerced', () => {
      const schema = new Schema({ n: { type: Number, coerce: false } })
      expect(() => schema.validate({ n: '42' })).toThrow(/number/)
    })

    test('Boolean: string is not coerced', () => {
      const schema = new Schema({ b: { type: Boolean, coerce: false } })
      expect(() => schema.validate({ b: 'true' })).toThrow(/boolean/)
    })

    test('Date: string is not coerced', () => {
      const schema = new Schema({ d: { type: Date, coerce: false } })
      expect(() => schema.validate({ d: '2022-10-01' })).toThrow(/date/)
    })

    test('Int32: string is not coerced', () => {
      const schema = new Schema({ n: { type: Int32, coerce: false } })
      expect(() => schema.validate({ n: '123' })).toThrow(/integer/)
    })

    test('Decimal128: string is not coerced', () => {
      const schema = new Schema({ d: { type: Decimal128, coerce: false } })
      expect(() => schema.validate({ d: '123.45' })).toThrow(/decimal/)
    })

    test('Double: string is not coerced', () => {
      const schema = new Schema({ x: { type: Double, coerce: false } })
      expect(() => schema.validate({ x: '4.56' })).toThrow(/double/)
    })

    test('Boolean: coercion false in simplified schema', () => {
      const schema = new Schema({ flag: { type: Boolean, coerce: false } })
      expect(() => schema.validate({ flag: 'true' })).toThrow(/boolean/)
    })

    test('Number: coercion false in simplified schema', () => {
      const schema = new Schema({ n: { type: Number, coerce: false } })
      expect(() => schema.validate({ n: '42' })).toThrow(/number/)
    })

    test('Date: coercion false in simplified schema', () => {
      const schema = new Schema({ d: { type: Date, coerce: false } })
      expect(() => schema.validate({ d: '2022-10-01' })).toThrow(/date/)
    })
  })
})
