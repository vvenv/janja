import type { SetNode } from '../ast'
import type { Compiler } from '../compiler'
import type { CompilerMap } from '../types'
import { NodeType } from '../ast'
import { ExpCompiler } from '../exp-compiler'

async function compileSet(
  { val, loc }: SetNode,
  compiler: Compiler,
) {
  compiler.pushRaw(
    loc,
    new ExpCompiler().compile(val, compiler.context),
  )
  compiler.pushRaw(null, `});`)
}

export const compilers: CompilerMap = {
  [NodeType.SET]: compileSet,
} as CompilerMap
