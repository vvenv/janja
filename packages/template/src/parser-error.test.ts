import { expect, it } from 'vitest'
import { ParserError } from './parser-error'

it('parserError', () => {
  const error = new ParserError('test error', {
    template: '{{ #if }}{{ else }}{{ /if }}',
    nodes: [
      {
        startIndex: 0,
        endIndex: 9,
      },
      {
        startIndex: 19,
        endIndex: 28,
      },
    ],
  })

  expect(error.name).toBe('ASTError')
  expect(error.message).toBe('test error')
  expect(error.details).toMatchInlineSnapshot(`
    " JianJia  test error

    1: {{ #if }}{{ else }}{{ /if }}
       ^^^^^^^^^
                          ^^^^^^^^^
    "
  `)
})
