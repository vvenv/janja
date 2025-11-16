import type { CommentNode } from '../ast'
import type { Compiler } from '../compiler'
import type { CompilerMap } from '../types'
import { NodeType } from '../ast'

async function compileComment(
  { val, loc }: CommentNode,
  compiler: Compiler,
) {
  if (!compiler.options.stripComments) {
    compiler.pushStr(loc, `<!--${val}-->`)
  }
}

export const compilers: CompilerMap = {
  [NodeType.COMMENT]: compileComment,
} as CompilerMap
