import type { Compiler } from '../../compiler';
import { FILTERS } from '../../param-names';
import type { CaptureNode } from './syntax';

async function compileCapture(
  { val, body, loc }: CaptureNode,
  compiler: Compiler,
) {
  // What was captured is finished output: it is marked safe so that writing
  // it out later does not escape it a second time
  compiler.pushRaw(
    loc,
    `${compiler.context}.${val.value}=${FILTERS}.safe.call(${compiler.context},await(async(s)=>{`,
  );
  await compiler.compileNodes(body);
  compiler.pushRaw(null, 'return s;})(""));');
}

export const compilers = {
  CAPTURE: compileCapture,
};
