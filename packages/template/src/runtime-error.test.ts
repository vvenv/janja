import { expect, it } from 'vitest'
import { RuntimeError } from './runtime-error'

it('runtimeError', () => {
  const error = new RuntimeError('test error', {
    source: '{{ #if }}{{ else }}{{ /if }}',
    error: {
      stack: '<anonymous>:1:1)',
    } as any,
    sourcemap: {
      getLocations: (index: number) =>
        index === 1
          ? [
              {
                startIndex: 0,
                endIndex: 9,
              },
              {
                startIndex: 19,
                endIndex: 28,
              },
            ]
          : [],
    } as any,
  })

  expect(error.name).toBe('RuntimeError')
  expect(error.message).toBe('test error')
  expect(error.details).toMatchInlineSnapshot(`
    " JianJia  test error

    1: {{ #if }}{{ else }}{{ /if }}
       ^^^^^^^^^
                          ^^^^^^^^^
    "
  `)
})

it('runtimeError w/ missed', () => {
  const error = new RuntimeError('test error', {
    source: '{{ #if }}{{ else }}{{ /if }}',
    error: {
      stack: '',
    } as any,
    sourcemap: {
      getLocations: (index: number) =>
        index === 1
          ? [
              {
                startIndex: 0,
                endIndex: 9,
              },
              {
                startIndex: 19,
                endIndex: 28,
              },
            ]
          : [],
    } as any,
  })

  expect(error.name).toBe('RuntimeError')
  expect(error.message).toBe('test error')
  expect(error.details).toMatchInlineSnapshot(`
    " JianJia  test error

       ...
    "
  `)
})
