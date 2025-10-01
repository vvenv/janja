import type { Config, Loc, Mapping } from './types'

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
 *       start: 3,
 *       end: 6,
 *     },
 *     target: {
 *       start: 3,
 *       end: 8,
 *     }
 *   }
 */
export class SourceMap {
  public mappings: Mapping[] = []

  constructor(public options: Required<Config>) {}

  addMapping(source: Loc, target: Loc) {
    this.mappings.push({
      source,
      target,
    })
  }

  getLocations(offset: number) {
    return this.mappings
      .filter(
        ({ target: { start, end } }) => start <= offset && end >= offset,
      )
      .map(({ source }) => source)
  }
}
