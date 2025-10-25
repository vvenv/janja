import type { Config, Mapping, Range } from './types'

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

  addMapping(source: Range, target: Range) {
    this.mappings.push({
      source,
      target,
    })
  }

  getRanges(offset: number) {
    return this.mappings
      .filter(
        ({ target: { start, end } }) => start <= offset && end >= offset,
      )
      .map(({ source }) => source)
  }
}
