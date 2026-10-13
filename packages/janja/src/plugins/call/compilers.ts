import type { Compiler } from '../../compiler';
import { ExpCompiler } from '../../exp/exp-compiler';
import type { CallNode } from './syntax';

async function compileCall({ val, body, loc }: CallNode, compiler: Compiler) {
  compiler.pushRaw(
    loc,
    `s+=await ${new ExpCompiler().compile(val, compiler.context)}(async()=>{`,
    'let s="";',
  );
  await compiler.compileNodes(body);
  compiler.pushRaw(null, 'return s;', '})??"";');
}

export const compilers = {
  CALL: compileCall,
};
