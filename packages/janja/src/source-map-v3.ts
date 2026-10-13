import type { Mapping } from './source-map';

/**
 * A source map as defined by the Source Map Revision 3 specification.
 */
export interface SourceMapV3 {
  version: 3;
  file?: string;
  sources: string[];
  sourcesContent: string[];
  names: string[];
  mappings: string;
}

export interface SourceMapOptions {
  /** Name of the generated file */
  file?: string;
  /** Name of the template the code was compiled from */
  source: string;
  /** The template itself, embedded so tools need not find it on disk */
  sourceContent: string;
  /** Zero-based line of the generated file that holds the compiled code */
  line: number;
}

const base64 =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function encodeVlq(value: number) {
  let vlq = value < 0 ? (-value << 1) | 1 : value << 1;
  let result = '';

  do {
    let digit = vlq & 31;

    vlq >>>= 5;

    if (vlq > 0) {
      digit |= 32;
    }

    result += base64[digit];
  } while (vlq > 0);

  return result;
}

/**
 * Turn the compiler's mappings (template location -> offset in the compiled
 * code, which is a single line) into a standard source map.
 */
export function generateSourceMap(
  mappings: Mapping[],
  { file, source, sourceContent, line }: SourceMapOptions,
): SourceMapV3 {
  // One segment per generated column; where several template locations
  // start at the same column the most specific (last added) one wins
  const segments = new Map<number, Mapping['source']['start']>();

  for (const mapping of mappings) {
    segments.set(mapping.target.start.column, mapping.source.start);
  }

  let previousColumn = 0;
  let previousSourceLine = 0;
  let previousSourceColumn = 0;

  const encoded = [...segments.entries()]
    .sort(([a], [b]) => a - b)
    .map(([column, position]) => {
      // Template positions are one-based, source maps are zero-based
      const sourceLine = position.line - 1;
      const sourceColumn = position.column - 1;

      const segment =
        encodeVlq(column - previousColumn) +
        encodeVlq(0) +
        encodeVlq(sourceLine - previousSourceLine) +
        encodeVlq(sourceColumn - previousSourceColumn);

      previousColumn = column;
      previousSourceLine = sourceLine;
      previousSourceColumn = sourceColumn;

      return segment;
    })
    .join(',');

  return {
    version: 3,
    ...(file ? { file } : {}),
    sources: [source],
    sourcesContent: [sourceContent],
    names: [],
    mappings: `${';'.repeat(line)}${encoded}`,
  };
}
