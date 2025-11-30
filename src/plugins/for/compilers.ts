import type { Compiler } from '../../compiler';
import { ExpCompiler } from '../../exp/exp-compiler';
import { type BreakNode, type ContinueNode, type ForNode } from './syntax';

async function compileFor({ loop, body }: ForNode, compiler: Compiler) {
  const { context } = compiler;

  const expCompiler = new ExpCompiler();

  if (loop.left.type === 'SEQ') {
    compiler.pushRaw(
      loop.loc,
      '{',
      `const a_=${expCompiler.compile(loop.right, context)},n_=a_.length;`,
      'let i_=0;',
      `for(const {${loop.left.elements
        .map((el) =>
          el.type === 'ASSIGN'
            ? `${el.left.value}=${expCompiler.compile(el.right, context)}`
            : el.value,
        )
        .join(',')}} of a_){`,
      `const ${compiler.in()}={`,
      `...${context},`,
      'loop:{',
      'first:i_===0,',
      'index:i_++,',
      'last:i_===n_,',
      '},',
      `${loop.left.elements
        .map((el) => (el.type === 'ASSIGN' ? el.left.value : el.value))
        .join(',')},`,
      '};',
    );
  } else {
    compiler.pushRaw(
      loop.loc,
      '{',
      `const a_=${expCompiler.compile(loop.right, context)},n_=a_.length;`,
      'let i_=0;',
      `for(const ${loop.left.value} of a_){`,
      `const ${compiler.in()}={`,
      `...${context},`,
      'loop:{',
      'first:i_===0,',
      'index:i_++,',
      'last:i_===n_,',
      '},',
      `${loop.left.value},`,
      '};',
    );
  }

  await compiler.compileNodes(body);
  compiler.out();
  compiler.pushRaw(null, '}', '};');
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
