// MoliJV - Mongoose Like JSON Validator
// import validationError from './src/validation-error.js'
import normalizeSchema from './src/normalize.js'
import { types } from './src/types.js'

const { isArray } = Array
const isObject = (val) => typeof val === 'object' && val !== null

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

      // Handle array schema
      if (isArray(schema)) {
        // Assume single schema for all items
        const itemSchema = schema[0]
        validators.push(`
          // Array validation for path: ${path}
          let arr = ${dataPath.replaceAll('.', '?.')}
          if (arr !== undefined) {
            if (!Array.isArray(arr)) {
              // Use custom validation error
              throw validationError({ 
                kind: 'array', 
                message: 'Field "${path}" must be an array', 
                path: '${path}', 
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
          }
        `)
        return
      }
      
      // Handle nested object schema
      if (isObject(schema)) {
        schema.any = true
        for (const key in schema) {
          if (key === 'default') continue
          const fieldSchema = schema[key]
          if (isObject(fieldSchema)) {
            build(fieldSchema, path ? `${path}.${key}` : key, validators)
            schema.any = false
          }
        }
        if(!schema.type || isObject(schema.type))
          return
      }

      // Primitive or object field validation
      validators.push(`
        // Handle primitive field schema
        const _schema = ${schemaPath}${isSchemaArray ? '[0]' : ''}
        const path = '${path}${isSchemaArray ? '[\' + i + \']' : '' }'
        let val = ${isSchemaArray ? 'item' : dataPath.replaceAll('.', '?.') }
        // Required validation
        ${
          schema.required ? `
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
              message: _schema.required.msg || _schema.message || \`Field "${path}" is required\`, 
              path, 
              value: val 
            })
          }
        `
            : ''
        }
        ${ // Apply default if value is undefined
        schema.default !== undefined && schema.coerce ? `
          const defaultVal = _schema.default
          if (val === undefined) {
            out['${path}${isSchemaArray ? '[\' + i + \']' : ''}'] = typeof defaultVal === 'function' ? defaultVal() : defaultVal
          }
        ` : ''}
        if (val !== undefined) {
        ${ // Type validation and coercion
        schema.coerce !== false ? `
          const newVal = _schema.typeValidator(_schema, val, path)
          if (_schema.coerce !== false && newVal !== val) val = newVal
        ` : `
          _schema.typeValidator(_schema, val, path)
        `}
        ${ // Enum validation
        schema.enum?.values ? `
          const enumMsg = _schema.enum?.msg || _schema.message
          const enumSet = new Set(_schema.enum.values)
          if (enumSet && !enumSet.has(val)) {
            // Use custom validation error
            throw validationError({ 
              kind: 'enum', 
              message: enumMsg || \`Field "${path}" must be one of: \${[...enumSet].join(', ')}\`, 
              path, 
              value: val 
            })
          }
        ` : ''}
        ${ // Pattern match validation
        schema.match?.value ? `
          const matchMsg = _schema.match?.msg || _schema.message
          const matchVal = _schema.match?.value instanceof RegExp ? _schema.match.value : (_schema.match?.value ? new RegExp(_schema.match.value) : undefined)
          if (matchVal && !matchVal.test(val)) {
            // Use custom validation error
            throw validationError({ 
              kind: 'match', 
              message: matchMsg || \`Field "${path}" does not match required pattern\`, 
              path, 
              value: val 
            })
          }
        ` : ''}
        ${ // Custom validator function
        schema.validate?.validator ? `
          const validateMsg = _schema.validate?.message || _schema.message
          const customValidator = _schema.validate?.validator
          if (customValidator && !customValidator(val)) {
            // Use custom validation error
            throw validationError({ 
              kind: 'user', 
              message: validateMsg || \`Field "${path}" failed custom validation\`, 
              path, 
              value: val 
            })
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
          ${ schema.coerce !== false ? `
            out['${path}${isSchemaArray ? '[\' + i + \']' : ''}'] = val
          ` : ''}
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

const Types = types

export { Schema, types, Types }
