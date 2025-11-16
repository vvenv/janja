import type { OutputNode } from '../ast'
import type { Compiler } from '../compiler'
import type { CompilerMap } from '../types'
import { NodeType } from '../ast'
import { ExpCompiler } from '../exp-compiler'

async function compileOutput(
  { exp }: OutputNode,
  compiler: Compiler,
) {
  compiler.pushVar(exp.loc, new ExpCompiler().compile(exp, compiler.context))
}

export const compilers: CompilerMap = {
  [NodeType.OUTPUT]: compileOutput,
} as CompilerMap
