import type { Compiler } from '../../compiler';
import type { UnknownNode } from './syntax';

async function compileUnknown({ name, loc }: UnknownNode, compiler: Compiler) {
  compiler.pushRaw(loc, `<!--Unknown "${name}"-->`);
}

export const compilers = {
  UNKNOWN: compileUnknown,
};
