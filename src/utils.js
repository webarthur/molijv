const MAX_REGEX_LENGTH = 1024

/**
 * Escape special characters in strings for safe code generation
 * 
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for template literals
 */
const escapeString = (str) => {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
}

/**
 * Validate regex pattern to prevent ReDoS
 * 
 * @param {string|RegExp} pattern - Pattern to validate
 * @throws {Error} If pattern is vulnerable to ReDoS
 */
const validateRegexPattern = (pattern) => {
  if (typeof pattern === 'string') {
    if (pattern.length > MAX_REGEX_LENGTH) {
      throw new Error('Regex pattern exceeds maximum length')
    }
    // Detect common ReDoS patterns
    const redosPatterns = [
      /(\+|\*)\+/,           // Nested quantifiers
      /(\{.*?\}){2,}/,       // Multiple quantifiers
      /\(.*?\|.*?\)\+/,      // Alternation with quantifiers
    ]
    for (const redosPattern of redosPatterns) {
      if (redosPattern.test(pattern)) {
        throw new Error('Regex pattern appears to be vulnerable to ReDoS attacks')
      }
    }
  }
  return true
}

/**
 * Deep clone a schema definition while preserving functions
 * 
 * Recursively clones objects and arrays but passes through functions
 * and primitive values unchanged. Limits recursion depth to 10 levels
 * to prevent infinite recursion.
 * 
 * @param {*} obj - Object to clone
 * @param {number} [depth=0] - Current recursion depth
 * @returns {*} Cloned object with functions preserved
 * 
 * @example
 * const schema = { name: { type: String, transform: fn } }
 * const cloned = cloneSchemaDef(schema)
 * // fn is still a function in cloned, not stringified
 */
const cloneSchemaDef = (obj, depth = 0) => {
  if (depth > 10) return obj
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cloneSchemaDef(item, depth + 1))
  }

  const cloned = {}
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue
    cloned[key] = cloneSchemaDef(obj[key], depth + 1)
  }
  return cloned
}

/**
 * Validate field names to prevent NoSQL injection
 * 
 * @param {*} def - Schema definition to validate
 * @param {string} [path=''] - Current path in nested objects
 * @throws {Error} If field name is invalid
 */
const validateFieldNames = (def, path = '') => {
  if (typeof def !== 'object' || def === null) return
  
  for (const key in def) {
    if (!Object.prototype.hasOwnProperty.call(def, key)) continue
    
    // Reject field names starting with $ (NoSQL operators)
    if (/^[$]/.test(key)) {
      throw new Error(`Field name "${key}" is not allowed - names starting with $ are reserved`)
    }
    // Limit field name length
    if (key.length > 256) {
      throw new Error(`Field name exceeds maximum length of 256 characters`)
    }
    
    const fieldDef = def[key]
    if (typeof fieldDef === 'object' && fieldDef !== null && !Array.isArray(fieldDef)) {
      validateFieldNames(fieldDef, path ? `${path}.${key}` : key)
    }
  }
}

export { cloneSchemaDef, escapeString, validateRegexPattern, validateFieldNames }
