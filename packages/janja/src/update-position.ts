import type { Pos } from './types';

export function updatePosition(str: string, pos: Pos): Pos {
  const newlines = (str.match(/\n/g) || []).length;

  if (newlines > 0) {
    pos.line += newlines;

    const lastNewline = str.lastIndexOf('\n');

    pos.column = str.length - lastNewline;
  } else {
    pos.column += str.length;
  }

  return {
    line: pos.line,
    column: pos.column,
  };
}
