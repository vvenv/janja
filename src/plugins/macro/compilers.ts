import type { Compiler } from '../../compiler';
import { ExpCompiler } from '../../exp/exp-compiler';
import { IdExp, SeqExp } from '../../types';
import { CallerNode, MacroNode } from './syntax';

async function compileMacro(
  { val: { left, right }, loc, body }: MacroNode,
  compiler: Compiler,
) {
  const { context } = compiler;
  const { elements } = right as SeqExp;

  const expCompiler = new ExpCompiler();

  compiler.pushRaw(
    loc,
    `${expCompiler.compile(left)}=(${elements
      .map((el) =>
        el.type === 'ASSIGN'
          ? `${(el.left as IdExp).value}=${expCompiler.compile(el.right)}`
          : (el as IdExp).value,
      )
      .join(',')})=>async(_c)=>{`,
    `const ${compiler.in()}={`,
    `...${context},`,
    elements
      .map((el) =>
        el.type === 'ASSIGN' ? (el.left as IdExp).value : (el as IdExp).value,
      )
      .join(','),
    '};',
  );
  await compiler.compileNodes(body);
  compiler.out();
  compiler.pushRaw(null, '};');
}

function compileCaller({ loc }: CallerNode, compiler: Compiler) {
  compiler.pushRaw(loc, 'await _c?.();');
}

export const compilers = {
  MACRO: compileMacro,
  CALLER: compileCaller,
};
