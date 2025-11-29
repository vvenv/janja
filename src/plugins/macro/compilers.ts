import type { Compiler } from '../../compiler';
import { ExpCompiler } from '../../exp/exp-compiler';
import type { CallerNode, MacroNode } from './syntax';

async function compileMacro(
  { val: { left, right }, loc, body }: MacroNode,
  compiler: Compiler,
) {
  const { context } = compiler;
  const { elements } = right;

  const expCompiler = new ExpCompiler();

  compiler.pushRaw(
    loc,
    `${expCompiler.compile(left)}=(${elements
      .map((el) =>
        el.type === 'ASSIGN'
          ? `${el.left.value}=${expCompiler.compile(el.right)}`
          : el.value,
      )
      .join(',')})=>async(_c)=>{`,
    `const ${compiler.in()}={`,
    `...${context},`,
    elements
      .map((el) => (el.type === 'ASSIGN' ? el.left.value : el.value))
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
