import type { Compiler } from '../../compiler';
import { ExpCompiler } from '../../exp/exp-compiler';
import { type BreakNode, type ContinueNode, type ForNode } from './syntax';

async function compileFor({ loop, body }: ForNode, compiler: Compiler) {
  const { context } = compiler;

  const expCompiler = new ExpCompiler();

  if (loop.left.type === 'SEQ') {
    compiler.pushRaw(
      loop.loc,
      `for(${expCompiler.compile(loop, context)}){`,
      `const ${compiler.in()}={`,
      `...${context},`,
      `${loop.left.elements
        .map((el) => (el.type === 'ASSIGN' ? el.left.value : el.value))
        .join(',')},`,
      '};',
    );
  } else {
    compiler.pushRaw(
      loop.loc,
      `for(${expCompiler.compile(loop, context)}){`,
      `const ${compiler.in()}={`,
      `...${context},`,
      `${loop.left.value},`,
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

export const compilers = {
  FOR: compileFor,
  BREAK: compileBreak,
  CONTINUE: compileContinue,
};
