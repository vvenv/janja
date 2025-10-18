import { expect, it } from 'vitest'
import { CompileError } from './compile-error'

it('compile error', () => {
  const error = new CompileError('if tag must have a value', {
    name: 'if',
    value: null,
    raw: '{{ if }}',
    previous: null,
    next: null,
    start: 0,
    end: 9,
  })
  expect(error.name).toMatchInlineSnapshot(`"CompileError"`)
  expect(error.message).toMatchInlineSnapshot(`"if tag must have a value"`)
  expect(error.details).toMatchInlineSnapshot(
    `
    "if tag must have a value

    1: {{ if }}
       ^^^^^^^^
    "
  `,
  )
})

it('compile error w/ filepath', () => {
  const error = new CompileError('if tag must have a value', {
    name: 'if',
    value: null,
    raw: '{{ if }}',
    previous: null,
    next: null,
    start: 0,
    end: 9,
  }, '/path/to/file.jianjia')
  expect(error.name).toMatchInlineSnapshot(`"CompileError"`)
  expect(error.message).toMatchInlineSnapshot(`"if tag must have a value at /path/to/file.jianjia"`)
  expect(error.details).toMatchInlineSnapshot(
    `
    "if tag must have a value at /path/to/file.jianjia

    1: {{ if }}
       ^^^^^^^^
    "
  `,
  )
})
