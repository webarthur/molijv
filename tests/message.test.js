import { Schema, Int32, Decimal128, Double } from '../molijv'

describe('Custom error messages', () => {
  it('should throw with custom messages for all types', () => {
    function assert(cond, msg) {
      if (!cond) throw new Error(msg)
    }

    // String type - custom error messages
    const stringSchema = new Schema({
      s: { type: String, required: true, min: 2, max: 4, match: /^[a-z]+$/, enum: ['abc', 'def'], message: 'Custom string error' }
    })
    try {
      stringSchema.validate({})
      throw new Error('String required: should throw')
    } catch (e) {
      assert(e.message === 'Custom string error', 'String required custom message')
    }
    try {
      stringSchema.validate({ s: 'a' })
      throw new Error('String min: should throw')
    } catch (e) {
      assert(e.message === 'Custom string error', 'String min custom message')
    }
    try {
      stringSchema.validate({ s: 'abcdef' })
      throw new Error('String max: should throw')
    } catch (e) {
      assert(e.message === 'Custom string error', 'String max custom message')
    }
    try {
      stringSchema.validate({ s: '123' })
      throw new Error('String match: should throw')
    } catch (e) {
      assert(e.message === 'Custom string error', 'String match custom message')
    }
    try {
      stringSchema.validate({ s: 'xyz' })
      throw new Error('String enum: should throw')
    } catch (e) {
      assert(e.message === 'Custom string error', 'String enum custom message')
    }

    // Number type - custom error messages
    const numberSchema = new Schema({
      n: { type: Number, required: true, min: 1, max: 5, enum: [2, 4], message: 'Custom number error' }
    })
    try {
      numberSchema.validate({})
      throw new Error('Number required: should throw')
    } catch (e) {
      assert(e.message === 'Custom number error', 'Number required custom message')
    }
    try {
      numberSchema.validate({ n: 0 })
      throw new Error('Number min: should throw')
    } catch (e) {
      assert(e.message === 'Custom number error', 'Number min custom message')
    }
    try {
      numberSchema.validate({ n: 10 })
      throw new Error('Number max: should throw')
    } catch (e) {
      assert(e.message === 'Custom number error', 'Number max custom message')
    }
    try {
      numberSchema.validate({ n: 3 })
      throw new Error('Number enum: should throw')
    } catch (e) {
      assert(e.message === 'Custom number error', 'Number enum custom message')
    }

    // Boolean type - custom error messages
    const boolSchema = new Schema({
      b: { type: Boolean, required: true, message: 'Custom boolean error' }
    })
    try {
      boolSchema.validate({})
      throw new Error('Boolean required: should throw')
    } catch (e) {
      assert(e.message === 'Custom boolean error', 'Boolean required custom message')
    }
    try {
      boolSchema.validate({ b: 'maybe' })
      throw new Error('Boolean invalid: should throw')
    } catch (e) {
      assert(e.message === 'Custom boolean error', 'Boolean invalid custom message')
    }

    // Date type - custom error messages
    const dateSchema = new Schema({
      d: { type: Date, required: true, min: '2022-01-01', max: '2022-12-31', message: 'Custom date error' }
    })
    try {
      dateSchema.validate({})
      throw new Error('Date required: should throw')
    } catch (e) {
      assert(e.message === 'Custom date error', 'Date required custom message')
    }
    try {
      dateSchema.validate({ d: '2021-01-01' })
      throw new Error('Date min: should throw')
    } catch (e) {
      assert(e.message === 'Custom date error', 'Date min custom message')
    }
    try {
      dateSchema.validate({ d: '2023-01-01' })
      throw new Error('Date max: should throw')
    } catch (e) {
      assert(e.message === 'Custom date error', 'Date max custom message')
    }

    // Int32 type - custom error messages
    const int32Schema = new Schema({
      i: { type: Int32, required: true, message: 'Custom int32 error' }
    })
    try {
      int32Schema.validate({})
      throw new Error('Int32 required: should throw')
    } catch (e) {
      assert(e.message === 'Custom int32 error', 'Int32 required custom message')
    }
    try {
      int32Schema.validate({ i: 1.5 })
      throw new Error('Int32 float: should throw')
    } catch (e) {
      assert(e.message === 'Custom int32 error', 'Int32 float custom message')
    }
    try {
      int32Schema.validate({ i: 2147483648 })
      throw new Error('Int32 above max: should throw')
    } catch (e) {
      assert(e.message === 'Custom int32 error', 'Int32 above max custom message')
    }

    // Decimal128 type - custom error messages
    const decimalSchema = new Schema({
      d: { type: Decimal128, required: true, message: 'Custom decimal error' }
    })
    try {
      decimalSchema.validate({})
      throw new Error('Decimal128 required: should throw')
    } catch (e) {
      assert(e.message === 'Custom decimal error', 'Decimal128 required custom message')
    }
    try {
      decimalSchema.validate({ d: 'notanumber' })
      throw new Error('Decimal128 invalid: should throw')
    } catch (e) {
      assert(e.message === 'Custom decimal error', 'Decimal128 invalid custom message')
    }
    try {
      decimalSchema.validate({ d: Infinity })
      throw new Error('Decimal128 infinity: should throw')
    } catch (e) {
      assert(e.message === 'Custom decimal error', 'Decimal128 infinity custom message')
    }

    // Double type - custom error messages
    const doubleSchema = new Schema({
      x: { type: Double, required: true, message: 'Custom double error' }
    })
    try {
      doubleSchema.validate({})
      throw new Error('Double required: should throw')
    } catch (e) {
      assert(e.message === 'Custom double error', 'Double required custom message')
    }
    try {
      doubleSchema.validate({ x: 'notanumber' })
      throw new Error('Double invalid: should throw')
    } catch (e) {
      assert(e.message === 'Custom double error', 'Double invalid custom message')
    }
    try {
      doubleSchema.validate({ x: NaN })
      throw new Error('Double NaN: should throw')
    } catch (e) {
      assert(e.message === 'Custom double error', 'Double NaN custom message')
    }

    // Array type - custom error messages
    const arrSchema = new Schema({
      arr: [{ type: Number, required: true, min: 1, max: 3, message: 'Custom array error' }]
    })
    // try {
    //   arrSchema.validate({ arr: 'notarray' })
    //   throw new Error('Array type: should throw')
    // } catch (e) {
    //   assert(e.message === 'Custom array error', 'Array type custom message')
    // }
    try {
      arrSchema.validate({ arr: [0] })
      throw new Error('Array min: should throw')
    } catch (e) {
      assert(e.message === 'Custom array error', 'Array min custom message')
    }
    try {
      arrSchema.validate({ arr: [4] })
      throw new Error('Array max: should throw')
    } catch (e) {
      assert(e.message === 'Custom array error', 'Array max custom message')
    }

    // Object type - custom error messages
    const objSchema = new Schema({
      o: { type: Object, required: true, message: 'Custom object error' }
    })
    try {
      objSchema.validate({})
      throw new Error('Object required: should throw')
    } catch (e) {
      assert(e.message === 'Custom object error', 'Object required custom message')
    }
    try {
      objSchema.validate({ o: [] })
      throw new Error('Object type: should throw')
    } catch (e) {
      assert(e.message === 'Custom object error', 'Object type custom message')
    }

    // Custom validate function - custom error message
    const customSchema = new Schema({
      v: { type: Number, validate: { validator: v => v === 42, message: 'Custom validate error' } }
    })
    try {
      customSchema.validate({ v: 41 })
      throw new Error('Custom validate: should throw')
    } catch (e) {
      assert(e.message === 'Custom validate error', 'Custom validate custom message')
    }

  })
})
