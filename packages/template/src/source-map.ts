import type { EngineOptions, Location, Mapping } from './types'

/**
 * Contains the source map information.
 * @example
 * - template:
 *   {{ foo }}
 *
 * - compiled:
 *   s+=e(foo);
 *
 * - sourceMap:
 *   Mapping {
 *     source: {
 *       startIndex: 3,
 *       endIndex: 6,
 *     },
 *     target: {
 *       startIndex: 3,
 *       endIndex: 8,
 *     }
 *   }
 */
export class SourceMap {
  public mappings: Mapping[] = []

  constructor(public options: Required<EngineOptions>) {}

  addMapping(source: Location, target: Location) {
    this.mappings.push({
      source,
      target,
    })
  }

  getLocations(offset: number) {
    return this.mappings
      .filter(
        ({ target: { startIndex, endIndex } }) =>
          startIndex <= offset && endIndex >= offset,
      )
      .map(({ source }) => source)
  }
}
