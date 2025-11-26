import type { Compiler } from '../../compiler';
import { ExpCompiler } from '../../exp/exp-compiler';
import { OutputNode } from './syntax';

async function compileOutput({ exp }: OutputNode, compiler: Compiler) {
  compiler.pushVar(exp.loc, new ExpCompiler().compile(exp, compiler.context));
}

export const compilers = {
  OUTPUT: compileOutput,
};
