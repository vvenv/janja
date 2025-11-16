import type {
  ASTNode,
  BlockNode,
  ForNode,
  IfNode,
  IncludeNode,
  TemplateNode,
  UnknownDirectiveNode,
} from './ast'
import type {
  CompilerOptions,
} from './types'
import { NodeType } from './ast'
import { CompileError } from './compile-error'
import { compilerOptions } from './config'
import { Context } from './context'
import { Parser } from './parser'

export class Compiler extends Context {
  public options: Required<CompilerOptions>
  public template!: string
  private root!: boolean
  private partials!: Map<string, string>
  public blocks!: Map<string, BlockNode[]>
  private templateNode!: TemplateNode
  public state!: Record<string, any>

  constructor(options?: CompilerOptions) {
    super()
    this.options = {
      ...compilerOptions,
      ...options,
    }
  }

  async compile(
    template: string,
    root = true,
    blocks: Map<string, BlockNode[]> = new Map(),
  ) {
    this.template = template
    this.root = root
    this.partials = new Map<string, string>()
    this.blocks = blocks
    this.templateNode = new Parser(this.options).parse(template)
    this.state = {}

    this.start()

    if (this.root) {
      await this.parseTemplates()

      if (this.partials.size > 0) {
        this.pushRaw(
          null,
          `const partials = {`,
        )

        for (const [path, code] of this.partials) {
          this.pushRaw(
            null,
            `"${path}":async function r(c,e,f){`,
            code,
            `},`,
          )
        }

        this.pushRaw(
          null,
          `};`,
        )
      }
    }

    await this.compileNode(this.templateNode)

    this.end()

    return this
  }

  private async parseTemplates() {
    const astMap = new Map<string, [IncludeNode | null, string]>()
    const queue: {
      path: string
      node: IncludeNode | null
      template: string
    }[] = [{ path: '$$', node: null, template: this.template }]

    while (queue.length > 0) {
      const { path, node, template } = queue.shift()!

      if (!astMap.has(path)) {
        astMap.set(path, [node, template])
      }

      const { includes, blocks } = this.collectIncludesAndBlocks()

      for (const [path, node] of includes) {
        if (!astMap.has(path)) {
          try {
            queue.push({
              path,
              node,
              template: await this.options.loader(path),
            })
          }
          catch {
            this.options.debug?.(
              new CompileError(
                `Failed to load template from "${path}"`,
                this.template,
                node.loc,
              ),
            )
            return
          }
        }
      }

      for (const block of blocks) {
        const { val: { value } } = block
        if (!this.blocks.has(value)) {
          this.blocks.set(value, [])
        }
        this.blocks.get(value)!.push(block)
      }
    }

    astMap.delete('$$')

    for (const [path, [node, template]] of astMap) {
      if (!this.partials.has(path)) {
        await this.compilePartial(path, node!, template, this.blocks)
      }
    }
  }

  private collectIncludesAndBlocks() {
    const includes = new Map<string, IncludeNode>()
    const blocks: BlockNode[] = []

    const traverse = (node: ASTNode) => {
      if (node.type === NodeType.INCLUDE) {
        if (!includes.has((node as IncludeNode).val.value)) {
          includes.set((node as IncludeNode).val.value, node as IncludeNode)
        }
      }

      if (node.type === NodeType.BLOCK) {
        blocks.push(node as BlockNode)
      }

      if (node.type === NodeType.TEMPLATE) {
        (node as TemplateNode).children.forEach(traverse)
      }

      if (node.type === NodeType.IF) {
        const ifNode = node as IfNode
        ifNode.body.forEach(traverse)
        ifNode.alternatives.forEach((alt) => {
          alt.body.forEach(traverse)
        })
      }

      if (node.type === NodeType.FOR) {
        (node as ForNode).body.forEach(traverse)
      }

      if (node.type === NodeType.BLOCK) {
        (node as BlockNode).body.forEach(traverse)
      }
    }

    traverse(this.templateNode)
    return {
      includes,
      blocks,
    }
  }

  private async compileNode(node: ASTNode) {
    if (node.type === NodeType.TEMPLATE) {
      await this.compileNodes((node as TemplateNode).children)
      return
    }

    if (this.options.compilers[node.type]) {
      await this.options.compilers[node.type]!(node, this)
      return
    }

    this.options.debug?.(
      new CompileError(
        `Unknown "${(node as UnknownDirectiveNode).name}" directive`,
        this.template,
        node.loc,
      ),
    )
  }

  async compileNodes(nodes: ASTNode[]) {
    for (const child of nodes) {
      await this.compileNode(child)
    }
  }

  private async compilePartial(
    path: string,
    node: IncludeNode,
    template: string,
    blocks: Map<string, BlockNode[]>,
  ) {
    try {
      const { code } = await new Compiler(this.options).compile(template, false, blocks)
      this.partials.set(
        path,
        code,
      )
    }
    catch {
      this.options.debug?.(
        new CompileError(
          `Failed to compile template`,
          this.template,
          node.loc,
        ),
      )
    }
  }
}
