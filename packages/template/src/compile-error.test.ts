import { expect, it } from 'vitest'
import { CompileError } from './compile-error'

it('compile error', () => {
  const error = new CompileError('if tag must have a value', {
    name: 'if',
    value: '',
    raw: '{{ #if }}',
    previous: null,
    next: null,
    start: 0,
    end: 9,
  })
  expect(error.name).toBe('CompileError')
  expect(error.message).toBe('if tag must have a value')
  expect(error.details).toMatchInlineSnapshot(`
    " JianJia  if tag must have a value

    {{ #if }}
    "
  `)
})
