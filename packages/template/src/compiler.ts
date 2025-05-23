import type { Parser } from './parser'
import type { AST, ASTNode, EngineOptions } from './types'
import { CONTEXT } from './config'
import { OutScript } from './out-script'
import { SourceMap } from './source-map'

export class Compiler {
  constructor(public options: Required<EngineOptions>) {}

  async compile(template: string, parser: Parser) {
    const out = new OutScript(this.options)
    const sourcemap = new SourceMap(this.options)

    if (parser.valid) {
      out.start()

      const { children } = parser
      if (children.length) {
        for (const child of children) {
          await this.compileNode(template, child, CONTEXT, parser, out, sourcemap)
        }

        out.pushStr(template.slice(parser.cursor.endIndex), {
          trimStart: parser.cursor.stripAfter,
          trimEnd: false,
        })
      }
      else {
        out.pushStr(template)
      }

      out.end()
    }

    return { value: out.value, script: out.script, sourcemap }
  }

  private async compileNode(
    template: string,
    { nodes }: AST,
    context: string,
    parser: Parser,
    out: OutScript,
    sourcemap: SourceMap,
  ) {
    const compileContent = (arg: {
      template: string
      node: ASTNode
      context: string
      out: OutScript
    }) => this.compileContent({ ...arg, parser, sourcemap })
    for (const node of nodes) {
      out.pushStr(template.slice(parser.cursor.endIndex, node.startIndex), {
        trimStart: parser.cursor.stripAfter,
        trimEnd: node.stripBefore,
      })
      parser.goto(node)

      const tags = (this.options.tags[node.identifier] ?? [])
      for (const tag of tags) {
        const r = await tag.compile(
          {
            template,
            node,
            context,
            parser,
            out,
          },
          compileContent,
        )
        if (r !== false) {
          if (r) {
            sourcemap.addMapping(node, r)
          }
          break
        }
      }
    }
  }

  private async compileContent({
    template,
    node,
    context,
    parser,
    out,
    sourcemap,
  }: {
    template: string
    node: ASTNode
    context: string
    parser: Parser
    out: OutScript
    sourcemap: SourceMap
  }) {
    if (node.children.length) {
      for (const child of node.children) {
        await this.compileNode(template, child, context, parser, out, sourcemap)
      }
    }
    else {
      out.pushStr(template.slice(node.endIndex, node.nextSibling!.startIndex), {
        trimStart: node.stripAfter,
        trimEnd: node.nextSibling!.stripBefore,
      })
      parser.goto(node.nextSibling!)
    }
  }
}
