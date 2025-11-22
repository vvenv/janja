import type { Compiler } from '../compiler';
import { type IncludeNode, NodeType } from '../syntax-nodes';
import type { CompilerMap } from '../types';

async function compileInclude(
  { val: { value }, loc }: IncludeNode,
  compiler: Compiler,
) {
  compiler.pushRaw(loc, `s+=await p["${value}"]?.()??"";`);
}

export const compilers: CompilerMap = {
  [NodeType.INCLUDE]: compileInclude,
} as CompilerMap;
