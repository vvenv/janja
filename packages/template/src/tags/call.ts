import type { ASTNode, Tag } from '../types'
import { parseActualArgs } from '../utils/parse-actual-args'

const CALL = 'call'
const END_CALL = 'end_call'

/**
 * @example {{ #call my_macro: "foo", "bar" }}...{{ /call }}
 */
export const tag: Tag = {
  names: [CALL],

  parse({ parser, base }) {
    if (base.isEnd) {
      const node = {
        ...base,
        name: END_CALL,
      }

      if (parser.startMatch(CALL, node)) {
        parser.end(node)
      }

      return
    }

    if (base.data) {
      parser.start({
        ...base,
        name: CALL,
      })

      return
    }

    return false
  },

  async compile({ template, node, context, out }, compileContent) {
    if (node.name === CALL) {
      const name = parseMacroName(node)
      const loc = out.pushLine(`await ${context}.${name}(async()=>{`)
      await compileContent({ template, node, context, out })
      return loc
    }

    if (node.name === END_CALL) {
      const args = parseMacroActualArgs(node.previousSibling!, context)
      return args.length
        ? out.pushLine(`},${args.join(',')});`)
        : out.pushLine(`});`)
    }
  },
}

function parseMacroName(tag: ASTNode) {
  const [, name] = tag.data!.match(/^([a-z$_][\w$]*)(?:: |\b)/)!

  return name
}

function parseMacroActualArgs(tag: ASTNode, context: string) {
  const [, args] = tag.data!.match(/^[a-z$_][\w$]*: (.+)$/) ?? []

  return args ? parseActualArgs(args, context) : []
}
