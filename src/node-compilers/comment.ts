import type { Compiler } from '../compiler';
import { type CommentNode, NodeType } from '../syntax-nodes';
import type { CompilerMap } from '../types';

async function compileComment({ val, loc }: CommentNode, compiler: Compiler) {
  if (!compiler.options.stripComments) {
    compiler.pushStr(loc, `<!--${val}-->`);
  }
}

export const compilers: CompilerMap = {
  [NodeType.COMMENT]: compileComment,
} as CompilerMap;
