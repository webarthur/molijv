/*
1. Try to coerce the value to the expected type or throw a validation error
2. Validate the value against the expected type or throw a validation error
3. Check for required fields and throw a validation error if missing
4. ETC...
*/
import validationError from './validation-error.js'

const { isArray } = Array

// Int32 type constructor for schema typing
function Int32() {}
Int32.prototype.toString = () => 'Int32'

// Decimal128 type constructor for schema typing
function Decimal128() {}
Decimal128.prototype.toString = () => 'Decimal128'

// Double type constructor for schema typing
function Double() {}
Double.prototype.toString = () => 'Double'

// Int32 range constants
const INT32_MIN = -2147483648
const INT32_MAX = 2147483647

// Built-in validators for each supported type
const validators = {

  // String type validation and coercion
  string: {
    type: String,
    alias: 'str',
    validator: (def, val, path) => {
      const type = typeof val
      if (def.coerce === false && type !== 'string')
        throw validationError({
          kind: 'string',
          message: def.message || `Field "${path}" must be a string`,
          path,
          value: val
        })
      let str = val
      if (def.coerce !== false) {
        if (type === 'number' || type === 'boolean' || type === 'bigint') {
          str = String(str)
        }
        // Apply string transformations if enabled
        if (def.trim) str = str.trim()
        if (def.lowercase) str = str.toLowerCase()
        if (def.uppercase) str = str.toUpperCase()
      }
      if (typeof str !== 'string')
        throw validationError({
          kind: 'string',
          message: def.message || `Field "${path}" must be a string`,
          path,
          value: val
        })
      // Length checks
      if (
        def.minLength !== undefined &&
        str.length < (def.minLength?.flag !== undefined ? def.minLength.flag : def.minLength)
      )
        throw validationError({
          kind: 'minlength',
          message: def.minLength?.msg || def.message || `Field "${path}" length must be >= ${def.minLength?.flag ?? def.minLength}`,
          path,
          value: str
        })
      
      if (
        def.maxLength !== undefined &&
        str.length > (def.maxLength?.flag !== undefined ? def.maxLength.flag : def.maxLength)
      )
        throw validationError({
          kind: 'maxlength',
          message: def.maxLength?.msg || def.message || `Field "${path}" length must be <= ${def.maxLength?.flag ?? def.maxLength}`,
          path,
          value: str
        })
      return str
    }
  },

  // Boolean type validation and coercion
  boolean: {
    type: Boolean,
    alias: 'bool',
    validator: (def, val, path) => {
      if (val === null || val === '') return null
      if (def.coerce) {
        if (typeof val === 'number') {
          if (val === 1) return true
          if (val === 0) return false
        }
        if (typeof val === 'string') {
          const v = val.toLowerCase()
          if (v === '1' || v === 'true' || v === 'yes') return true
          if (v === '0' || v === 'false' || v === 'no') return false
        }
      }
      if (typeof val !== 'boolean')
        throw validationError({
          kind: 'boolean',
          message: def.message || `Field "${path}" must be a boolean`,
          path,
          value: val
        })
      return val
    }
  },

  // Number type validation and coercion
  number: {
    type: Number,
    alias: 'num',
    validator: (def, val, path) => {
      const type = typeof val
      let num = val
      if (num === null || num === '') return null
      if (def.coerce !== false) {
        if (type === 'string' && num !== '' || type === 'boolean' || type === 'bigint') {
          num = Number(num)
          if (isNaN(num)) {
            throw validationError({
              kind: 'int32',
              message: def.message || `Field "${path}" must be a number`,
              path,
              value: val
            })
          }
        }
      }
      if (typeof num !== 'number' || Number.isNaN(num)) {
        throw validationError({
          kind: 'int32',
          message: def.message || `Field "${path}" must be a number`,
          path,
          value: val
        })
      }
      if (!Number.isFinite(num))
        throw validationError({
          kind: 'number',
          message: def.message || `Field "${path}" must be a valid finite number`,
          path,
          value: val
        })
      // Range checks
      if (def.min?.flag !== undefined && num < def.min.flag)
        throw validationError({
          kind: 'min',
          message: def.min?.msg || def.message || `Field "${path}" must be >= ${def.min.flag}`,
          path,
          value: num
        })
      if (def.max?.flag !== undefined && num > def.max.flag)
        throw validationError({
          kind: 'max',
          message: def.max?.msg || def.message || `Field "${path}" must be <= ${def.max.flag}`,
          path,
          value: num
        })
      return num
    }
  },

  // Int32 type validation and coercion
  int32: {
    type: Int32,
    alias: 'int',
    validator: (def, val, path) => {
      const type = typeof val
      let num = val
      if (num === null || num === '') return null
      if (def.coerce !== false) {
        if (type === 'string' && num !== '' || type === 'boolean' || type === 'bigint') {
          num = Number(num)
          if (isNaN(num)) {
            throw validationError({
              kind: 'int32',
              message: def.message || `Field "${path}" must be an integer`,
              path,
              value: val
            })
          }
        }
      }
      if (typeof num !== 'number' || !Number.isInteger(num)) {
        throw validationError({
          kind: 'int32',
          message: def.message || `Field "${path}" must be an integer`,
          path,
          value: val
        })
      }
      if (num < INT32_MIN || num > INT32_MAX)
        throw validationError({
          kind: 'int32',
          message: def.message || `Field "${path}" must be an integer between ${INT32_MIN} and ${INT32_MAX}`,
          path,
          value: num
        })
      if (def.min?.flag !== undefined && num < def.min.flag)
        throw validationError({
          kind: 'min',
          message: def.min?.msg || def.message || `Field "${path}" must be >= ${def.min.flag}`,
          path,
          value: num
        })
      if (def.max?.flag !== undefined && num > def.max.flag)
        throw validationError({
          kind: 'max',
          message: def.max?.msg || def.message || `Field "${path}" must be <= ${def.max.flag}`,
          path,
          value: num
        })
      return num
    }
  },

  // Decimal128 type validation and coercion
  decimal128: {
    type: Decimal128,
    alias: 'decimal',
    validator: (def, val, path) => {
      const type = typeof val
      let num = val
      if (num === null || num === '') return null
      if (def.coerce !== false) {
        if (type === 'string' && num !== '' || type === 'boolean' || type === 'bigint') {
          num = Number(num)
          if (isNaN(num)) {
            throw validationError({
              kind: 'decimal128',
              message: def.message || `Field "${path}" must be a decimal`,
              path,
              value: val
            })
          }
        }
      }
      if (typeof num !== 'number' || Number.isNaN(num)) {
        throw validationError({
          kind: 'decimal128',
          message: def.message || `Field "${path}" must be a decimal`,
          path,
          value: val
        })
      }
      if (!Number.isFinite(num))
        throw validationError({
          kind: 'decimal128',
          message: def.message || `Field "${path}" must be a valid finite decimal`,
          path,
          value: val
        })
      // Range checks
      if (def.min?.flag !== undefined && num < def.min.flag)
        throw validationError({
          kind: 'min',
          message: def.min?.msg || def.message || `Field "${path}" must be >= ${def.min.flag}`,
          path,
          value: num
        })
      if (def.max?.flag !== undefined && num > def.max.flag)
        throw validationError({
          kind: 'max',
          message: def.max?.msg || def.message || `Field "${path}" must be <= ${def.max.flag}`,
          path,
          value: num
        })
      return num
    }
  },

  // Double type validation and coercion
  double: {
    type: Double,
    validator: (def, val, path) => {
      const type = typeof val
      let num = val
      if (num === null || num === '') return null
      if (def.coerce !== false) {
        if (type === 'string' && num !== '' || type === 'boolean' || type === 'bigint') {
          num = Number(num)
          if (isNaN(num)) {
            throw validationError({
              kind: 'double',
              message: def.message || `Field "${path}" must be a double`,
              path,
              value: val
            })
          }
        }
      }
      if (typeof num !== 'number' || Number.isNaN(num)) {
        throw validationError({
          kind: 'double',
          message: def.message || `Field "${path}" must be a double`,
          path,
          value: val
        })
      }
      if (!Number.isFinite(num))
        throw validationError({
          kind: 'double',
          message: def.message || `Field "${path}" must be a valid finite double`,
          path,
          value: val
        })
      // Range checks
      if (def.min?.flag !== undefined && num < def.min.flag)
        throw validationError({
          kind: 'min',
          message: def.min?.msg || def.message || `Field "${path}" must be >= ${def.min.flag}`,
          path,
          value: num
        })
      if (def.max?.flag !== undefined && num > def.max.flag)
        throw validationError({
          kind: 'max',
          message: def.max?.msg || def.message || `Field "${path}" must be <= ${def.max.flag}`,
          path,
          value: num
        })
      return num
    }
  },

  // Date type validation and coercion
  date: {
    type: Date,
    validator: (def, val, path) => {
      if (val === null || val === '') return null
      if (def.coerce === false && !(val instanceof Date))
        throw validationError({
          kind: 'date',
          message: def.message || `Field "${path}" must be a valid date`,
          path,
          value: val
        })
      let dateVal = val
      // Coerce to Date if allowed
      if (!(val instanceof Date) && def.coerce !== false) {
        dateVal = new Date(val)
      }
      if (!(dateVal instanceof Date) || isNaN(dateVal.getTime()))
        throw validationError({
          kind: 'date',
          message: def.message || `Field "${path}" must be a valid date`,
          path,
          value: val
        })
      // Range checks
      if (def.min?.flag !== undefined) {
        const minDate = def.min.flag instanceof Date ? def.min.flag : new Date(def.min.flag)
        if (dateVal < minDate)
          throw validationError({
            kind: 'min',
            message: def.min?.msg || def.message || `Field "${path}" must be after ${def.min.flag}`,
            path,
            value: dateVal
          })
      }
      if (def.max?.flag !== undefined) {
        const maxDate = def.max.flag instanceof Date ? def.max.flag : new Date(def.max.flag)
        if (dateVal > maxDate)
          throw validationError({
            kind: 'max',
            message: def.max?.msg || def.message || `Field "${path}" must be before ${def.max.flag}`,
            path,
            value: dateVal
          })
      }
      return dateVal
    }
  },

  // Object type validation
  object: {
    type: Object,
    validator: (def, val, path) => {
      if (val === null || val === '') return null
      if (def.coerce === false && (typeof val !== 'object' || val === null || isArray(val)))
        throw validationError({
          kind: 'object',
          message: def.message || `Field "${path}" must be an object`,
          path,
          value: val
        })
      if (typeof val !== 'object' || val === null || isArray(val))
        throw validationError({
          kind: 'object',
          message: def.message || `Field "${path}" must be an object`,
          path,
          value: val
        })
      return val
    }
  },

  // Array type validation
  array: {
    type: Array,
    validator: (def, val, path) => {
      if (val === null || val === '') return null
      if (def.coerce === false && (!isArray(val) || val === null))
        throw validationError({
          kind: 'array',
          message: def.message || `Field "${path}" must be an array`,
          path,
          value: val
        })
      if (!isArray(val) || val === null)
        throw validationError({
          kind: 'array',
          message: def.message || `Field "${path}" must be an array`,
          path,
          value: val
        })
      return val
    }
  }
}

const alias = {}
for (const v in validators) {
  alias[v] = validators[v]
  if (validators[v].alias) {
    alias[validators[v].alias] = validators[v]
  }
}

const types = {}
for (const v in validators) {
  types[validators[v].type.name] = validators[v].type.name
}

// types.add = (name, options = {}) => {
//   if (typeof name !== 'string') {
//     throw new Error('Type name must be a string')
//   }
//   if (validators[name]) {
//     throw new Error(`Type "${name}" already exists`)
//   }
//   if (!options.validator || typeof options.validator !== 'function') {
//     throw new Error('Custom type must have a validator function')
//   }
//   validators[name] = {
//     type: options.type || name,
//     alias: options.alias || [name.toLowerCase()],
//     validator: options.validator
//   }
//   types[options.type || name] = options.type || name
//   if (options.alias) {
//     alias[options.alias] = validators[name]
//   }
// }

export default types
export { types, validators, alias as validatorsAlias }