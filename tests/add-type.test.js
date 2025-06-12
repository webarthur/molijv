// Tests for types.add custom type registration

import { types, validators, validatorsAlias } from '../src/types.js'

describe('types.add', () => {
  // Clean up after each test to avoid polluting types/validators
  afterEach(() => {
    // Remove custom type if it exists
    if (types.CustomType) delete types.CustomType
    if (validators.CustomType) delete validators.CustomType
  })

  test('should add and validate a custom type', () => {
    // Add a custom type
    types.add('CustomType', {
      validator: (def, val, path) => {
        if (val !== 'custom') {
          throw new Error('Invalid custom type')
        }
        return val
      }
    })

    // Should be available in types and validators
    expect(types.CustomType).toBe('CustomType')
    expect(typeof validators.CustomType.validator).toBe('function')

    // Should validate correctly
    expect(validators.CustomType.validator({}, 'custom', 'field')).toBe('custom')

    // Should throw on invalid value
    expect(() => validators.CustomType.validator({}, 'notcustom', 'field')).toThrow('Invalid custom type')
  })

  test('should throw if type name is missing or not a string', () => {
    expect(() => types.add('', { validator: () => {} })).toThrow('Type name must be a non-empty string')
    expect(() => types.add(null, { validator: () => {} })).toThrow('Type name must be a non-empty string')
  })

  test('should throw if type already exists', () => {
    types.add('CustomType', { validator: () => true })
    expect(() => types.add('CustomType', { validator: () => true })).toThrow('Type "CustomType" already exists')
  })

  test('should throw if validator is missing or not a function', () => {
    expect(() => types.add('AnotherType', {})).toThrow('Type "AnotherType" must have a validator function')
    expect(() => types.add('AnotherType', { validator: 123 })).toThrow('Type "AnotherType" must have a validator function')
  })

  test('should register alias if provided', () => {
    types.add('CustomType', {
      validator: (def, val, path) => val,
      alias: 'ct'
    })

    expect(validatorsAlias.ct).toBe(validators.CustomType)
  })
})
