import type { Compiler } from '../../compiler';
import { ExpCompiler } from '../../exp/exp-compiler';
import type { OutputNode } from './syntax';

async function compileOutput({ val }: OutputNode, compiler: Compiler) {
  compiler.pushVar(val.loc, new ExpCompiler().compile(val, compiler.context));
}

export const compilers = {
  OUTPUT: compileOutput,
};
