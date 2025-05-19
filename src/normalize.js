import { validators } from './validators.js'

// Normalize schema definition to internal format, applying options
export default function normalizeSchema(schemaDef, options) {
  // Recursively normalize schema definitions
  const _normalize = (def) => {
    // Handle type as function (e.g., String, Number)
    if (typeof def === 'function') {
      return { 
        type: def, 
        typeValidator: validators[def.name],
        ...(options.coerce === false ? { coerce: false } : {}) 
      }
    }
    
    // Handle array schema
    if (Array.isArray(def)) {
      return [{ ..._normalize(def[0]) }]
    }
    
    // Handle object schema
    if (typeof def === 'object' && def !== null) {
      let out = {}
      if (def.type) {
        // Field with explicit type
        out = { ...def, type: _normalize(def.type).type }
        // Attach typeValidator if known
        if (validators[out.type.name]) {
          out.typeValidator = validators[out.type.name]
        }
        else {
          out.typeValidator = undefined
        }
        // Propagate coerce: false from global if not set on field
        out.coerce = def.coerce === undefined && options.coerce === false ? false : true
      }
      else {
        // Recursively normalize each field
        for (const k in def) {
          out[k] = _normalize(def[k])
        }
      }
      
      // Normalize flags for required, min, max
      for (const key of ['required', 'min', 'max']) {
        if (out[key] !== undefined) {
          out[key] = Array.isArray(out[key])
            ? { flag: out[key][0], msg: out[key][1] }
            : { flag: out[key], msg: undefined }
        }
      }
      
      // Normalize match to always be { value, msg }
      if (out.match !== undefined) {
        out.match = Array.isArray(out.match)
          ? { value: out.match[0], msg: out.match[1] }
          : { value: out.match, msg: undefined }
      }
      
      // Normalize validate to always be { validator, message }
      if (out.validate !== undefined) {
        if (Array.isArray(out.validate)) {
          if (typeof out.validate[0] === 'function' || (typeof out.validate[0] === 'object' && typeof out.validate[0].validator === 'function')) {
            if (typeof out.validate[0] === 'function') {
              out.validate = { validator: out.validate[0], message: out.validate[1] }
            }
            else {
              out.validate = { validator: out.validate[0].validator, message: out.validate[0].message || out.validate[1] }
            }
          }
          else {
            out.validate = { validator: out.validate[0], message: out.validate[1] }
          }
        }
        else if (typeof out.validate === 'function') {
          out.validate = { validator: out.validate, message: undefined }
        }
        else if (typeof out.validate === 'object' && typeof out.validate.validator === 'function') {
          out.validate = { validator: out.validate.validator, message: out.validate.message }
        }
        else {
          out.validate = { validator: out.validate, message: undefined }
        }
      }
      
      // Normalize enum to always be { values, msg }
      if (out.enum !== undefined) {
        if (Array.isArray(out.enum) && Array.isArray(out.enum[0])) {
          out.enum = { values: out.enum[0], msg: out.enum[1] }
        }
        else {
          out.enum = { values: out.enum, msg: undefined }
        }
      }
      
      // Propagate coerce flag to type validators
      if (def.coerce === false) {
        out.coerce = false
      }
      
      // Precompile regex for match if not already a RegExp
      if (out.match && !(out.match.value instanceof RegExp)) {
        out.match.value = new RegExp(out.match.value)
      }
      
      // Convert min/max date strings to Date objects if needed
      if (out.min && out.type === Date && typeof out.min.flag === 'string') {
        out.min.flag = new Date(out.min.flag)
      }
      
      if (out.max && out.type === Date && typeof out.max.flag === 'string') {
        out.max.flag = new Date(out.max.flag)
      }
      
      return out
    }
    
    // Return as is for unknown types
    return def
  }
  
  return _normalize(schemaDef)
}