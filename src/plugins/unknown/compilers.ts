import type { Compiler } from '../../compiler';
import type { UnknownNode } from './syntax';

async function compileUnexpected(
  { name, val, loc }: UnknownNode,
  compiler: Compiler,
) {
  compiler.pushRaw(loc, `<!-- unexpected "${name}" with value "${val}" -->`);
}

export const compilers = {
  UNEXPECTED: compileUnexpected,
};
