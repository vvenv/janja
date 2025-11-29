import type { Compiler } from '../../compiler';
import type { TextNode } from './syntax';

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

export const compilers = {
  TEXT: compileText,
};
