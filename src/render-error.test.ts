import { expect, it } from 'vitest'
import { RenderError } from './render-error'

it('render error', () => {
  const error = new RenderError('test error', {
    source: '{{ if }}{{ else }}{{ endif }}',
    error: {
      stack: '<anonymous>:1:1)',
    } as any,
    sourcemap: {
      getRanges: (index: number) =>
        index === 1
          ? [
              {
                start: 0,
                end: 9,
              },
              {
                start: 19,
                end: 28,
              },
            ]
          : [],
    } as any,
  })
  expect(error.name).toBe('RenderError')
  expect(error.message).toBe('test error')
  expect(error.details).toMatchInlineSnapshot(
    `
    "test error

    1: {{ if }}{{ else }}{{ endif }}
       ^^^^^^^^^
                          ^^^^^^^^^
    "
  `,
  )
})

it('render error w/ missed', () => {
  const error = new RenderError('test error', {
    source: '{{ if }}{{ else }}{{ endif }}',
    error: {
      stack: '',
    } as any,
    sourcemap: {
      getRanges: (index: number) =>
        index === 1
          ? [
              {
                start: 0,
                end: 9,
              },
              {
                start: 19,
                end: 28,
              },
            ]
          : [],
    } as any,
  })
  expect(error.name).toBe('RenderError')
  expect(error.message).toBe('test error')
  expect(error.details).toMatchInlineSnapshot(
    `
    "test error

       ...
    "
  `,
  )
})
