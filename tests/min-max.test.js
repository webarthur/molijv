import { Schema, Int32, Decimal128, Double } from '../molijv'

describe('Schema min/max attribute for num', () => {
  test('Number min/max', () => {
    const schema = new Schema({ num: { type: Number, min: 2, max: 5 } })
    expect(schema.validate({ num: 2 }).num).toBe(2)
    expect(schema.validate({ num: 5 }).num).toBe(5)
    expect(() => schema.validate({ num: 1 })).toThrow(/>=|min/)
    expect(() => schema.validate({ num: 6 })).toThrow(/<=|max/)
  })

  test('Number min/max with custom message', () => {
    const schema = new Schema({ num: { type: Number, min: [2, 'Too small'], max: [5, 'Too big'] } })
    expect(() => schema.validate({ num: 1 })).toThrow('Too small')
    expect(() => schema.validate({ num: 6 })).toThrow('Too big')
  })

  test('Int32 min/max', () => {
    const schema = new Schema({ num: { type: Int32, min: 10, max: 20 } })
    expect(schema.validate({ num: 10 }).num).toBe(10)
    expect(schema.validate({ num: 20 }).num).toBe(20)
    expect(() => schema.validate({ num: 9 })).toThrow(/>=|min/)
    expect(() => schema.validate({ num: 21 })).toThrow(/<=|max/)
  })

  test('Decimal128 min/max', () => {
    const schema = new Schema({ num: { type: Decimal128, min: 1.5, max: 3.5 } })
    expect(schema.validate({ num: 1.5 }).num).toBe(1.5)
    expect(schema.validate({ num: 3.5 }).num).toBe(3.5)
    expect(() => schema.validate({ num: 1.4 })).toThrow(/>=|min/)
    expect(() => schema.validate({ num: 3.6 })).toThrow(/<=|max/)
  })

  test('Double min/max', () => {
    const schema = new Schema({ num: { type: Double, min: 0.1, max: 0.9 } })
    expect(schema.validate({ num: 0.1 }).num).toBe(0.1)
    expect(schema.validate({ num: 0.9 }).num).toBe(0.9)
    expect(() => schema.validate({ num: 0.0 })).toThrow(/>=|min/)
    expect(() => schema.validate({ num: 1.0 })).toThrow(/<=|max/)
  })

  test('Date min/max', () => {
    const schema = new Schema({ d: { type: Date, min: '2022-01-01', max: '2022-12-31' } })
    expect(schema.validate({ d: '2022-06-15' }).d).toBeInstanceOf(Date)
    expect(() => schema.validate({ d: '2021-12-31' })).toThrow(/after|min/)
    expect(() => schema.validate({ d: '2023-01-01' })).toThrow(/before|max/)
  })

  test('Date min/max with custom message', () => {
    const schema = new Schema({ d: { type: Date, min: ['2022-01-01', 'Too early'], max: ['2022-12-31', 'Too late'] } })
    expect(() => schema.validate({ d: '2021-01-01' })).toThrow('Too early')
    expect(() => schema.validate({ d: '2023-01-01' })).toThrow('Too late')
  })

})
