import { Schema } from '../molijv.js'

describe('safeParse / safeValidate', () => {
  let schema

  beforeEach(() => {
    schema = new Schema({
      name: { type: String, required: true },
      age: { type: Number, min: 0 }
    })
  })

  test('safeParse returns success with valid data', () => {
    const result = schema.safeParse({ name: 'John', age: 30 })
    
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ name: 'John', age: 30 })
    expect(result.error).toBeUndefined()
  })

  test('safeParse returns success with type coercion', () => {
    const result = schema.safeParse({ name: 'John', age: '30' })
    
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ name: 'John', age: 30 })
  })

  test('safeParse returns failure with missing required field', () => {
    const result = schema.safeParse({ age: 30 })
    
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    expect(result.data).toBeUndefined()
    expect(result.error.message).toContain('name')
  })

  test('safeParse returns failure with invalid enum', () => {
    const enumSchema = new Schema({
      role: { type: String, enum: ['admin', 'user'] }
    })
    
    const result = enumSchema.safeParse({ role: 'invalid' })
    
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    expect(result.data).toBeUndefined()
  })

  test('safeValidate is alias for safeParse', () => {
    const result1 = schema.safeParse({ name: 'John' })
    const result2 = schema.safeValidate({ name: 'John' })
    
    expect(result1).toEqual(result2)
  })

  test('safeParse does not throw error', () => {
    expect(() => {
      schema.safeParse({ age: 'invalid' })
    }).not.toThrow()
  })

  test('safeParse with empty required field', () => {
    const result = schema.safeParse({ name: '', age: 30 })
    
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  test('safeParse with complex schema', () => {
    const complexSchema = new Schema({
      email: { type: String, match: /@/ },
      tags: [String],
      role: { type: String, enum: ['admin', 'user'] }
    })
    
    const result = complexSchema.safeParse({
      email: 'test@example.com',
      tags: ['a', 'b'],
      role: 'admin'
    })
    
    expect(result.success).toBe(true)
    expect(result.data.email).toBe('test@example.com')
  })
})
