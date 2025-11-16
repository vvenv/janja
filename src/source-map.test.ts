import { expect, it } from 'vitest'
import { SourceMap } from './source-map'

it('mapping', () => {
  const sourcemap = new SourceMap()

  sourcemap.addMapping(
    {
      start: { line: 1, column: 1 },
      end: { line: 1, column: 2 },
    },
    {
      start: { line: 2, column: 3 },
      end: { line: 2, column: 4 },
    },
  )
  expect(sourcemap.getSourceLoc({ line: 1, column: 1 })).toMatchInlineSnapshot('[]')
  expect(sourcemap.getSourceLoc({ line: 1, column: 2 })).toMatchInlineSnapshot('[]')
  expect(sourcemap.getSourceLoc({ line: 2, column: 1 })).toMatchInlineSnapshot('[]')
  expect(sourcemap.getSourceLoc({ line: 2, column: 2 })).toMatchInlineSnapshot('[]')
  expect(sourcemap.getSourceLoc({ line: 2, column: 3 })).toMatchInlineSnapshot(
    `
    [
      {
        "end": {
          "column": 2,
          "line": 1,
        },
        "start": {
          "column": 1,
          "line": 1,
        },
      },
    ]
  `,
  )
  expect(sourcemap.getSourceLoc({ line: 2, column: 4 })).toMatchInlineSnapshot(
    `
    [
      {
        "end": {
          "column": 2,
          "line": 1,
        },
        "start": {
          "column": 1,
          "line": 1,
        },
      },
    ]
  `,
  )
  expect(sourcemap.getSourceLoc({ line: 2, column: 5 })).toMatchInlineSnapshot('[]')
  expect(sourcemap.getSourceLoc({ line: 3, column: 1 })).toMatchInlineSnapshot('[]')
})
