import type { Compiler } from '../../compiler';
import { ExpCompiler } from '../../exp/exp-compiler';
import { type BreakNode, type ContinueNode, type ForNode } from './syntax';

async function compileFor(
  { loop: { left, right, loc }, body, alternative }: ForNode,
  compiler: Compiler,
) {
  const { context } = compiler;

  const expCompiler = new ExpCompiler();

  compiler.pushRaw(
    loc,
    '{',
    `const a_=${expCompiler.compile(right, context)},n_=a_.length;`,
  );

  if (alternative) {
    compiler.pushRaw(loc, 'if(!a_.length){');
    await compiler.compileNodes(alternative.body);
    compiler.pushRaw(loc, '}else{');
  }

  compiler.pushRaw(
    loc,
    'let i_=0;',
    left.type === 'SEQ'
      ? `for(const {${left.elements
          .map((el) =>
            el.type === 'ASSIGN'
              ? `${el.left.value}=${expCompiler.compile(el.right, context)}`
              : el.value,
          )
          .join(',')}} of a_){`
      : `for(const ${left.value} of a_){`,
    `const ${compiler.in()}={`,
    `...${context},`,
    'loop:{',
    'first:i_===0,',
    'index:i_++,',
    'last:i_===n_,',
    '},',
    left.type === 'SEQ'
      ? `${left.elements
          .map((el) => (el.type === 'ASSIGN' ? el.left.value : el.value))
          .join(',')},`
      : `${left.value},`,
    '};',
  );

  await compiler.compileNodes(body);
  compiler.out();

  if (alternative) {
    compiler.pushRaw(loc, '}');
  }

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
