'use strict';

// Helper to create mongoose-like validation error
function validationError({ kind, message, path, value }) {
  let err = new Error(message);
  err.errors = {
    [path]: {
      kind,
      message,
      name: 'ValidatorError',
      path,
      value
    }
  };
  return err
}

/*
1. Try to coerce the value to the expected type or throw a validation error
2. Validate the value against the expected type or throw a validation error
3. Check for required fields and throw a validation error if missing
4. ETC...
*/

const { isArray: isArray$1 } = Array;

// Int32 type constructor for schema typing
function Int32() {}
Int32.prototype.toString = () => 'Int32';

// Decimal128 type constructor for schema typing
function Decimal128() {}
Decimal128.prototype.toString = () => 'Decimal128';

// Double type constructor for schema typing
function Double() {}
Double.prototype.toString = () => 'Double';

// Int32 range constants
const INT32_MIN = -2147483648;
const INT32_MAX = 2147483647;

// Built-in validators for each supported type
const validators = {

  // String type validation and coercion
  string: {
    type: String,
    alias: 'str',
    validator: (def, val, path) => {
      const type = typeof val;
      if (def.coerce === false && type !== 'string')
        throw validationError({
          kind: 'string',
          message: def.message || `Field "${path}" must be a string`,
          path,
          value: val
        })
      let str = val;
      if (def.coerce !== false) {
        if (type === 'number' || type === 'boolean' || type === 'bigint') {
          str = String(str);
        }
      }
      // Validate type after coercion
      if (typeof str !== 'string')
        throw validationError({
          kind: 'string',
          message: def.message || `Field "${path}" must be a string`,
          path,
          value: val
        })
      // Apply string transformations if enabled
      if (def.coerce !== false) {
        if (def.trim) str = str.trim();
        if (def.lowercase) str = str.toLowerCase();
        if (def.uppercase) str = str.toUpperCase();
      }
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
          const v = val.toLowerCase();
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
      const type = typeof val;
      let num = val;
      if (num === null || num === '') return null
      if (def.coerce !== false) {
        if (type === 'string' && num !== '' || type === 'boolean' || type === 'bigint') {
          num = Number(num);
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
      const type = typeof val;
      let num = val;
      if (num === null || num === '') return null
      if (def.coerce !== false) {
        if (type === 'string' && num !== '' || type === 'boolean' || type === 'bigint') {
          num = Number(num);
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
      const type = typeof val;
      let num = val;
      if (num === null || num === '') return null
      if (def.coerce !== false) {
        if (type === 'string' && num !== '' || type === 'boolean' || type === 'bigint') {
          num = Number(num);
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
      const type = typeof val;
      let num = val;
      if (num === null || num === '') return null
      if (def.coerce !== false) {
        if (type === 'string' && num !== '' || type === 'boolean' || type === 'bigint') {
          num = Number(num);
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
      let dateVal = val;
      // Coerce to Date if allowed
      if (!(val instanceof Date) && def.coerce !== false) {
        dateVal = new Date(val);
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
        const minDate = def.min.flag instanceof Date ? def.min.flag : new Date(def.min.flag);
        if (dateVal < minDate)
          throw validationError({
            kind: 'min',
            message: def.min?.msg || def.message || `Field "${path}" must be after ${def.min.flag}`,
            path,
            value: dateVal
          })
      }
      if (def.max?.flag !== undefined) {
        const maxDate = def.max.flag instanceof Date ? def.max.flag : new Date(def.max.flag);
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
      if (def.coerce === false && (typeof val !== 'object' || val === null || isArray$1(val)))
        throw validationError({
          kind: 'object',
          message: def.message || `Field "${path}" must be an object`,
          path,
          value: val
        })
      if (typeof val !== 'object' || val === null || isArray$1(val))
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
      if (def.coerce === false && (!isArray$1(val) || val === null))
        throw validationError({
          kind: 'array',
          message: def.message || `Field "${path}" must be an array`,
          path,
          value: val
        })
      if (!isArray$1(val) || val === null)
        throw validationError({
          kind: 'array',
          message: def.message || `Field "${path}" must be an array`,
          path,
          value: val
        })
      return val
    }
  }
};

const alias = {};
for (const v in validators) {
  alias[v] = validators[v];
  if (validators[v].alias) {
    alias[validators[v].alias] = validators[v];
  }
}

const types = {};
for (const v in validators) {
  types[validators[v].type.name] = validators[v].type.name;
}

types.add = (name, options = {}) => {
  if (typeof name !== 'string' || !name) {
    throw new Error('Type name must be a non-empty string')
  }
  if (types[name]) {
    throw new Error(`Type "${name}" already exists`)
  }
  if (!options.validator || typeof options.validator !== 'function') {
    throw new Error(`Type "${name}" must have a validator function`)
  }
  types[name] = options.type || name;
  validators[name] = {
    type: types[name],
    validator: options.validator,
    coerce: options.coerce !== false,
    message: options.message || `Field must be a valid ${name}`
  };
  if (options.alias) {
    alias[options.alias] = validators[name];
  }
};

function getType (typeName) {
  let key;
  if (typeof typeName === 'function') {
    key = typeName.name.toLowerCase();
  }
  else if (typeof typeName === 'string') {
    key = typeName.toLowerCase();
  }
  
  const type = alias[key];

  if (!type) {
    throw new Error(`Unknown type: ${key}`)
  }

  return type
}

// Normalize schema definition to internal format, applying options
function normalizeSchema(schemaDef, options) {
  // Recursively normalize schema definitions
  const _normalize = (def) => {
    // Handle type as function (e.g., String, Number)
    // or type as string (e.g., 'string', 'number')
    if (typeof def === 'function' || typeof def === 'string') {
      // Use function name lowercased as key for validator
      let { type, validator } = getType (def.name);
      return { 
        type, 
        typeValidator: validator,
        ...(options.coerce === false ? { coerce: false } : {}) 
      }
    }
    
    // Handle array schema
    if (Array.isArray(def)) {
      return [{ ..._normalize(def[0]) }]
    }
    
    // Handle object schema
    if (typeof def === 'object' && def !== null) {
      let out = {};
      if (def.type && (typeof def.type === 'function' || typeof def.type === 'string')) {
        // Accept type as function or string
        let { type, validator } = getType (def.type);
        out = { ...def, type, typeValidator: validator };
        
        // Propagate coerce: false from global if not set on field
        out.coerce = !def.coerce && options.coerce === false ? false : true;
      }
      else {
        // Recursively normalize each field
        for (const k in def) {
          if (k !== 'validate') {
            out[k] = _normalize(def[k]);
          }
        }
      }
      
      // Normalize flags for required, min, max
      for (const key of ['required', 'min', 'max', 'maxLength', 'minLength']) {
        if (out[key] !== undefined) {
          out[key] = Array.isArray(out[key])
            ? { flag: out[key][0], msg: out[key][1] }
            : { flag: out[key], msg: undefined };
        }
      }
      
      // Normalize match to always be { value, msg }
      if (out.match !== undefined) {
        out.match = Array.isArray(out.match)
          ? { value: out.match[0], msg: out.match[1] }
          : { value: out.match, msg: undefined };
      }
      
      // Normalize validate to always be { validator, message }
      if (out.validate !== undefined) {
        if (Array.isArray(out.validate)) {
          const type = typeof out.validate[0];
          if (type === 'function' || (type === 'object' && type.validator === 'function')) {
            if (type === 'function') {
              out.validate = { validator: out.validate[0], message: out.validate[1] };
            }
            else {
              out.validate = { validator: out.validate[0].validator, message: out.validate[0].message || out.validate[1] };
            }
          }
          else {
            out.validate = { validator: out.validate[0], message: out.validate[1] };
          }
        }
        else if (typeof out.validate === 'function') {
          out.validate = { validator: out.validate, message: undefined };
        }
        else if (typeof out.validate === 'object' && typeof out.validate.validator === 'function') {
          out.validate = { validator: out.validate.validator, message: out.validate.message };
        }
        else {
          out.validate = { validator: out.validate, message: undefined };
        }
      }
      
      // Normalize enum to always be { values, msg }
      if (out.enum !== undefined) {
        if (Array.isArray(out.enum) && Array.isArray(out.enum[0])) {
          out.enum = { values: out.enum[0], msg: out.enum[1] };
        }
        else {
          out.enum = { values: out.enum, msg: undefined };
        }
      }
      
      // Propagate coerce flag to type validators
      if (def.coerce === false) {
        out.coerce = false;
      }
      
      // Precompile regex for match if not already a RegExp
      if (out.match && !(out.match.value instanceof RegExp)) {
        out.match.value = new RegExp(out.match.value);
      }
      
      // Convert min/max date strings to Date objects if needed
      if (out.min && out.type === Date && typeof out.min.flag === 'string') {
        out.min.flag = new Date(out.min.flag);
      }
      
      if (out.max && out.type === Date && typeof out.max.flag === 'string') {
        out.max.flag = new Date(out.max.flag);
      }
      
      return out
    }
    
    // Return as is for unknown types
    return def
  };
  
  return _normalize(schemaDef)
}

// MoliJV - Mongoose Like JSON Validator
// import validationError from './src/validation-error.js'

const { isArray } = Array;
const isObject = (val) => typeof val === 'object' && val !== null;

// Schema class for validation and coercion
class Schema {
  constructor(schemaDef, options = {}) {
    this.schemaDef = schemaDef;
    // Merge user options with default
    this.options = { coerce: true, ...options };
    // Normalize schema for internal use
    this._normalizedSchema = normalizeSchema(schemaDef, this.options);
    // Precompile validator for performance
    this._validatorFn = this._compileValidator(this._normalizedSchema);
  }

  // Validate input data against schema
  validate(data) {
    return this._validatorFn(this._normalizedSchema, data)
  }

  _compileValidator(schema) {
    const options = this.options;
    const validators = [];
    
    function build(schema, path = '', validators, isSchemaArray = false) {
      const schemaPath = path ? `schema.${path}` : 'schema';
      const dataPath = path ? `data.${path}` : 'data';

      // Handle array schema
      if (isArray(schema)) {
        // Assume single schema for all items
        const itemSchema = schema[0];
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
                const itemValidators = [];
                build(itemSchema, path, itemValidators, true);
                return '{\n' + itemValidators.join('\n}\n\n{') + '\n}'
              })()}
            }
          }
        `);
        return
      }
      
      // Handle nested object schema
      if (isObject(schema)) {
        schema.any = true;
        for (const key in schema) {
          if (key === 'default') continue
          const fieldSchema = schema[key];
          if (isObject(fieldSchema)) {
            build(fieldSchema, path ? `${path}.${key}` : key, validators);
            schema.any = false;
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
        ${ // Type validation and coercion
        schema.required ? `
          if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
            // Use custom validation error
            throw validationError({ 
              kind: 'required', 
              message: _schema.required.msg || _schema.message || \`Field "${path}" is required\`, 
              path, 
              value: val 
            })
          }
        ` : ''}
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
      `);
    }

    build(schema, '', validators);

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
    `;

    const validator = new Function('schema', 'data', this.stringFn);

    return (schema, data) => {
      const out = validator(schema, data);
      return options.coerce === false ? out : expandPathsObject(out)
    }
  }

}

// Utilitário para transformar objeto de paths em objeto real aninhado
function expandPathsObject(obj) {
  let result = {};
  for (let key in obj)
  {
    let value = obj[key];
    let parts = [];
    let regex = /([^[.\]]+)|\[(\d+)\]/g;
    let match;
    while ((match = regex.exec(key)))
    {
      if (match[1] !== undefined)
        parts.push(match[1]);
      else if (match[2] !== undefined)
        parts.push(Number(match[2]));
    }

    let curr = result;
    for (let i = 0; i < parts.length; i++)
    {
      let part = parts[i];
      let nextPart = parts[i + 1];
      if (i === parts.length - 1)
      {
        curr[part] = value;
      }
      else {
        if (typeof nextPart === 'number')
        {
          if (!Array.isArray(curr[part]))
            curr[part] = [];
        }
        else {
          if (typeof curr[part] !== 'object' || curr[part] === null)
            curr[part] = {};
        }
        curr = curr[part];
      }
    }
  }
  return result
}

const Types = types;

exports.Schema = Schema;
exports.Types = Types;
exports.types = types;
