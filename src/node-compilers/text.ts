import type { TextNode } from '../ast'
import type { Compiler } from '../compiler'
import type { CompilerMap } from '../types'
import { NodeType } from '../ast'

async function compileText(
  { val, loc, strip: { start, end } }: TextNode,
  compiler: Compiler,
) {
  if (start || compiler.options.trimWhitespace) {
    val = val.replace(/^\s+/, '')
  }
  if (end || compiler.options.trimWhitespace) {
    val = val.replace(/\s+$/, '')
  }
  compiler.pushStr(loc, val)
}

export const compilers: CompilerMap = {
  [NodeType.TEXT]: compileText,
} as CompilerMap
