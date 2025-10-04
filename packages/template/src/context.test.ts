import { expect, it } from 'vitest'
import { config } from './config'
import { Context } from './context'
import { CONTEXT } from './identifiers'

it('context', () => {
  const ctx = new Context(config)
  expect(ctx.context).toBe(CONTEXT)
  expect(ctx.in()).toBe('c_0')
  expect(ctx.context).toBe('c_0')
  expect(ctx.in()).toBe('c_0_1')
  expect(ctx.context).toBe('c_0_1')
  ctx.out()
  expect(ctx.context).toBe('c_0')
  ctx.out()
  expect(ctx.context).toBe('c')
  ctx.out()
  expect(ctx.context).toBe('c')
})

it('matchAny', () => {
  const ctx = new Context(config)

  expect(ctx.matchAny('endif')).toBe(false)
  expect(ctx.matchAny('endfor')).toBe(false)

  ctx.expect('endif')
  ctx.expect('endfor')

  expect(ctx.matchAny('endif')).toBe(true)
  expect(ctx.matchAny('endfor')).toBe(true)
  expect(ctx.matchAny('endcall')).toBe(false)
})

it('match', () => {
  const ctx = new Context(config)

  expect(ctx.match('endif')).toBe(false)
  expect(ctx.match('endfor')).toBe(false)

  ctx.expect('endif')
  ctx.expect('endfor')

  expect(ctx.match('endif')).toBe(false)
  expect(ctx.match('endfor')).toBe(true)
  expect(ctx.match('endcall')).toBe(false)
})

it('consume', () => {
  const ctx = new Context(config)

  expect(ctx.consume('endif')).toBe(false)
  expect(ctx.consume('endfor')).toBe(false)

  ctx.expect('endif')
  ctx.expect('endfor')

  expect(ctx.consume('endif')).toBe(false)
  expect(ctx.consume('endfor')).toBe(true)
  expect(ctx.consume('endcall')).toBe(false)
})

it('validate', () => {
  const ctx = new Context(config)
  ctx.expect('endif')
  ctx.consume('endif')

  expect(() => ctx.validate()).not.toThrow()
})

it('validate w/ throw', () => {
  const ctx = new Context(config)
  ctx.expect('endif')

  expect(() => ctx.validate()).toThrow('expected tokens endif, but got nothing')
})

it('validate w/ throw #2', () => {
  const ctx = new Context(config)
  ctx.expect('endif')
  ctx.expect('endfor')

  expect(() => ctx.validate()).toThrow('expected tokens endif, endfor, but got nothing')
})
