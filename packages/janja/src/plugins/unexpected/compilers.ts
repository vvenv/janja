import type { Compiler } from '../../compiler';
import type { UnexpectedNode } from './syntax';

async function compileUnexpected(
  { name, loc }: UnexpectedNode,
  compiler: Compiler,
) {
  compiler.pushRaw(loc, `<!--Unexpected "${name}"-->`);
}

export const compilers = {
  UNEXPECTED: compileUnexpected,
};
