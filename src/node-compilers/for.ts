import type { Compiler } from '../compiler';
import { ExpCompiler } from '../exp/exp-compiler';
import {
  type BreakNode,
  type ContinueNode,
  type ForNode,
  NodeType,
} from '../syntax-nodes';
import type { CompilerMap, IdExp, SeqExp } from '../types';

async function compileFor({ loop, body }: ForNode, compiler: Compiler) {
  const { context } = compiler;

  if (loop.left.type === 'SEQ') {
    compiler.pushRaw(
      loop.loc,
      `for(${new ExpCompiler().compile(loop, context)}){`,
      `const ${compiler.in()}={`,
      `...${context},`,
      `${((loop.left as SeqExp).elements as IdExp[]).map(({ value }) => value).join(',')},`,
      '};',
    );
  } else {
    compiler.pushRaw(
      loop.loc,
      `for(${new ExpCompiler().compile(loop, context)}){`,
      `const ${compiler.in()}={`,
      `...${context},`,
      `${(loop.left as IdExp).value},`,
      '};',
    );
  }

  await compiler.compileNodes(body);
  compiler.out();
  compiler.pushRaw(null, '}');
}

function compileBreak({ loc }: BreakNode, compiler: Compiler) {
  compiler.pushRaw(loc, 'break;');
}

function compileContinue({ loc }: ContinueNode, compiler: Compiler) {
  compiler.pushRaw(loc, 'continue;');
}

export const compilers: CompilerMap = {
  [NodeType.FOR]: compileFor,
  [NodeType.BREAK]: compileBreak,
  [NodeType.CONTINUE]: compileContinue,
} as CompilerMap;
