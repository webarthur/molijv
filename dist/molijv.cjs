'use strict';

const { isArray: isArray$1 } = Array;

// Int32 range constants
const INT32_MIN = -2147483648;
const INT32_MAX = 2147483647;

// let ObjectId

// try { 
//   ObjectId = (await import('mongodb')).ObjectId
// }
// catch (err) { 
//   // throw new Error('mongodb module is required for ObjectId validation') 
// }
  
// Built-in validators for each supported type
const validators = {

  // objectid: (def, val, path) => {
  //   const requiredFlag = def.required?.flag
  //   if ((val === undefined || val === null || val === '') && requiredFlag)
  //     throw new Error(def.required?.msg || def.message || `Field "${path}" is required`)

  //   if (val === undefined || val === null || val === '') return val

  //   if (!ObjectId) {
  //     throw new Error('mongodb module is required for ObjectId validation')
  //   }

  //   if (val instanceof ObjectId) return val

  //   if (typeof val === 'string') {
  //     // 24 hex chars
  //     if (/^[a-fA-F0-9]{24}$/.test(val))
  //       return new ObjectId(val)

  //     // line break before else
  //     throw new Error(def.message || `Field "${path}" must be a valid ObjectId string`)
  //   }

  //   // line break before else
  //   throw new Error(def.message || `Field "${path}" must be an ObjectId or valid ObjectId string`)
  // },

  // String type validation and coercion
  string: (def, val, path) => {
    const requiredFlag = def.required?.flag;
    if ((val === undefined || val === null || val === '') && requiredFlag)
      throw new Error(def.required?.msg || def.message || `Field "${path}" is required`)
    if (val === undefined || val === null || val === '') return val
    if (def.coerce === false && typeof val !== 'string')
      throw new Error(def.message || `Field "${path}" must be a string`)
    if (typeof val !== 'string') throw new Error(def.message || `Field "${path}" must be a string`)
    let str = val;
    // Apply string transformations if enabled
    if (def.coerce !== false) {
      if (def.trim) str = str.trim();
      if (def.lowercase) str = str.toLowerCase();
      if (def.uppercase) str = str.toUpperCase();
    }
    // Length checks
    if (def.minLength !== undefined && str.length < def.minLength)
      throw new Error(def.message || `Field "${path}" length must be >= ${def.minLength}`)
    if (def.maxLength !== undefined && str.length > def.maxLength)
      throw new Error(def.message || `Field "${path}" length must be <= ${def.maxLength}`)
    return str
  },

  // Boolean type validation and coercion
  boolean: (def, val, path) => {
    const requiredFlag = def.required?.flag;
    
    // false is not considered empty
    if ((val === undefined || val === null || val === '' || (typeof val === 'string' && val.trim() === '')) && requiredFlag)
      throw new Error(def.required?.msg || def.message || `Field "${path}" is required`)
    if (val === undefined || val === null || val === '' || (typeof val === 'string' && val.trim() === '')) return val

    if (def.coerce === false && typeof val !== 'boolean')
      throw new Error(def.message || `Field "${path}" must be a boolean`)

    if (typeof val === 'number') {
      if (val === 1) return true
      if (val === 0) return false
    }

    if (typeof val === 'string') {
      const v = val.toLowerCase();
      if (v === '1' || v === 'true' || v === 'yes') return true

      // line break before else
      if (v === '0' || v === 'false' || v === 'no') return false

      // line break before else
      throw new Error(def.message || `Field "${path}" value "${val}" is not allowed for boolean`)
    }
    if (typeof val !== 'boolean')
      throw new Error(def.message || `Field "${path}" must be a boolean`)
    return val
  },

  // Number type validation and coercion
  number: (def, val, path) => {
    const requiredFlag = def.required?.flag;
    if ((val === undefined || val === null || val === '') && requiredFlag)
      throw new Error(def.required?.msg || def.message || `Field "${path}" is required`)
    if (val === undefined || val === null || val === '') return val
    if (def.coerce === false && (typeof val !== 'number' || Number.isNaN(val) || !Number.isFinite(val)))
      throw new Error(def.message || `Field "${path}" must be a valid finite number`)
    let num = val;
    // Coerce string to number if allowed
    if (typeof num === 'string' && def.coerce !== false) {
      const coerced = Number(num);
      if (!isNaN(coerced)) num = coerced;
    }
    if (typeof num !== 'number' || Number.isNaN(num) || !Number.isFinite(num))
      throw new Error(def.message || `Field "${path}" must be a valid finite number`)
    // Range checks
    if (def.min?.flag !== undefined && num < def.min.flag)
      throw new Error(def.min?.msg || def.message || `Field "${path}" must be >= ${def.min.flag}`)
    if (def.max?.flag !== undefined && num > def.max.flag)
      throw new Error(def.max?.msg || def.message || `Field "${path}" must be <= ${def.max.flag}`)
    return num
  },

  // Int32 type validation and coercion
  int32: (def, val, path) => {
    const requiredFlag = def.required?.flag;
    if ((val === undefined || val === null || val === '') && requiredFlag)
      throw new Error(def.required?.msg || def.message || `Field "${path}" is required`)
    if (val === undefined || val === null || val === '') return val
    if (def.coerce === false && (typeof val !== 'number' || !Number.isInteger(val)))
      throw new Error(def.message || `Field "${path}" must be an integer`)
    let num = val;
    // Coerce string to integer if allowed
    if (typeof num === 'string' && num !== '' && def.coerce !== false) {
      const coerced = Number(num);
      if (!isNaN(coerced)) num = coerced;
    }
    if (typeof num !== 'number' || !Number.isInteger(num))
      throw new Error(def.message || `Field "${path}" must be an integer`)
    if (num < INT32_MIN || num > INT32_MAX)
      throw new Error(def.message || `Field "${path}" must be a 32-bit integer`)
    // Range checks
    if (def.min?.flag !== undefined && num < def.min.flag)
      throw new Error(def.min?.msg || def.message || `Field "${path}" must be >= ${def.min.flag}`)
    if (def.max?.flag !== undefined && num > def.max.flag)
      throw new Error(def.max?.msg || def.message || `Field "${path}" must be <= ${def.max.flag}`)
    return num
  },

  // Decimal128 type validation and coercion
  decimal128: (def, val, path) => {
    const requiredFlag = def.required?.flag;
    if ((val === undefined || val === null || val === '') && requiredFlag)
      throw new Error(def.required?.msg || def.message || `Field "${path}" is required`)
    if (val === undefined || val === null || val === '') return val
    if (def.coerce === false && (typeof val !== 'number' || !Number.isFinite(val)))
      throw new Error(def.message || `Field "${path}" must be a finite decimal number`)
    let num = val;
    // Coerce string to number if allowed
    if (typeof num === 'string' && num !== '' && def.coerce !== false) {
      const coerced = Number(num);
      if (!isNaN(coerced)) num = coerced;
    }
    if (typeof num !== 'number' || !Number.isFinite(num))
      throw new Error(def.message || `Field "${path}" must be a finite decimal number`)
    // Range checks
    if (def.min?.flag !== undefined && num < def.min.flag)
      throw new Error(def.min?.msg || def.message || `Field "${path}" must be >= ${def.min.flag}`)
    if (def.max?.flag !== undefined && num > def.max.flag)
      throw new Error(def.max?.msg || def.message || `Field "${path}" must be <= ${def.max.flag}`)
    return num
  },

  // Double type validation and coercion
  double: (def, val, path) => {
    const requiredFlag = def.required?.flag;
    if ((val === undefined || val === null || val === '') && requiredFlag)
      throw new Error(def.required?.msg || def.message || `Field "${path}" is required`)
    if (val === undefined || val === null || val === '') return val
    if (def.coerce === false && (typeof val !== 'number' || !Number.isFinite(val)))
      throw new Error(def.message || `Field "${path}" must be a finite double`)
    let num = val;
    // Coerce string to number if allowed
    if (typeof num === 'string' && num !== '' && def.coerce !== false) {
      const coerced = Number(num);
      if (!isNaN(coerced)) num = coerced;
    }
    if (typeof num !== 'number' || !Number.isFinite(num))
      throw new Error(def.message || `Field "${path}" must be a finite double`)
    // Range checks
    if (def.min?.flag !== undefined && num < def.min.flag)
      throw new Error(def.min?.msg || def.message || `Field "${path}" must be >= ${def.min.flag}`)
    if (def.max?.flag !== undefined && num > def.max.flag)
      throw new Error(def.max?.msg || def.message || `Field "${path}" must be <= ${def.max.flag}`)
    return num
  },

  // Date type validation and coercion
  date: (def, val, path) => {
    const requiredFlag = def.required?.flag;
    if ((val === undefined || val === null || val === '') && requiredFlag)
      throw new Error(def.required?.msg || def.message || `Field "${path}" is required`)
    if (val === undefined || val === null || val === '') return val
    if (def.coerce === false && !(val instanceof Date))
      throw new Error(def.message || `Field "${path}" must be a valid date`)
    let dateVal = val;
    // Coerce to Date if allowed
    if (!(val instanceof Date) && def.coerce !== false) {
      dateVal = new Date(val);
    }
    if (!(dateVal instanceof Date) || isNaN(dateVal.getTime()))
      throw new Error(def.message || `Field "${path}" must be a valid date`)
    // Range checks
    if (def.min?.flag !== undefined) {
      const minDate = def.min.flag instanceof Date ? def.min.flag : new Date(def.min.flag);
      if (dateVal < minDate)
        throw new Error(def.min?.msg || def.message || `Field "${path}" must be after ${def.min.flag}`)
    }
    if (def.max?.flag !== undefined) {
      const maxDate = def.max.flag instanceof Date ? def.max.flag : new Date(def.max.flag);
      if (dateVal > maxDate)
        throw new Error(def.max?.msg || def.message || `Field "${path}" must be before ${def.max.flag}`)
    }
    return dateVal
  },

  // Object type validation
  object: (def, val, path) => {
    const requiredFlag = def.required?.flag;
    if ((val === undefined || val === null || val === '') && requiredFlag)
      throw new Error(def.required?.msg || def.message || `Field "${path}" is required`)
    if (def.coerce === false && (typeof val !== 'object' || val === null || isArray$1(val)))
      throw new Error(def.message || `Field "${path}" must be an object`)
    if (val === undefined || val === null || val === '') return val
    if (typeof val !== 'object' || val === null || isArray$1(val))
      throw new Error(def.message || `Field "${path}" must be an object`)
    return val
  },

  // Array type validation
  array: (def, val, path) => {
    const requiredFlag = def.required?.flag;
    if ((val === undefined || val === null || val === '') && requiredFlag)
      throw new Error(def.required?.msg || def.message || `Field "${path}" is required`)
    if (def.coerce === false && (!isArray$1(val) || val === null))
      throw new Error(def.message || `Field "${path}" must be an array`)
    if (val === undefined || val === null || val === '') return val
    if (!isArray$1(val) || val === null)
      throw new Error(def.message || `Field "${path}" must be an array`)
    return val
  }
};

function mapTypeKeyToFn(typeKey) {
  switch (typeKey) {
    case 'string': return String
    case 'number': return Number
    case 'boolean': return Boolean
    case 'date': return Date
    case 'objectid': return 'objectid'
    case 'int32': return 'int32'
    case 'int': return 'int32'
    case 'decimal128': return 'decimal128'
    case 'decimal': return 'decimal128'
    case 'double': return 'double'
    case 'object': return Object
    case 'array': return Array
    default: return typeKey
  }
}

// Normalize schema definition to internal format, applying options
function normalizeSchema(schemaDef, options) {
  // Recursively normalize schema definitions
  const _normalize = (def) => {
    // Handle type as function (e.g., String, Number)
    if (typeof def === 'function') {
      // Use function name lowercased as key for validator
      return { 
        type: def, 
        typeValidator: validators[def.name.toLowerCase()],
        ...(options.coerce === false ? { coerce: false } : {}) 
      }
    }

    // Handle type as string (e.g., 'string', 'number')
    if (typeof def === 'string') {
      // Try to map string to built-in type function if possible
      let typeKey = def.toLowerCase();
      let typeFn = mapTypeKeyToFn(typeKey);
      let validatorKey = typeof typeFn === 'string' ? typeFn : typeKey;
      return {
        type: typeFn,
        typeValidator: validators[validatorKey],
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
      if (def.type) {
        // Accept type as function or string
        let typeFn = def.type;
        let typeKey;
        if (typeof typeFn === 'function') {
          typeKey = typeFn.name.toLowerCase();
        }
        else if (typeof typeFn === 'string') {
          typeKey = typeFn.toLowerCase();
          typeFn = mapTypeKeyToFn(typeKey);
          typeKey = typeof typeFn === 'string' ? typeFn : typeKey;
        }
        else {
          typeKey = typeFn;
        }
        out = { ...def, type: typeFn };
        // Attach typeValidator if known
        if (validators[typeKey]) {
          out.typeValidator = validators[typeKey];
        }
        else {
          out.typeValidator = undefined;
        }
        // Propagate coerce: false from global if not set on field
        out.coerce = def.coerce === undefined && options.coerce === false ? false : true;
      }
      else {
        // Recursively normalize each field
        for (const k in def) {
          out[k] = _normalize(def[k]);
        }
      }
      
      // Normalize flags for required, min, max
      for (const key of ['required', 'min', 'max']) {
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
          if (typeof out.validate[0] === 'function' || (typeof out.validate[0] === 'object' && typeof out.validate[0].validator === 'function')) {
            if (typeof out.validate[0] === 'function') {
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


const { isArray } = Array;

// Int32 type constructor for schema typing
function Int32() {}
Int32.prototype.toString = () => 'Int32';

// Decimal128 type constructor for schema typing
function Decimal128() {}
Decimal128.prototype.toString = () => 'Decimal128';

// Double type constructor for schema typing
function Double() {}
Double.prototype.toString = () => 'Double';

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

      if (typeof schema === 'object' && schema !== null) {
        // Handle array schema
        if (isArray(schema)) {
          // Assume single schema for all items
          const itemSchema = schema[0];
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
        else {
          schema.any = true;
          for (const key in schema) {
            if (key === 'default') continue
            const fieldSchema = schema[key];
            if (typeof fieldSchema === 'object' && fieldSchema !== null) {
              build(fieldSchema, path ? `${path}.${key}` : key, validators);
              schema.any = false;
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
      `);
    }

    build(schema, '', validators);

    this.stringFn = `
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

exports.Decimal128 = Decimal128;
exports.Double = Double;
exports.Int32 = Int32;
exports.Schema = Schema;
exports.expandPathsObject = expandPathsObject;
