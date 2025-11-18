import type { IncludeNode } from '../ast'
import type { Compiler } from '../compiler'
import type { CompilerMap } from '../types'
import { NodeType } from '../ast'

async function compileInclude(
  { val: path, loc }: IncludeNode,
  compiler: Compiler,
) {
  compiler.pushRaw(
    loc,
    `s+=await p["${path.value}"]?.()??"";`,
  )
}

export const compilers: CompilerMap = {
  [NodeType.INCLUDE]: compileInclude,
} as CompilerMap
