import type { Compiler } from '../../compiler';
import { UnexpectedNode } from './syntax';

async function compileUnexpected(
  { name, val, loc }: UnexpectedNode,
  compiler: Compiler,
) {
  compiler.pushRaw(loc, `<!-- unexpected "${name}" with value "${val}" -->`);
}

export const compilers = {
  UNEXPECTED: compileUnexpected,
};
