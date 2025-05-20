// MoliJV - Mongoose Like JSON Validator

import normalizeSchema from './src/normalize.js'

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
    return this._validatorFn(this._normalizedSchema, data)
  }

  _compileValidator(schema) {
    const options = this.options
    const validators = []
    
    function build(schema, path = '', validators, isSchemaArray = false) {
      const schemaPath = path ? `schema.${path}` : 'schema'
      const dataPath = path ? `data.${path}` : 'data'

      if (typeof schema === 'object' && schema !== null) {
        // Handle array schema
        if (isArray(schema)) {
          // Assume single schema for all items
          const itemSchema = schema[0]
          validators.push(`
            // Array validation for path: ${path}
            let arr = ${dataPath.replaceAll('.', '?.')}
            if (arr !== undefined) {
              if (!Array.isArray(arr)) {
                throw new Error('Field "${path}" must be an array')
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
            }
          `)
          return
        }
        // Handle nested object schema
        else {
          schema.any = true
          for (const key in schema) {
            if (key === 'default') continue
            const fieldSchema = schema[key]
            if (typeof fieldSchema === 'object' && fieldSchema !== null) {
              build(fieldSchema, path ? `${path}.${key}` : key, validators)
              schema.any = false
            }
          }
          if(!schema.type)
            return
        }
      }

      // Primitive or object field validation
      validators.push(`
        // Handle primitive field schema
        const _schema = ${schemaPath}${isSchemaArray ? '[0]' : ''}
        const path = '${path}'
        let val = ${isSchemaArray ? 'item' : dataPath.replaceAll('.', '?.') }
        ${ // Type validation and coercion
        schema.typeValidator ? `
          const newVal = _schema.typeValidator(_schema, val, path)
          if (_schema.coerce !== false && newVal !== val) val = newVal
        ` : ''}
        ${ // Apply default if value is undefined
        schema.default !== undefined && schema.coerce ? `
          const defaultVal = _schema.default
          if (val === undefined) {
            out['${path}${isSchemaArray ? '[\' + i + \']' : ''}'] = typeof defaultVal === 'function' ? defaultVal() : defaultVal
          } else {
        ` : ''}
        ${ // Enum validation
        schema.enum?.values ? `
          const enumMsg = _schema.enum?.msg || _schema.message
          const enumSet = new Set(_schema.enum.values)
          if (enumSet && !enumSet.has(val)) {
            throw new Error(enumMsg || \`Field "${path}" must be one of: \${[...enumSet].join(', ')}\`)
          }
        ` : ''}
        ${ // Pattern match validation
        schema.match?.value ? `
          const matchMsg = _schema.match?.msg || _schema.message
          const matchVal = _schema.match?.value instanceof RegExp ? _schema.match.value : (_schema.match?.value ? new RegExp(_schema.match.value) : undefined)
          if (matchVal && !matchVal.test(val)) {
            throw new Error(matchMsg || \`Field "${path}" does not match required pattern\`)
          }
        ` : ''}
        ${ // Custom validator function
        schema.validate?.validator ? `
          const validateMsg = _schema.validate?.message || _schema.message
          const customValidator = _schema.validate?.validator
          if (customValidator && !customValidator(val)) {
            throw new Error(validateMsg || \`Field "${path}" failed custom validation\`)
          }
        ` : ''}
        // If val is an object, filter only fields defined in the schema
        ${ schema.type?.name === 'Object' || schema.type === undefined ? `
          for (const k in _schema) {
            if (val !== undefined && val !== null && val[k] === undefined) continue
            if (val !== undefined && val !== null && _schema.any) {
              out['${path}.'+k] = val[k]
              delete val[k]
            }
          }
          if (_schema.any) {
            for (const k in val) {
              out['${path}.'+k] = val[k]
            }
          }
        ` : `
          if (val !== undefined) {
            out['${path}${isSchemaArray ? '[\' + i + \']' : ''}'] = val
          }
        `}
        ${ // Apply default if value is undefined
        schema.default !== undefined && schema.coerce ? `}` : ''}
      `)
    }

    build(schema, '', validators)

    this.stringFn = `
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
  for (let key in obj)
  {
    let value = obj[key]
    let parts = []
    let regex = /([^[.\]]+)|\[(\d+)\]/g
    let match
    while ((match = regex.exec(key)))
    {
      if (match[1] !== undefined)
        parts.push(match[1])
      else if (match[2] !== undefined)
        parts.push(Number(match[2]))
    }

    let curr = result
    for (let i = 0; i < parts.length; i++)
    {
      let part = parts[i]
      let nextPart = parts[i + 1]
      if (i === parts.length - 1)
      {
        curr[part] = value
      }
      else {
        if (typeof nextPart === 'number')
        {
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

export { Schema, Int32, Decimal128, Double, expandPathsObject }
