import { describe, expect, it } from 'vitest'
import { CONTEXT } from './config'
import { Context } from './context'
import { defaultOptions } from './engine'

describe('context', () => {
  it('should initialize with default context', () => {
    const context = new Context(defaultOptions)
    expect(context.context).toBe(CONTEXT)
  })

  describe('affix', () => {
    it('should affix string to context', () => {
      const context = new Context(defaultOptions)
      const result = context.affix('test')
      expect(result).toBe('c_test')
      expect(context.context).toBe('c_test')
    })

    it('should affix number to context', () => {
      const context = new Context(defaultOptions)
      const result = context.affix(123)
      expect(result).toBe('c_123')
      expect(context.context).toBe('c_123')
    })

    it('should support multiple affixes', () => {
      const context = new Context(defaultOptions)

      context.affix('first')
      expect(context.context).toBe('c_first')

      context.affix('second')
      expect(context.context).toBe('c_first_second')

      context.affix(42)
      expect(context.context).toBe('c_first_second_42')
    })

    it('should return the new context value', () => {
      const context = new Context(defaultOptions)
      const result1 = context.affix('alpha')
      const result2 = context.affix('beta')

      expect(result1).toBe('c_alpha')
      expect(result2).toBe('c_alpha_beta')
      expect(context.context).toBe('c_alpha_beta')
    })
  })

  describe('reset', () => {
    it('should reset to previous context after single affix', () => {
      const context = new Context(defaultOptions)

      context.affix('temp')
      expect(context.context).toBe('c_temp')

      context.reset()
      expect(context.context).toBe('c')
    })

    it('should reset to previous context after multiple affixes', () => {
      const context = new Context(defaultOptions)

      context.affix('first')
      context.affix('second')
      context.affix('third')
      expect(context.context).toBe('c_first_second_third')

      context.reset()
      expect(context.context).toBe('c_first_second')

      context.reset()
      expect(context.context).toBe('c_first')

      context.reset()
      expect(context.context).toBe('c')
    })

    it('should handle reset on base context gracefully', () => {
      const context = new Context(defaultOptions)
      expect(context.context).toBe('c')

      context.reset()
      expect(context.context).toBe('c')
    })
  })

  describe('nested operations', () => {
    it('should handle complex affix and reset patterns', () => {
      const context = new Context(defaultOptions)

      // Build nested context
      context.affix('1')
      expect(context.context).toBe('c_1')

      context.affix('2')
      expect(context.context).toBe('c_1_2')

      // Reset one level
      context.reset()
      expect(context.context).toBe('c_1')

      // Reset one level
      context.reset()
      expect(context.context).toBe('c')

      // Keep root level
      context.reset()
      expect(context.context).toBe('c')
    })

    it('should maintain context stack integrity', () => {
      const context = new Context(defaultOptions)

      // Create multiple contexts
      const contexts = ['a', 'b', 'c', 'd', 'e']
      contexts.forEach(ctx => context.affix(ctx))

      expect(context.context).toBe('c_a_b_c_d_e')

      // Reset them in reverse order
      for (let i = contexts.length - 1; i >= 0; i--) {
        context.reset()
        const expected = i === 0 ? 'c' : `c_${contexts.slice(0, i).join('_')}`
        expect(context.context).toBe(expected)
      }
    })
  })

  describe('edge cases', () => {
    it('should handle empty string affix', () => {
      const context = new Context(defaultOptions)
      const result = context.affix('')
      expect(result).toBe('c_')
      expect(context.context).toBe('c_')
    })

    it('should handle zero as affix', () => {
      const context = new Context(defaultOptions)
      const result = context.affix(0)
      expect(result).toBe('c_0')
      expect(context.context).toBe('c_0')
    })

    it('should handle special characters in affix', () => {
      const context = new Context(defaultOptions)
      const result = context.affix('test-name.property[0]')
      expect(result).toBe('c_test-name.property[0]')
      expect(context.context).toBe('c_test-name.property[0]')
    })
  })
})
