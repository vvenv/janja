import type { Compiler } from '../compiler';
import { type CaptureNode, NodeType } from '../syntax-nodes';
import type { CompilerMap } from '../types';

async function compileCapture(
  { val, body, loc }: CaptureNode,
  compiler: Compiler,
) {
  compiler.pushRaw(loc, `${compiler.context}.${val.value}=await(async(s)=>{`);
  await compiler.compileNodes(body);
  compiler.pushRaw(null, 'return s;})("");');
}

export const compilers: CompilerMap = {
  [NodeType.CAPTURE]: compileCapture,
} as CompilerMap;
