// MoliJV - Mongoose Like JSON Validator

import normalizeSchema from './lib/normalize.js'

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

// Schema class for validation and coercion
class Schema {
  constructor(schemaDef, options = {}) {
    this.schemaDef = schemaDef
    // Merge user options with default
    this.options = { coerce: true, ...options }
    // Normalize schema for internal use
    this._normalizedSchema = normalizeSchema(schemaDef, this.options)
    // Precompile validator for performance
    this._validatorFn = this._compileValidator(this._normalizedSchema)
  }

  // Validate input data against schema
  validate(data) {
    return this._validatorFn(data)
  }

  // Compile schema into a fast validator function
  _compileValidator(schema) {
    const options = this.options
    // Recursively build validator for schema
    function build(schema, path = '', isRoot = false) {
      // Handle array schema
      if (isArray(schema)) {
        // Precompile item validator
        const itemValidator = build(schema[0], path + '[i]')
        const requiredFlag = schema[0]?.required?.flag
        const requiredMsg = schema[0]?.required?.msg || schema[0]?.message || `Field "${path}" is required`
        return (val) => {
          // Required check for array
          if ((val === undefined || val === null || val === '') && requiredFlag)
            throw new Error(requiredMsg)

          if (val === undefined || val === null || val === '') return val

          if (!isArray(val)) throw new Error(`Field "${path}" must be an array`)

          let changed = false
          // Fast for loop for array validation
          const len = val.length
          const arr = new Array(len)
          for (let i = 0; i < len; ++i) {
            const v = val[i]
            const res = itemValidator(v)
            if (res !== v) changed = true
            arr[i] = res
          }
          return changed ? arr : val
        }
      }

      // Handle object schema (no .type)
      if (typeof schema === 'object' && schema !== null && schema.type === undefined) {
        // Precompile field validators
        const fieldValidators = {}
        for (const key in schema) {
          fieldValidators[key] = build(schema[key], path ? `${path}.${key}` : key)
        }
        return obj => {
          // Ensure input is object
          if (typeof obj !== 'object' || obj === null) obj = {}

          if (options.coerce === false) {
            // Only validate, do not coerce or mutate
            for (const key in fieldValidators) {
              fieldValidators[key](obj[key])
            }
            return obj
          }

          // Coerce: create new object if not root
          const out = isRoot ? obj : {}
          for (const key in fieldValidators) {
            const val = obj[key]
            const res = fieldValidators[key](val)
            if (!isRoot) {
              out[key] = res
            } else if (res !== val) {
              obj[key] = res
            }
          }
          return isRoot ? obj : out
        }
      }

      // Handle primitive field schema
      const defaultVal = schema.default
      const enumMsg = schema.enum?.msg || schema.message
      const matchMsg = schema.match?.msg || schema.message
      const validateMsg = schema.validate?.message || schema.message
      return val => {
        // Apply default if value is undefined
        if (val === undefined && defaultVal !== undefined) {
          val = typeof defaultVal === 'function' ? defaultVal() : defaultVal
        }

        // Type validation and coercion
        const typeValidator = schema.typeValidator
        if (typeValidator) {
          const newVal = typeValidator(schema, val, path)
          if (schema.coerce !== false && newVal !== val) val = newVal
        }

        // Enum validation (O(1) lookup)
        const enumSet = schema.enum?.values ? new Set(schema.enum.values) : undefined
        if (enumSet && !enumSet.has(val)) {
          throw new Error(enumMsg || `Field "${path}" must be one of: ${[...enumSet].join(', ')}`)
        }

        // Pattern match validation
        const matchVal = schema.match?.value instanceof RegExp ? schema.match.value : (schema.match?.value ? new RegExp(schema.match.value) : undefined)

        if (matchVal && !matchVal.test(val)) {
          throw new Error(matchMsg || `Field "${path}" does not match required pattern`)
        }

        // Custom validator function
        const customValidator = schema.validate?.validator
        if (customValidator && !customValidator(val)) {
          throw new Error(validateMsg || `Field "${path}" failed custom validation`)
        }

        return val
      }
    }
    // Root: do not create new object at top level
    return build(schema, '', true)
  }
}

export { Schema, Int32, Decimal128, Double }
