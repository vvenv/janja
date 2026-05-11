import type { Compiler } from '../../compiler';
import { ExpCompiler } from '../../exp/exp-compiler';
import type { CompilerFn } from '../../types';
import type { WithNode } from './syntax';

async function compileWith(node: WithNode, compiler: Compiler) {
  const { context } = compiler;
  const expCompiler = new ExpCompiler();

  compiler.pushRaw(
    node.loc,
    `const ${compiler.in()}=${expCompiler.compile(node.expression, context)};`,
  );

  await compiler.compileNodes(node.body);

  compiler.out();
}

export const compilers: Record<string, CompilerFn> = {
  WITH: compileWith,
};
