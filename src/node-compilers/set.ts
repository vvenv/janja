import type { Compiler } from '../compiler';
import { ExpCompiler } from '../exp/exp-compiler';
import { NodeType, type SetNode } from '../syntax-nodes';
import type { CompilerMap } from '../types';

async function compileSet({ val, loc }: SetNode, compiler: Compiler) {
  compiler.pushRaw(loc, new ExpCompiler().compile(val, compiler.context));
}

export const compilers: CompilerMap = {
  [NodeType.SET]: compileSet,
} as CompilerMap;
