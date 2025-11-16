import type { IfNode } from '../ast'
import type { Compiler } from '../compiler'
import type { CompilerMap } from '../types'
import { NodeType } from '../ast'
import { ExpCompiler } from '../exp-compiler'

async function compileIf(
  { test, body, alternatives }: IfNode,
  compiler: Compiler,
) {
  compiler.pushRaw(
    test.loc,
    `if(${new ExpCompiler().compile(test, compiler.context)}){`,
  )
  await compiler.compileNodes(body)
  compiler.pushRaw(null, '}')

  for (const branch of alternatives) {
    if (branch.type === NodeType.ELSE_IF) {
      compiler.pushRaw(
        branch.test.loc,
        `else if(${new ExpCompiler().compile(branch.test, compiler.context)}){`,
      )
    }
    else {
      compiler.pushRaw(null, 'else{')
    }
    await compiler.compileNodes(branch.body)
    compiler.pushRaw(null, '}')
  }
}

export const compilers: CompilerMap = {
  [NodeType.IF]: compileIf,
} as CompilerMap
