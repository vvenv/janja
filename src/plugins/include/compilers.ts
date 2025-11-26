import type { Compiler } from '../../compiler';
import { IncludeNode } from './syntax';

async function compileInclude(
  { val: { value }, loc }: IncludeNode,
  compiler: Compiler,
) {
  compiler.pushRaw(loc, `s+=await p["${value}"]?.()??"";`);
}

export const compilers = {
  INCLUDE: compileInclude,
};
