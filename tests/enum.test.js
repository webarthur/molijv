import { Schema, Int32, Decimal128, Double } from '../molijv'


describe('Schema enum attribute for num', () => {
  test('Number enum', () => {
    const schema = new Schema({ num: { type: Number, enum: [1, 2, 3] } })
    expect(schema.validate({ num: 2 }).num).toBe(2)
    expect(() => schema.validate({ num: 4 })).toThrow(/one of|enum/)
  })

  test('Number enum (string coercion)', () => {
    const schema = new Schema({ num: { type: Number, enum: [1, 2, 3] } })
    expect(schema.validate({ num: '3' }).num).toBe(3)
    expect(() => schema.validate({ num: '5' })).toThrow(/one of|enum/)
  })

  test('Int32 enum', () => {
    const schema = new Schema({ num: { type: Int32, enum: [10, 20, 30] } })
    expect(schema.validate({ num: 20 }).num).toBe(20)
    expect(() => schema.validate({ num: 40 })).toThrow(/one of|enum/)
  })

  test('Decimal128 enum', () => {
    const schema = new Schema({ num: { type: Decimal128, enum: [1.1, 2.2, 3.3] } })
    expect(schema.validate({ num: 2.2 }).num).toBe(2.2)
    expect(() => schema.validate({ num: 4.4 })).toThrow(/one of|enum/)
  })

  test('Double enum', () => {
    const schema = new Schema({ num: { type: Double, enum: [0.5, 1.5, 2.5] } })
    expect(schema.validate({ num: 1.5 }).num).toBe(1.5)
    expect(() => schema.validate({ num: 3.5 })).toThrow(/one of|enum/)
  })

  test('Enum with custom message', () => {
    const schema = new Schema({ num: { type: Number, enum: [[2, 4], 'Num must be 2 or 4'] } })
    expect(schema.validate({ num: 2 }).num).toBe(2)
    expect(() => schema.validate({ num: 3 })).toThrow('Num must be 2 or 4')
  })
})
