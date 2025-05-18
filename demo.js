const { Schema } = require('./molijv.js')

const schema = new Schema({
  name: {
    fisrt: { type: String, default: 'A' },
    last: { type: String, default: 'B' }
  },
  age: { type: Number, default: 18 },
})

const newData = schema.validate({ name: { last: 'D' }, age: 20 })

console.log(newData)
console.log(schema._compiledSchema)
console.log(schema.schemaDef)

const schema2 = new Schema({
  name: {
    fisrt: { type: String, required: true },
    last: { type: String, default: 'B' }
  },
  age: { type: Number, default: 18 },
}, { coerce: false })

const newData2 = schema2.validate({ name: { last: 'D' }, age: 20 })