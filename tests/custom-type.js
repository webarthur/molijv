import { Schema, types } from '../molijv'

types.add('Month', {
  type: Number,
  validator: (def, val, path) => {
    if (val === undefined || val === null) return
    if (typeof val !== 'number' || val < 1 || val > 12) {
      throw new Error(`Invalid month at ${path}: ${val}. Must be a number between 1 and 12.`)
    }
  }
})

// describe('Month custom type', () => {

//   test('accepts valid months', () => {
//     let schema = new Schema({ m: { type: 'Month' } })
//     expect(() => schema.validate({ m: 1 })).not.toThrow()
//     expect(() => schema.validate({ m: 12 })).not.toThrow()
//     expect(() => schema.validate({ m: undefined })).not.toThrow()
//     expect(() => schema.validate({ m: null })).not.toThrow()
//   })

//   test('rejects invalid months', () => {
//     let schema = new Schema({ m: { type: 'Month' } })
//     expect(() => schema.validate({ m: 0 })).toThrow()
//     expect(() => schema.validate({ m: 13 })).toThrow()
//     expect(() => schema.validate({ m: '5' })).toThrow()
//     expect(() => schema.validate({ m: {} })).toThrow()
//   })

// })

