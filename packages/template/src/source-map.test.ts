import type { EngineOptions } from './types'
import { expect, it } from 'vitest'
import { SourceMap } from './source-map'

it('mapping', () => {
  const sourcemap = new SourceMap({} as Required<EngineOptions>)
  sourcemap.addMapping(
    {
      startIndex: 0,
      endIndex: 1,
    },
    {
      startIndex: 2,
      endIndex: 3,
    },
  )
  expect(sourcemap.mappings).toMatchInlineSnapshot(`
    [
      {
        "source": {
          "endIndex": 1,
          "startIndex": 0,
        },
        "target": {
          "endIndex": 3,
          "startIndex": 2,
        },
      },
    ]
  `)
  expect(sourcemap.getLocations(0)).toMatchInlineSnapshot(`[]`)
  expect(sourcemap.getLocations(1)).toMatchInlineSnapshot(`[]`)
  expect(sourcemap.getLocations(2)).toMatchInlineSnapshot(`
    [
      {
        "endIndex": 1,
        "startIndex": 0,
      },
    ]
  `)
  expect(sourcemap.getLocations(3)).toMatchInlineSnapshot(`
    [
      {
        "endIndex": 1,
        "startIndex": 0,
      },
    ]
  `)
  expect(sourcemap.getLocations(4)).toMatchInlineSnapshot(`[]`)
})
