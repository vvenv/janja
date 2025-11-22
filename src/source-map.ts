import type { Loc, Mapping, Pos } from './types';

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
 *       start: {
 *         line: 2,
 *         column: 4,
 *       },
 *       end: {
 *         line: 3,
 *         column: 5,
 *       },
 *     },
 *     target: {
 *       start: {
 *         line: 2,
 *         column: 3,
 *       },
 *       end: {
 *         line: 3,
 *         column: 8,
 *       },
 *     }
 *   }
 */
export class SourceMap {
  public mappings: Mapping[] = [];

  addMapping(source: Loc, target: Loc) {
    this.mappings.push({
      source,
      target,
    });
  }

  getSourceLoc({ line, column }: Pos) {
    return this.mappings
      .filter(
        ({ target: { start, end } }) =>
          start.line <= line &&
          end.line >= line &&
          (start.line < line || start.column <= column) &&
          (end.line > line || end.column >= column),
      )
      .map(({ source }) => source);
  }
}
