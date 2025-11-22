import { CompileError } from '../compile-error';
import type { Compiler } from '../compiler';
import { type BlockNode, NodeType, type SuperNode } from '../syntax-nodes';
import type { CompilerMap } from '../types';

async function compileBlock(
  { val: { value }, loc }: BlockNode,
  compiler: Compiler,
) {
  compiler.pushRaw(
    loc,
    `if(b["${value}"]&&!(b["${value}"].u++)){`,
    `s+=await b["${value}"].s?.pop()?.()??"";`,
    '}',
  );
}

async function compileSuper({ loc }: SuperNode, compiler: Compiler) {
  if (!compiler.state.block) {
    compiler.options.debug?.(
      new CompileError(
        '"super" should be used inside a block',
        compiler.template,
        loc,
      ),
    );

    return;
  }

  compiler.pushRaw(
    loc,
    `s+=await b["${compiler.state.block}"]?.s?.pop()?.()??"";`,
  );
}

export const compilers: CompilerMap = {
  [NodeType.BLOCK]: compileBlock,
  [NodeType.SUPER]: compileSuper,
} as CompilerMap;
