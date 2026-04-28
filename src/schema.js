import normalizeSchema from './normalize.js'
import { cloneSchemaDef, escapeString } from './utils.js'

const { isArray } = Array
const isObject = (val) => typeof val === 'object' && val !== null

/**
 * @param {string|string[]|Record<string, unknown>} fields
 * @returns {string[]}
 */
function normalizeSelectedFields(fields) {
  if (isArray(fields)) return fields
  if (typeof fields === 'string') return [fields]
  if (isObject(fields)) {
    const keys = []
    for (const key in fields) {
      if (Object.prototype.hasOwnProperty.call(fields, key) && fields[key]) {
        keys.push(key)
      }
    }
    return keys
  }
  throw new TypeError(
    'Expected a string, string[], or an object mapping field names to truthy values'
  )
}

/**
 * Schema class for validation and coercion
 * 
 * @example
 * const schema = new Schema({
 *   name: { type: String, required: true },
 *   age: { type: Number }
 * })
 * const data = schema.parse({ name: 'John', age: 30 })
 */
class Schema {
  
  /**
   * Creates a new Schema instance
   * 
   * @param {Object} schemaDef - Schema definition
   * @param {Object} [options={}] - Configuration options
   * @param {boolean} [options.coerce=true] - Enable type coercion
   */
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
  /**
   * Validate input data against schema
   * 
   * @param {*} data - Data to validate
   * @returns {*} Validated and coerced data
   * @throws {Error} Validation error with error details
   */
  validate(data) {
    return this._validatorFn(this._normalizedSchema, data)
  }

  /**
   * Get the shape (definition) of the schema
   * 
   * @type {Object}
   * @readonly
   * @returns {Object} Schema definition
   */
  get shape() {
    return this.schemaDef
  }

  /**
   * Parse and validate data (alias for validate)
   * 
   * @param {*} data - Data to validate
   * @returns {*} Validated and coerced data
   * @throws {Error} Validation error with error details
   */
  parse(data) {
    return this.validate(data)
  }

  /**
   * Safely validate data without throwing
   * 
   * @param {*} data - Data to validate
   * @returns {Object} Result object with success flag, data, and error
   * @returns {boolean} result.success - Whether validation succeeded
   * @returns {*} result.data - Validated data if successful, undefined if failed
   * @returns {Error} result.error - Error object if validation failed, undefined if successful
   * 
   * @example
   * const result = schema.safeValidate({ name: 'John' })
   * if (result.success) {
   *   console.log(result.data)
   * } else {
   *   console.log(result.error.message)
   * }
   */
  safeValidate(data) {
    try {
      const data_result = this.validate(data)
      return { success: true, data: data_result }
    } 
    catch (error) {
      return { success: false, error }
    }
  }

  /**
   * Safely parse and validate data without throwing (alias for safeValidate)
   * 
   * @param {*} data - Data to validate
   * @returns {Object} Result object with success flag, data, and error
   * 
   * @example
   * const result = schema.safeParse({ name: 'John' })
   * if (result.success) {
   *   console.log(result.data)
   * } else {
   *   console.log(result.error.message)
   * }
   */
  safeParse(data) {
    return this.safeValidate(data)
  }

  /**
   * Extend schema with additional fields
   * Returns a new Schema without mutating the original
   * 
   * @param {Object} fields - Fields to add or override
   * @returns {Schema} New extended schema
   * 
   * @example
   * const extended = schema.extend({ email: { type: String } })
   */
  extend(fields) {
    const cloned = cloneSchemaDef(this.schemaDef)
    const extended = { ...cloned, ...fields }
    return new Schema(extended, this.options)
  }

  /**
   * Make all or specific fields optional
   * Returns a new Schema without mutating the original
   * 
   * @param {string[]|string|Record<string, unknown>} [fields] - Field names to make optional. If omitted, all fields become optional
   * @returns {Schema} New partial schema
   * 
   * @example
   * schema.partial() // all fields optional
   * schema.partial(['age']) // only age optional
   * schema.partial('age')
   * schema.partial({ name: 1, age: true })
   */
  partial(fields) {
    const cloned = cloneSchemaDef(this.schemaDef)
    
    if (!fields) {
      for (const key in cloned) {
        if (cloned[key]?.type) {
          cloned[key] = { ...cloned[key], required: false }
        }
      }
    } 
    else {
      for (const field of normalizeSelectedFields(fields)) {
        if (cloned[field]?.type) {
          cloned[field] = { ...cloned[field], required: false }
        }
      }
    }
    
    return new Schema(cloned, this.options)
  }

  /**
   * Make all or specific fields required
   * Returns a new Schema without mutating the original
   * 
   * @param {string[]|string|Record<string, unknown>} [fields] - Field names to make required. If omitted, all fields become required
   * @returns {Schema} New schema with required fields
   * 
   * @example
   * schema.require() // all fields required
   * schema.require(['name']) // only name required
   * schema.require('name')
   * schema.require({ name: 1, age: true })
   */
  require(fields) {
    const cloned = cloneSchemaDef(this.schemaDef)
    
    if (!fields) {
      for (const key in cloned) {
        if (cloned[key]?.type) {
          cloned[key] = { ...cloned[key], required: true }
        }
      }
    } 
    else {
      for (const field of normalizeSelectedFields(fields)) {
        if (cloned[field]?.type) {
          cloned[field] = { ...cloned[field], required: true }
        }
      }
    }
    
    return new Schema(cloned, this.options)
  }

  /**
   * Select only specific fields from schema
   * Returns a new Schema without mutating the original
   * 
   * @param {string[]|string|Record<string, unknown>|true} fields - Field names to keep, object map with truthy values, or `true` to keep all fields (cloned schema)
   * @returns {Schema} New schema with only selected fields
   * 
   * @example
   * schema.pick(['name', 'email'])
   * schema.pick('name')
   * schema.pick({ name: 1, age: true })
   * schema.pick(true) // same keys as original, new Schema instance
   */
  pick(fields) {
    if (fields === true) {
      return new Schema(cloneSchemaDef(this.schemaDef), this.options)
    }
    const keys = normalizeSelectedFields(fields)
    const picked = {}
    for (const field of keys) {
      if (field in this.schemaDef) {
        picked[field] = cloneSchemaDef(this.schemaDef[field])
      }
    }
    return new Schema(picked, this.options)
  }

  /**
   * Remove specific fields from schema
   * Returns a new Schema without mutating the original
   * 
   * @param {string[]|string|Record<string, unknown>} fields - Field names to remove
   * @returns {Schema} New schema without selected fields
   * 
   * @example
   * schema.omit(['password', 'createdAt'])
   * schema.omit('password')
   * schema.omit({ password: 1, email: true })
   */
  omit(fields) {
    const cloned = cloneSchemaDef(this.schemaDef)
    for (const field of normalizeSelectedFields(fields)) {
      delete cloned[field]
    }
    return new Schema(cloned, this.options)
  }

  /**
   * Merge with another schema
   * Returns a new Schema combining fields from both schemas
   * Fields from the other schema override fields in this schema
   * 
   * @param {Schema} other - Another Schema instance to merge
   * @returns {Schema} New merged schema
   * 
   * @example
   * const schema1 = new Schema({ name: String })
   * const schema2 = new Schema({ age: Number })
   * const merged = schema1.merge(schema2)
   */
  merge(other) {
    if (!(other instanceof Schema)) {
      throw new TypeError('merge() expects a Schema instance')
    }
    const cloned = cloneSchemaDef(this.schemaDef)
    const otherCloned = cloneSchemaDef(other.schemaDef)
    const merged = { ...cloned, ...otherCloned }
    return new Schema(merged, this.options)
  }

  /**
   * Compile validator function for the schema
   * Generates optimized validation code for performance
   * 
   * @private
   * @param {Object} schema - Normalized schema
   * @returns {Function} Compiled validator function
   */
  _compileValidator(schema) {
    const options = this.options
    const validators = []

    function build(schema, path = '', validators, isSchemaArray = false) {
      const schemaPath = path ? `schema.${path}` : 'schema'
      const dataPath = path ? `data.${path}` : 'data'

      // Handle array schema
      if (isArray(schema)) {
        // Assume single schema for all items
        const itemSchema = schema[0]
        validators.push(`
          // Array validation for path: ${escapeString(path)}
          let arr = ${dataPath.replaceAll('.', '?.')}
          if (arr !== undefined) {
            if (!Array.isArray(arr)) {
              // Use custom validation error
              throw validationError({ 
                kind: 'array', 
                message: 'Field "${escapeString(path)}" must be an array', 
                path: '${escapeString(path)}', 
                value: arr 
              })
            }
            for (let i = 0; i < arr.length; i++) {
              let item = arr[i]
              let itemOut = {}
              ${(() => {
                const itemValidators = []
                build(itemSchema, path, itemValidators, true)
                return '{\n' + itemValidators.join('\n}\n\n{') + '\n}'
              })()}
            }
            // Extract coerced array items from out back into arr
            for (let i = 0; i < arr.length; i++) {
              const itemKey = '${escapeString(path)}[' + i + ']'
              if (out[itemKey] !== undefined) {
                arr[i] = out[itemKey]
                delete out[itemKey]
              }
            }
            out['${escapeString(path)}'] = arr
          }
        `)
        return
      }

      // Handle nested object schema
      if (isObject(schema)) {
        const hasAny = Object.prototype.hasOwnProperty.call(schema, 'any')
        if (!hasAny) {
          Object.defineProperty(schema, 'any', { value: true, writable: true, configurable: true })
        } else {
          schema.any = true
        }
        for (const key in schema) {
          if (key === 'default' || !Object.prototype.hasOwnProperty.call(schema, key)) continue
          const fieldSchema = schema[key]
          if (isObject(fieldSchema)) {
            build(fieldSchema, path ? `${path}.${key}` : key, validators)
            schema.any = false
          }
        }
        if (!schema.type || isObject(schema.type))
          return
      }

      // Primitive or object field validation
      validators.push(`
        // Handle primitive field schema
        const _schema = ${schemaPath}${isSchemaArray ? '[0]' : ''}
        const path = '${escapeString(path)}${isSchemaArray ? '[\' + i + \']' : '' }'
        let val = ${isSchemaArray ? 'item' : dataPath.replaceAll('.', '?.') }
        // Required validation
        ${
          schema.required?.flag
            ? `
          if ( ${ // If partial, only validate required if val is not undefined
            options.partial
              ? 'val !== undefined && (val === null || (typeof val === \'string\' && val.trim() === \'\'))'
              // Otherwise, validate required as usual
              : 'val === undefined || val === null || (typeof val === \'string\' && val.trim() === \'\')'
          } )
          {
            // Use custom validation error
            throw validationError({ 
              kind: 'required', 
              message: _schema.required.msg || _schema.message || \`Field "\${path}" is required\`, 
              path, 
              value: val 
            })
          }
        `
            : ''
        }
        ${ // Apply default if value is undefined
        schema.default !== undefined && schema.coerce
          ? `
          const defaultVal = _schema.default
          if (val === undefined) {
            out['${escapeString(path)}${isSchemaArray ? '[\' + i + \']' : ''}'] = typeof defaultVal === 'function' ? defaultVal() : defaultVal
          }
        `
          : ''}
        if (val !== undefined) {
        ${ // Type validation and coercion
        schema.coerce !== false
          ? `
          const newVal = _schema.typeValidator(_schema, val, path)
          if (_schema.coerce !== false && newVal !== val) val = newVal
        `
          : `
          _schema.typeValidator(_schema, val, path)
        `}
        ${ // Enum validation
        schema.enum?.values
          ? `
          const enumMsg = _schema.enum?.msg || _schema.message
          const enumSet = new Set(_schema.enum.values)
          if (enumSet && !enumSet.has(val)) {
            // Use custom validation error
            throw validationError({ 
              kind: 'enum', 
              message: enumMsg || \`Field "\${path}" must be one of: \${[...enumSet].join(', ')}\`, 
              path, 
              value: val 
            })
          }
        `
          : ''}
        ${ // Pattern match validation
        schema.match?.value
          ? `
          const matchMsg = _schema.match?.msg || _schema.message
          const matchVal = _schema.match?.value instanceof RegExp ? _schema.match.value : (_schema.match?.value ? (() => {
            try {
              return new RegExp(_schema.match.value)
            } catch (e) {
              throw new Error('Invalid regex pattern')
            }
          })() : undefined)
          if (matchVal && !matchVal.test(val)) {
            // Use custom validation error
            throw validationError({ 
              kind: 'match', 
              message: matchMsg || \`Field "\${path}" does not match required pattern\`, 
              path, 
              value: val 
            })
          }
        `
          : ''}
        ${ // Custom validator function
        schema.validate?.validator
          ? `
          const validateMsg = _schema.validate?.message || _schema.message
          const customValidator = _schema.validate?.validator
          if (customValidator && !customValidator(val)) {
            // Use custom validation error
            throw validationError({ 
              kind: 'user', 
              message: validateMsg || \`Field "\${path}" failed custom validation\`, 
              path, 
              value: val 
            })
          }
        `
          : ''}
        ${ // Apply transform function if present
        schema.transform
          ? `
          if (typeof _schema.transform === 'function') {
            val = _schema.transform(val)
          }
        `
          : ''}
        // If val is an object, filter only fields defined in the schema
        ${
          (schema.type?.name === 'Object' || schema.type === undefined) && !isArray(schema.type)
            ? `
          for (const k in _schema) {
            if (val !== undefined && val !== null && val[k] === undefined) continue
            if (val !== undefined && val !== null && _schema.any) {
              out['${escapeString(path)}.'+k] = val[k]
              delete val[k]
            }
          }
          if (_schema.any) {
            for (const k in val) {
              out['${escapeString(path)}.'+k] = val[k]
            }
          }
        `
            : `
          ${schema.coerce !== false
            ? `
            out['${escapeString(path)}${isSchemaArray ? '[\' + i + \']' : ''}'] = val
          `
            : ''}
        `}
        }
      `)
    }

    build(schema, '', validators)

    this.stringFn = `
      function validationError({ kind, message, path, value }) {
        let err = new Error(message)
        err.errors = {
          [path]: {
            kind,
            message,
            name: 'ValidatorError',
            path,
            value
          }
        }
        return err
      }

      let out = {}
      {
        ${validators.join('\n}\n\n{')}
      }
      return out
    `

    const validator = new Function('schema', 'data', this.stringFn)

    return (schema, data) => {
      const out = validator(schema, data)
      return options.coerce === false ? out : expandPathsObject(out)
    }
  }
}

// Utilitário para transformar objeto de paths em objeto real aninhado
function expandPathsObject(obj) {
  let result = {}
  for (let key in obj) {
    let value = obj[key]
    let parts = []
    let regex = /([^[.\]]+)|\[(\d+)\]/g
    let match
    while ((match = regex.exec(key))) {
      if (match[1] !== undefined)
        parts.push(match[1])
      else if (match[2] !== undefined)
        parts.push(Number(match[2]))
    }

    let curr = result
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i]
      let nextPart = parts[i + 1]
      if (i === parts.length - 1) {
        curr[part] = value
      }
      else {
        if (typeof nextPart === 'number') {
          if (!Array.isArray(curr[part]))
            curr[part] = []
        }
        else {
          if (typeof curr[part] !== 'object' || curr[part] === null)
            curr[part] = {}
        }
        curr = curr[part]
      }
    }
  }
  return result
}

export { Schema }
