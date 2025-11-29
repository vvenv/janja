import type { Compiler } from '../../compiler';
import { CompilerMap } from '../../types';
import { CommentNode } from './syntax';

async function compileComment({ val, loc }: CommentNode, compiler: Compiler) {
  if (!compiler.options.stripComments) {
    compiler.pushStr(loc, `<!--${val}-->`);
  }
}

export const compilers: CompilerMap = {
  COMMENT: compileComment,
};
