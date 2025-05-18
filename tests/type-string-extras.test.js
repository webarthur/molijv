import { Schema } from '../molijv'

describe('String extras: lowercase, uppercase, trim, match, minLength, maxLength', () => {
  test('lowercase', () => {
    const schema = new Schema({ s: { type: String, lowercase: true } })
    expect(schema.validate({ s: 'ABC' }).s).toBe('abc')
    expect(schema.validate({ s: 'abc' }).s).toBe('abc')
  })

  test('uppercase', () => {
    const schema = new Schema({ s: { type: String, uppercase: true } })
    expect(schema.validate({ s: 'abc' }).s).toBe('ABC')
    expect(schema.validate({ s: 'ABC' }).s).toBe('ABC')
  })

  test('trim', () => {
    const schema = new Schema({ s: { type: String, trim: true } })
    expect(schema.validate({ s: '  test  ' }).s).toBe('test')
    expect(schema.validate({ s: 'x' }).s).toBe('x')
  })

  test('match (RegExp)', () => {
    const schema = new Schema({ s: { type: String, match: /^[a-z]{3}$/ } })
    expect(schema.validate({ s: 'abc' }).s).toBe('abc')
    expect(() => schema.validate({ s: 'ab1' })).toThrow(/pattern|match/)
    expect(() => schema.validate({ s: 'abcd' })).toThrow(/pattern|match/)
  })

  test('match (RegExp + custom message)', () => {
    const schema = new Schema({ s: { type: String, match: [/^[A-Z]{3}$/, 'Must be 3 uppercase'] } })
    expect(() => schema.validate({ s: 'abc' })).toThrow('Must be 3 uppercase')
  })

  test('minLength', () => {
    const schema = new Schema({ s: { type: String, minLength: 3 } })
    expect(schema.validate({ s: 'abc' }).s).toBe('abc')
    expect(() => schema.validate({ s: 'ab' })).toThrow(/length|min/)
  })

  test('maxLength', () => {
    const schema = new Schema({ s: { type: String, maxLength: 5 } })
    expect(schema.validate({ s: 'abcde' }).s).toBe('abcde')
    expect(() => schema.validate({ s: 'abcdef' })).toThrow(/length|max/)
  })

  // test('minLength + custom message', () => {
  //   const schema = new Schema({ s: { type: String, minLength: [3, 'Too short'] } })
  //   expect(() => schema.validate({ s: 'ab' })).toThrow('Too short')
  // })

  // test('maxLength + custom message', () => {
  //   const schema = new Schema({ s: { type: String, maxLength: [5, 'Too long'] } })
  //   expect(() => schema.validate({ s: 'abcdef' })).toThrow('Too long')
  // })

  test('combined string extras', () => {
    const schema = new Schema({
      s: { type: String, lowercase: true, trim: true, minLength: 2, maxLength: 4 }
    })
    expect(schema.validate({ s: '  AB ' }).s).toBe('ab')
    expect(() => schema.validate({ s: ' A ' })).toThrow(/length|min/)
    expect(() => schema.validate({ s: ' ABCDE ' })).toThrow(/length|max/)
  })
})
