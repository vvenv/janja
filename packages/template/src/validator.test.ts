import type { EngineOptions } from './types'
import { describe, expect, it } from 'vitest'
import { Validator } from './validator'

describe('validator', () => {
  const defaultOptions: Required<EngineOptions> = {
    debug: false,
    globals: {},
    filters: {},
    tags: {},
    strictMode: false,
    autoEscape: true,
    stripComments: false,
    trimWhitespace: false,
    loader: async () => '',
    cache: true,
  }

  it('should initialize with empty expected array', () => {
    const validator = new Validator(defaultOptions)
    expect(validator.expected).toEqual([])
    expect(validator.options).toBe(defaultOptions)
  })

  describe('expect', () => {
    it('should add expected token names', () => {
      const validator = new Validator(defaultOptions)
      validator.expect(['foo', 'bar'])
      expect(validator.expected).toEqual([['foo', 'bar']])
    })

    it('should support multiple expectations', () => {
      const validator = new Validator(defaultOptions)
      validator.expect(['foo', 'bar'])
      validator.expect(['baz'])
      expect(validator.expected).toEqual([['foo', 'bar'], ['baz']])
    })
  })

  describe('matchAny', () => {
    it('should return true if any expected token matches any provided name', () => {
      const validator = new Validator(defaultOptions)
      validator.expect(['foo', 'bar'])
      validator.expect(['baz'])

      expect(validator.matchAny(['foo'])).toBe(true)
      expect(validator.matchAny(['bar'])).toBe(true)
      expect(validator.matchAny(['baz'])).toBe(true)
      expect(validator.matchAny(['foo', 'unknown'])).toBe(true)
    })

    it('should return false if no expected tokens match any provided name', () => {
      const validator = new Validator(defaultOptions)
      validator.expect(['foo', 'bar'])
      validator.expect(['baz'])

      expect(validator.matchAny(['unknown'])).toBe(false)
      expect(validator.matchAny(['other', 'unknown'])).toBe(false)
    })

    it('should return false when no expectations exist', () => {
      const validator = new Validator(defaultOptions)
      expect(validator.matchAny(['foo'])).toBe(false)
    })

    it('should return false when provided names are empty', () => {
      const validator = new Validator(defaultOptions)
      validator.expect(['foo'])
      expect(validator.matchAny([])).toBe(false)
    })
  })

  describe('match', () => {
    it('should return true if the last expected token matches any provided name', () => {
      const validator = new Validator(defaultOptions)
      validator.expect(['foo', 'bar'])
      validator.expect(['baz'])

      expect(validator.match(['baz'])).toBe(true)
      expect(validator.match(['baz', 'unknown'])).toBe(true)
    })

    it('should return false if the last expected token does not match any provided name', () => {
      const validator = new Validator(defaultOptions)
      validator.expect(['foo', 'bar'])
      validator.expect(['baz'])

      expect(validator.match(['foo'])).toBe(false)
      expect(validator.match(['bar'])).toBe(false)
      expect(validator.match(['unknown'])).toBe(false)
    })

    it('should return undefined when no expectations exist', () => {
      const validator = new Validator(defaultOptions)
      expect(validator.match(['foo'])).toBeUndefined()
    })

    it('should return false when provided names are empty', () => {
      const validator = new Validator(defaultOptions)
      validator.expect(['foo'])
      expect(validator.match([])).toBe(false)
    })
  })

  describe('consume', () => {
    it('should consume and return true when last expected token matches', () => {
      const validator = new Validator(defaultOptions)
      validator.expect(['foo', 'bar'])
      validator.expect(['baz'])

      expect(validator.consume(['baz'])).toBe(true)
      expect(validator.expected).toEqual([['foo', 'bar']])
    })

    it('should not consume and return false when last expected token does not match', () => {
      const validator = new Validator(defaultOptions)
      validator.expect(['foo', 'bar'])
      validator.expect(['baz'])

      expect(validator.consume(['foo'])).toBe(false)
      expect(validator.expected).toEqual([['foo', 'bar'], ['baz']])
    })

    it('should return false when no expectations exist', () => {
      const validator = new Validator(defaultOptions)
      expect(validator.consume(['foo'])).toBe(false)
    })

    it('should consume multiple expectations in LIFO order', () => {
      const validator = new Validator(defaultOptions)
      validator.expect(['foo'])
      validator.expect(['bar'])
      validator.expect(['baz'])

      expect(validator.consume(['baz'])).toBe(true)
      expect(validator.expected).toEqual([['foo'], ['bar']])

      expect(validator.consume(['bar'])).toBe(true)
      expect(validator.expected).toEqual([['foo']])

      expect(validator.consume(['foo'])).toBe(true)
      expect(validator.expected).toEqual([])
    })
  })

  describe('validate', () => {
    it('should not throw when all expectations are consumed', () => {
      const validator = new Validator(defaultOptions)
      validator.expect(['foo'])
      validator.consume(['foo'])

      expect(() => validator.validate()).not.toThrow()
    })

    it('should throw when expectations remain unconsumed', () => {
      const validator = new Validator(defaultOptions)
      validator.expect(['foo'])

      expect(() => validator.validate()).toThrow('expected tokens foo, but got nothing')
    })

    it('should throw with multiple unconsumed expectations', () => {
      const validator = new Validator(defaultOptions)
      validator.expect(['foo', 'bar'])
      validator.expect(['baz'])

      expect(() => validator.validate()).toThrow('expected tokens foo, bar, baz, but got nothing')
    })

    it('should not throw when no expectations were set', () => {
      const validator = new Validator(defaultOptions)
      expect(() => validator.validate()).not.toThrow()
    })
  })

  describe('integration scenarios', () => {
    it('should handle complex validation workflow', () => {
      const validator = new Validator(defaultOptions)

      // Set up nested expectations
      validator.expect(['if', 'for'])
      validator.expect(['endif', 'endfor'])

      // Check if any tokens match
      expect(validator.matchAny(['if', 'other'])).toBe(true)
      expect(validator.matchAny(['other', 'unknown'])).toBe(false)

      // Match specific last expectation
      expect(validator.match(['endif'])).toBe(true)
      expect(validator.match(['if'])).toBe(false)

      // Consume the last expectation
      expect(validator.consume(['endif'])).toBe(true)
      expect(validator.expected).toEqual([['if', 'for']])

      // Now the first expectation becomes the last
      expect(validator.match(['if'])).toBe(true)
      expect(validator.consume(['for'])).toBe(true)
      expect(validator.expected).toEqual([])

      // Validation should pass
      expect(() => validator.validate()).not.toThrow()
    })

    it('should handle empty token arrays', () => {
      const validator = new Validator(defaultOptions)
      validator.expect([])

      expect(validator.matchAny(['foo'])).toBe(false)
      expect(validator.match(['foo'])).toBe(false)
      expect(validator.consume(['foo'])).toBe(false)
    })
  })
})
