import type { Compiler } from '../compiler';
import { NodeType, type TextNode } from '../syntax-nodes';
import type { CompilerMap } from '../types';

async function compileText(
  { val, loc, strip: { start, end } }: TextNode,
  compiler: Compiler,
) {
  if (start || compiler.options.trimWhitespace) {
    val = val.replace(/^\s+/, '');
  }

  if (end || compiler.options.trimWhitespace) {
    val = val.replace(/\s+$/, '');
  }

  compiler.pushStr(loc, val);
}

export const compilers: CompilerMap = {
  [NodeType.TEXT]: compileText,
} as CompilerMap;
