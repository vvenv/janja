import type { BlockNode, SuperNode } from '../ast'
import type { Compiler } from '../compiler'
import type { CompilerMap } from '../types'
import { NodeType } from '../ast'
import { CompileError } from '../compile-error'

async function compileBlock(
  { val: { value } }: BlockNode,
  compiler: Compiler,
) {
  if (!compiler.blocks.has(value)) {
    return
  }

  compiler.state.block = value
  const blockNode = compiler.blocks.get(value)!.pop()!
  await compiler.compileNodes(blockNode.body)
  compiler.blocks.delete(value)
  compiler.state.block = undefined
}

async function compileSuper(
  { loc }: SuperNode,
  compiler: Compiler,
) {
  if (!compiler.state.block) {
    compiler.options.debug?.(
      new CompileError(
        '"super" should be used inside a block',
        compiler.template,
        loc,
      ),
    )
    return
  }
  const block = compiler.blocks.get(compiler.state.block)?.pop()
  if (block) {
    await compiler.compileNodes(block.body)
  }
}

export const compilers: CompilerMap = {
  [NodeType.BLOCK]: compileBlock,
  [NodeType.SUPER]: compileSuper,
} as CompilerMap
