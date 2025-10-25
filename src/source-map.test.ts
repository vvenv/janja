import type { Config } from './types'
import { expect, it } from 'vitest'
import { SourceMap } from './source-map'

it('mapping', () => {
  const sourcemap = new SourceMap({} as Required<Config>)

  sourcemap.addMapping(
    {
      start: 0,
      end: 1,
    },
    {
      start: 2,
      end: 3,
    },
  )
  expect(sourcemap.mappings).toMatchInlineSnapshot(
    `
    [
      {
        "source": {
          "end": 1,
          "start": 0,
        },
        "target": {
          "end": 3,
          "start": 2,
        },
      },
    ]
  `,
  )
  expect(sourcemap.getLocations(0)).toMatchInlineSnapshot('[]')
  expect(sourcemap.getLocations(1)).toMatchInlineSnapshot('[]')
  expect(sourcemap.getLocations(2)).toMatchInlineSnapshot(
    `
    [
      {
        "end": 1,
        "start": 0,
      },
    ]
  `,
  )
  expect(sourcemap.getLocations(3)).toMatchInlineSnapshot(
    `
    [
      {
        "end": 1,
        "start": 0,
      },
    ]
  `,
  )
  expect(sourcemap.getLocations(4)).toMatchInlineSnapshot('[]')
})
