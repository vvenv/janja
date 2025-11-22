import { NodeType, OutputNode } from '../ast';
import type { Compiler } from '../compiler';
import { ExpCompiler } from '../exp-compiler';
import { CompilerMap } from '../types';

async function compileOutput({ exp }: OutputNode, compiler: Compiler) {
  compiler.pushVar(exp.loc, new ExpCompiler().compile(exp, compiler.context));
}

export const compilers: CompilerMap = {
  [NodeType.OUTPUT]: compileOutput,
} as CompilerMap;
