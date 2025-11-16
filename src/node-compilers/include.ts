import type { IncludeNode } from '../ast'
import type { Compiler } from '../compiler'
import type { CompilerMap, LitExp } from '../types'
import { NodeType } from '../ast'

async function compileInclude(
  { val: path, loc }: IncludeNode,
  compiler: Compiler,
) {
  compiler.pushRaw(
    loc,
    `{`,
    `const partial=partials["${(path as LitExp<string>).value}"];`,
    `if(partial){`,
    `s+=await partial(c,e,f);`,
    `}`,
    `}`,
  )
}

export const compilers: CompilerMap = {
  [NodeType.INCLUDE]: compileInclude,
} as CompilerMap
