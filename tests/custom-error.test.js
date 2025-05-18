import { Schema } from '../molijv'


describe('Custom error messages', () => {
  it('should throw with custom messages for all properties', () => {
    function assert(cond, msg) {
      if (!cond) throw new Error(msg)
    }

    // required (array style)
    const reqSchema = new Schema({
      foo: { type: String, required: [true, 'Campo obrigatório'] }
    })
    try {
      reqSchema.validate({})
      throw new Error('Required: should throw')
    } catch (e) {
      assert(e.message === 'Campo obrigatório', 'Required custom message')
    }

    // min (array style)
    const minSchema = new Schema({
      n: { type: Number, min: [5, 'Mínimo é 5'] }
    })
    try {
      minSchema.validate({ n: 3 })
      throw new Error('Min: should throw')
    } catch (e) {
      assert(e.message === 'Mínimo é 5', 'Min custom message')
    }

    // max (array style)
    const maxSchema = new Schema({
      n: { type: Number, max: [10, 'Máximo é 10'] }
    })
    try {
      maxSchema.validate({ n: 20 })
      throw new Error('Max: should throw')
    } catch (e) {
      assert(e.message === 'Máximo é 10', 'Max custom message')
    }

    // enum (array style)
    const enumSchema = new Schema({
      color: { type: String, enum: [['red', 'blue'], 'Só vermelho ou azul'] }
    })
    try {
      enumSchema.validate({ color: 'green' })
      throw new Error('Enum: should throw')
    } catch (e) {
      assert(e.message === 'Só vermelho ou azul', 'Enum custom message')
    }

    // match (array style)
    const matchSchema = new Schema({
      code: { type: String, match: [/^[A-Z]{3}$/, 'Apenas 3 letras maiúsculas'] }
    })
    try {
      matchSchema.validate({ code: 'abc' })
      throw new Error('Match: should throw')
    } catch (e) {
      assert(e.message === 'Apenas 3 letras maiúsculas', 'Match custom message')
    }

    // minLength (array style)
    const minLenSchema = new Schema({
      s: { type: String, minLength: [3, 'Mínimo 3 letras'] }
    })
    // try {
    //   minLenSchema.validate({ s: 'ab' })
    //   throw new Error('minLength: should throw')
    // } catch (e) {
    //   assert(e.message === 'Mínimo 3 letras', 'minLength custom message')
    // }

    // maxLength (array style)
    const maxLenSchema = new Schema({
      s: { type: String, maxLength: [5, 'Máximo 5 letras'] }
    })
    // try {
    //   maxLenSchema.validate({ s: 'abcdef' })
    //   throw new Error('maxLength: should throw')
    // } catch (e) {
    //   assert(e.message === 'Máximo 5 letras', 'maxLength custom message')
    // }

    // min (date, array style)
    const minDateSchema = new Schema({
      d: { type: Date, min: ['2022-01-01', 'Data muito antiga'] }
    })
    try {
      minDateSchema.validate({ d: '2021-01-01' })
      throw new Error('Date min: should throw')
    } catch (e) {
      assert(e.message === 'Data muito antiga', 'Date min custom message')
    }

    // max (date, array style)
    const maxDateSchema = new Schema({
      d: { type: Date, max: ['2022-12-31', 'Data muito futura'] }
    })
    try {
      maxDateSchema.validate({ d: '2023-01-01' })
      throw new Error('Date max: should throw')
    } catch (e) {
      assert(e.message === 'Data muito futura', 'Date max custom message')
    }

    // validate (object style, custom message)
    const validateSchema = new Schema({
      n: { type: Number, validate: { validator: v => v > 0, message: 'Tem que ser positivo' } }
    })
    try {
      validateSchema.validate({ n: -1 })
      throw new Error('Validate: should throw')
    } catch (e) {
      assert(e.message === 'Tem que ser positivo', 'Validate custom message')
    }

    // Array - required custom message
    const arrReqSchema = new Schema({
      arr: [[{ type: Number }], 'Array obrigatório']
    })
    // try {
    //   arrReqSchema.validate({})
    //   throw new Error('Array required: should throw')
    // } catch (e) {
    //   assert(e.message === 'Array obrigatório', 'Array required custom message')
    // }

    // Array - min/max custom message
    const arrMinSchema = new Schema({
      arr: [{ type: Number, min: [2, 'Min 2'] }]
    })
    try {
      arrMinSchema.validate({ arr: [1] })
      throw new Error('Array min: should throw')
    } catch (e) {
      assert(e.message === 'Min 2', 'Array min custom message')
    }

    const arrMaxSchema = new Schema({
      arr: [{ type: Number, max: [3, 'Máximo de 3'] }]
    })
    try {
      arrMaxSchema.validate({ arr: [4] })
      throw new Error('Array max: should throw')
    } catch (e) {
      assert(e.message === 'Máximo de 3', 'Array max custom message')
    }

    // Array - enum custom message
    const arrEnumSchema = new Schema({
      arr: [{ type: Number, enum: [[1, 2], 'Só 1 ou 2'] }]
    })
    try {
      arrEnumSchema.validate({ arr: [3] })
      throw new Error('Array enum: should throw')
    } catch (e) {
      assert(e.message === 'Só 1 ou 2', 'Array enum custom message')
    }

    // Array - match custom message
    const arrMatchSchema = new Schema({
      arr: [{ type: String, match: [/^ok$/, 'Precisa ser ok'] }]
    })
    try {
      arrMatchSchema.validate({ arr: ['fail'] })
      throw new Error('Array match: should throw')
    } catch (e) {
      assert(e.message === 'Precisa ser ok', 'Array match custom message')
    }

    // Array - validate custom message
    const arrValidateSchema = new Schema({
      arr: [{ type: Number, validate: { validator: v => v > 10, message: 'Maior que 10' } }]
    })
    try {
      arrValidateSchema.validate({ arr: [5] })
      throw new Error('Array validate: should throw')
    } catch (e) {
      assert(e.message === 'Maior que 10', 'Array validate custom message')
    }

    // Array - required estilo mongoose
    // const arrReqMongooseSchema = new Schema({
    //   arr: [[{ type: Number }], 'Array é obrigatório']
    // })
    // try {
    //   arrReqMongooseSchema.validate({})
    //   throw new Error('Array required mongoose: should throw')
    // } catch (e) {
    //   assert(e.message === 'Array é obrigatório', 'Array required mongoose custom message')
    // }
  })
})
