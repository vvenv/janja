import type { Compiler } from '../../compiler';
import { ExpCompiler } from '../../exp/exp-compiler';
import { SetNode } from './syntax';

async function compileSet({ val, loc }: SetNode, compiler: Compiler) {
  compiler.pushRaw(loc, new ExpCompiler().compile(val, compiler.context));
}

export const compilers = {
  SET: compileSet,
};
