import type { Compiler } from '../../compiler';
import { ExpCompiler } from '../../exp/exp-compiler';
import type { IfNode } from './syntax';

async function compileIf(
  { test, body, alternatives }: IfNode,
  compiler: Compiler,
) {
  compiler.pushRaw(
    test.loc,
    `if(${new ExpCompiler().compile(test, compiler.context)}){`,
  );
  await compiler.compileNodes(body);
  compiler.pushRaw(null, '}');

  for (const branch of alternatives) {
    if (branch.type === 'ELSE_IF') {
      compiler.pushRaw(
        branch.test.loc,
        `else if(${new ExpCompiler().compile(branch.test, compiler.context)}){`,
      );
    } else {
      compiler.pushRaw(null, 'else{');
    }

    await compiler.compileNodes(branch.body);
    compiler.pushRaw(null, '}');
  }
}

export const compilers = {
  IF: compileIf,
};
