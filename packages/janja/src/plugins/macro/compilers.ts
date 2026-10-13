import type { Compiler } from '../../compiler';
import { ExpCompiler } from '../../exp/exp-compiler';
import type { CallerNode, MacroNode } from './syntax';

async function compileMacro(
  { val: { value, args }, loc, body }: MacroNode,
  compiler: Compiler,
) {
  const { context } = compiler;

  const expCompiler = new ExpCompiler();

  compiler.pushRaw(
    loc,
    // A macro collects its own output and returns it, so that it ends up
    // where the macro is called rather than where it was defined
    `${context}.${value}=(...a_)=>async(_c)=>{`,
    'let s="";',
    `const ${compiler.in()}={`,
    `...${context},`,
    ...(args ?? []).map((el, i) =>
      el.type === 'ASSIGN'
        ? `${el.left.value}:a_[${i}]===undefined?${expCompiler.compile(el.right)}:a_[${i}],`
        : `${el.value}:a_[${i}],`,
    ),
    '};',
  );

  await compiler.compileNodes(body);
  compiler.out();
  compiler.pushRaw(null, 'return s;', '};');
}

function compileCaller({ loc }: CallerNode, compiler: Compiler) {
  compiler.pushRaw(loc, 's+=await _c?.()??"";');
}

export const compilers = {
  MACRO: compileMacro,
  CALLER: compileCaller,
};
