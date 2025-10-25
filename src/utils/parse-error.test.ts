import { expect, it } from 'vitest'
import { ParseError } from './parse-error'

it('parse error', () => {
  const error = new ParseError('if tag must have a value', {
    source: '{{ if }}',
    range: {
      start: 0,
      end: 9,
    },
  })
  expect(error.name).toMatchInlineSnapshot(`"ParseError"`)
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
