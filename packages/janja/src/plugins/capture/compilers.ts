import type { Compiler } from '../../compiler';
import type { CaptureNode } from './syntax';

async function compileCapture(
  { val, body, loc }: CaptureNode,
  compiler: Compiler,
) {
  compiler.pushRaw(loc, `${compiler.context}.${val.value}=await(async(s)=>{`);
  await compiler.compileNodes(body);
  compiler.pushRaw(null, 'return s;})("");');
}

export const compilers = {
  CAPTURE: compileCapture,
};
