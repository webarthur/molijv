# Security Fixes Applied

## Overview
Fixed 6 critical and high-priority security vulnerabilities in molijv.

## Issues Fixed

### 1. Code Injection via Template Literals (schema.js)
**Severity:** Critical
**Location:** `src/schema.js` lines 261-262
**Fix:** Added `_escapeString()` method to escape special characters (`\`, backticks, `$`) in template literals before code generation. All user-controlled paths and field names are now escaped to prevent injection attacks through the `new Function()` compilation.

### 2. Prototype Pollution (schema.js)
**Severity:** High
**Location:** `src/schema.js` lines 314-328
**Fix:** Changed direct mutation of `schema.any` property to use `Object.defineProperty()` to create a non-enumerable property. Added `hasOwnProperty` check to prevent iteration over inherited properties. This prevents malicious schemas from polluting Object.prototype.

### 3. Regular Expression Denial of Service (ReDoS) (normalize.js)
**Severity:** High
**Location:** `src/normalize.js` lines 8-28
**Fix:** Added `validateRegexPattern()` function that:
- Limits regex pattern length to 1024 characters
- Detects common ReDoS patterns (nested quantifiers, multiple quantifiers, alternation with quantifiers)
- Validates patterns before compilation
- Pattern validation is applied to all regex match validators

### 4. NoSQL Injection via Field Names (normalize.js)
**Severity:** High
**Location:** `src/normalize.js` lines 46-63
**Fix:** Added `validateFieldNames()` function that rejects field names:
- Starting with `$` (reserved for NoSQL operators)
- Exceeding 256 characters
- Validates recursively through nested objects

### 5. Object Pollution in cloneSchemaDef (utils.js)
**Severity:** Medium
**Location:** `src/utils.js` lines 22-23
**Fix:** Added `Object.prototype.hasOwnProperty.call()` check to skip prototype properties during cloning. Prevents inherited properties from being copied into cloned schema definitions.

### 6. Unsafe Enum Values (normalize.js)
**Severity:** Medium
**Location:** `src/normalize.js` lines 165-182
**Fix:** Added validation for enum values to ensure they are:
- Primitive types (string, number, boolean, null)
- Or Date objects (for Date field types)
- Rejects functions and arbitrary objects that could cause unexpected behavior

## Testing
All 261 tests pass with these fixes applied. No backward compatibility issues for legitimate use cases.

## Recommendations
1. Document field naming restrictions in API docs
2. Consider adding a schema validation audit trail for sensitive use cases
3. Review custom validation functions for potential side effects
4. Monitor regex patterns in production for performance issues
