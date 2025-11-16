import type { CallNode } from '../ast'
import type { Compiler } from '../compiler'
import type { CompilerMap } from '../types'
import { NodeType } from '../ast'
import { ExpCompiler } from '../exp-compiler'

async function compileCall(
  { val, body, loc }: CallNode,
  compiler: Compiler,
) {
  compiler.pushRaw(
    loc,
    `await ${new ExpCompiler().compile(val, compiler.context)}(async()=>{`,
  )
  await compiler.compileNodes(body)
  compiler.pushRaw(null, `});`)
}

export const compilers: CompilerMap = {
  [NodeType.CALL]: compileCall,
} as CompilerMap
