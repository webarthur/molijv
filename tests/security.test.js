import { Schema, Int32, Decimal128, Double } from '../molijv'

describe('Schema security', () => {
  test('Prototype pollution via object', () => {
    const schema = new Schema({ safe: { type: String } })
    const data = schema.validate({ safe: 'ok', '__proto__': { polluted: true } })
    expect({}.polluted).toBeUndefined()
    expect(!data.__proto__ || !data.__proto__.polluted).toBe(true)
  })

  test('Prototype pollution via array', () => {
    const arr = []
    arr['__proto__'] = 'polluted'
    const schema = new Schema({ tags: [{ type: String }] })
    const data = schema.validate({ tags: arr })
    expect(data.tags?.polluted).toBeUndefined()
  })

  test('Circular reference in object', () => {
    const schema = new Schema({ foo: { type: Object } })
    const obj = {}
    obj.self = obj
    expect(() => schema.validate({ foo: obj })).not.toThrow()
  })

  test('Function as value should throw', () => {
    const schema = new Schema({ f: { type: String } })
    expect(() => schema.validate({ f: () => 123 })).toThrow(/string/)
  })

  test('Mixed types in array should throw', () => {
    const schema = new Schema({ arr: [{ type: Number }] })
    expect(() => schema.validate({ arr: [1, '2', true, null] })).toThrow(/number/)
  })

  test('Null as object allowed if not required', () => {
    const schema = new Schema({ o: { type: Object } })
    expect(() => schema.validate({ o: null })).not.toThrow()
  })

  test('Undefined as value allowed if not required', () => {
    const schema = new Schema({ x: { type: Number } })
    expect(() => schema.validate({ x: undefined })).not.toThrow()
  })

  test('Int32: prototype pollution', () => {
    const schema = new Schema({ n: { type: Int32 } })
    const data = schema.validate({ n: 1, '__proto__': { polluted: true } })
    expect({}.polluted).toBeUndefined()
    expect(!data.__proto__ || !data.__proto__.polluted).toBe(true)
  })

  test('Decimal128: prototype pollution', () => {
    const schema = new Schema({ d: { type: Decimal128 } })
    const data = schema.validate({ d: 1.23, '__proto__': { polluted: true } })
    expect({}.polluted).toBeUndefined()
    expect(!data.__proto__ || !data.__proto__.polluted).toBe(true)
  })

  test('Double: prototype pollution', () => {
    const schema = new Schema({ x: { type: Double } })
    const data = schema.validate({ x: 2.34, '__proto__': { polluted: true } })
    expect({}.polluted).toBeUndefined()
    expect(!data.__proto__ || !data.__proto__.polluted).toBe(true)
  })

  test('String: dangerous unicode accepted', () => {
    const schema = new Schema({ s: { type: String } })
    const data = schema.validate({ s: '\u202eabc' })
    expect(data.s).toBe('\u202eabc')
  })
})
