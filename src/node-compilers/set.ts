import { NodeType, type SetNode } from '../ast';
import type { Compiler } from '../compiler';
import { ExpCompiler } from '../exp-compiler';
import type { CompilerMap } from '../types';

async function compileSet({ val, loc }: SetNode, compiler: Compiler) {
  compiler.pushRaw(loc, new ExpCompiler().compile(val, compiler.context));
}

export const compilers: CompilerMap = {
  [NodeType.SET]: compileSet,
} as CompilerMap;
