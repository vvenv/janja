import { describe, expect, it } from 'vitest'
import { config } from './config'
import { Validator } from './validator'

describe('expect', () => {
  it('should add expected token names', () => {
    const validator = new Validator(config)
    validator.expect('endif')
    expect(validator.expected).toEqual(['endif'])
  })
})

it('matchAny', () => {
  const validator = new Validator(config)

  expect(validator.matchAny('endif')).toBe(false)
  expect(validator.matchAny('endfor')).toBe(false)

  validator.expect('endif')
  validator.expect('endfor')

  expect(validator.matchAny('endif')).toBe(true)
  expect(validator.matchAny('endfor')).toBe(true)
  expect(validator.matchAny('endcall')).toBe(false)
})

it('match', () => {
  const validator = new Validator(config)

  expect(validator.match('endif')).toBe(false)
  expect(validator.match('endfor')).toBe(false)

  validator.expect('endif')
  validator.expect('endfor')

  expect(validator.match('endif')).toBe(false)
  expect(validator.match('endfor')).toBe(true)
  expect(validator.match('endcall')).toBe(false)
})

it('consume', () => {
  const validator = new Validator(config)

  expect(validator.consume('endif')).toBe(false)
  expect(validator.consume('endfor')).toBe(false)

  validator.expect('endif')
  validator.expect('endfor')

  expect(validator.consume('endif')).toBe(false)
  expect(validator.consume('endfor')).toBe(true)
  expect(validator.consume('endcall')).toBe(false)
})

it('validate', () => {
  const validator = new Validator(config)
  validator.expect('endif')
  validator.consume('endif')

  expect(() => validator.validate()).not.toThrow()
})

it('validate w/ throw', () => {
  const validator = new Validator(config)
  validator.expect('endif')

  expect(() => validator.validate()).toThrow('expected tokens endif, but got nothing')
})

it('validate w/ throw #2', () => {
  const validator = new Validator(config)
  validator.expect('endif')
  validator.expect('endfor')

  expect(() => validator.validate()).toThrow('expected tokens endif, endfor, but got nothing')
})
