import type { Compiler } from '../compiler';
import { ExpCompiler } from '../exp/exp-compiler';
import { NodeType, OutputNode } from '../syntax-nodes';
import { CompilerMap } from '../types';

async function compileOutput({ exp }: OutputNode, compiler: Compiler) {
  compiler.pushVar(exp.loc, new ExpCompiler().compile(exp, compiler.context));
}

export const compilers: CompilerMap = {
  [NodeType.OUTPUT]: compileOutput,
} as CompilerMap;
