import type { Compiler } from '../compiler';
import { ExpCompiler } from '../exp/exp-compiler';
import { type CallNode, NodeType } from '../syntax-nodes';
import type { CompilerMap } from '../types';

async function compileCall({ val, body, loc }: CallNode, compiler: Compiler) {
  compiler.pushRaw(
    loc,
    `await ${new ExpCompiler().compile(val, compiler.context)}(async()=>{`,
  );
  await compiler.compileNodes(body);
  compiler.pushRaw(null, '});');
}

export const compilers: CompilerMap = {
  [NodeType.CALL]: compileCall,
} as CompilerMap;
