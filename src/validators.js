const { isArray } = Array

// Int32 range constants
const INT32_MIN = -2147483648
const INT32_MAX = 2147483647

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
    const requiredFlag = def.required?.flag
    if ((val === undefined || val === null || val === '') && requiredFlag)
      throw new Error(def.required?.msg || def.message || `Field "${path}" is required`)
    if (val === undefined || val === null || val === '') return val
    if (def.coerce === false && typeof val !== 'string')
      throw new Error(def.message || `Field "${path}" must be a string`)
    if (typeof val !== 'string') throw new Error(def.message || `Field "${path}" must be a string`)
    let str = val
    // Apply string transformations if enabled
    if (def.coerce !== false) {
      if (def.trim) str = str.trim()
      if (def.lowercase) str = str.toLowerCase()
      if (def.uppercase) str = str.toUpperCase()
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
    const requiredFlag = def.required?.flag
    
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
      const v = val.toLowerCase()
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
    const requiredFlag = def.required?.flag
    if ((val === undefined || val === null || val === '') && requiredFlag)
      throw new Error(def.required?.msg || def.message || `Field "${path}" is required`)
    if (val === undefined || val === null || val === '') return val
    if (def.coerce === false && (typeof val !== 'number' || Number.isNaN(val) || !Number.isFinite(val)))
      throw new Error(def.message || `Field "${path}" must be a valid finite number`)
    let num = val
    // Coerce string to number if allowed
    if (typeof num === 'string' && def.coerce !== false) {
      const coerced = Number(num)
      if (!isNaN(coerced)) num = coerced
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
    const requiredFlag = def.required?.flag
    if ((val === undefined || val === null || val === '') && requiredFlag)
      throw new Error(def.required?.msg || def.message || `Field "${path}" is required`)
    if (val === undefined || val === null || val === '') return val
    if (def.coerce === false && (typeof val !== 'number' || !Number.isInteger(val)))
      throw new Error(def.message || `Field "${path}" must be an integer`)
    let num = val
    // Coerce string to integer if allowed
    if (typeof num === 'string' && num !== '' && def.coerce !== false) {
      const coerced = Number(num)
      if (!isNaN(coerced)) num = coerced
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
    const requiredFlag = def.required?.flag
    if ((val === undefined || val === null || val === '') && requiredFlag)
      throw new Error(def.required?.msg || def.message || `Field "${path}" is required`)
    if (val === undefined || val === null || val === '') return val
    if (def.coerce === false && (typeof val !== 'number' || !Number.isFinite(val)))
      throw new Error(def.message || `Field "${path}" must be a finite decimal number`)
    let num = val
    // Coerce string to number if allowed
    if (typeof num === 'string' && num !== '' && def.coerce !== false) {
      const coerced = Number(num)
      if (!isNaN(coerced)) num = coerced
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
    const requiredFlag = def.required?.flag
    if ((val === undefined || val === null || val === '') && requiredFlag)
      throw new Error(def.required?.msg || def.message || `Field "${path}" is required`)
    if (val === undefined || val === null || val === '') return val
    if (def.coerce === false && (typeof val !== 'number' || !Number.isFinite(val)))
      throw new Error(def.message || `Field "${path}" must be a finite double`)
    let num = val
    // Coerce string to number if allowed
    if (typeof num === 'string' && num !== '' && def.coerce !== false) {
      const coerced = Number(num)
      if (!isNaN(coerced)) num = coerced
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
    const requiredFlag = def.required?.flag
    if ((val === undefined || val === null || val === '') && requiredFlag)
      throw new Error(def.required?.msg || def.message || `Field "${path}" is required`)
    if (val === undefined || val === null || val === '') return val
    if (def.coerce === false && !(val instanceof Date))
      throw new Error(def.message || `Field "${path}" must be a valid date`)
    let dateVal = val
    // Coerce to Date if allowed
    if (!(val instanceof Date) && def.coerce !== false) {
      dateVal = new Date(val)
    }
    if (!(dateVal instanceof Date) || isNaN(dateVal.getTime()))
      throw new Error(def.message || `Field "${path}" must be a valid date`)
    // Range checks
    if (def.min?.flag !== undefined) {
      const minDate = def.min.flag instanceof Date ? def.min.flag : new Date(def.min.flag)
      if (dateVal < minDate)
        throw new Error(def.min?.msg || def.message || `Field "${path}" must be after ${def.min.flag}`)
    }
    if (def.max?.flag !== undefined) {
      const maxDate = def.max.flag instanceof Date ? def.max.flag : new Date(def.max.flag)
      if (dateVal > maxDate)
        throw new Error(def.max?.msg || def.message || `Field "${path}" must be before ${def.max.flag}`)
    }
    return dateVal
  },

  // Object type validation
  object: (def, val, path) => {
    const requiredFlag = def.required?.flag
    if ((val === undefined || val === null || val === '') && requiredFlag)
      throw new Error(def.required?.msg || def.message || `Field "${path}" is required`)
    if (def.coerce === false && (typeof val !== 'object' || val === null || isArray(val)))
      throw new Error(def.message || `Field "${path}" must be an object`)
    if (val === undefined || val === null || val === '') return val
    if (typeof val !== 'object' || val === null || isArray(val))
      throw new Error(def.message || `Field "${path}" must be an object`)
    return val
  },

  // Array type validation
  array: (def, val, path) => {
    const requiredFlag = def.required?.flag
    if ((val === undefined || val === null || val === '') && requiredFlag)
      throw new Error(def.required?.msg || def.message || `Field "${path}" is required`)
    if (def.coerce === false && (!isArray(val) || val === null))
      throw new Error(def.message || `Field "${path}" must be an array`)
    if (val === undefined || val === null || val === '') return val
    if (!isArray(val) || val === null)
      throw new Error(def.message || `Field "${path}" must be an array`)
    return val
  }
}

export { validators }