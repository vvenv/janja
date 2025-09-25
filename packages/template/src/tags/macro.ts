import type { Tag } from '../types'
import { parseFormalArgs } from '../utils/parse-formal-args'

const MACRO = 'macro'
const END_MACRO = 'end_macro'
const CALLER = 'caller'
const END_CALLER = 'end_caller'
const RE = /^([a-z$_][\w$]*)(?:: (.+))?$/

/**
 * @example {{ #macro my_macro: x, y }}...{{ caller }}{{ /macro }}{{ my_macro: "foo", 1 }}
 *                    ^^^^^^^^  ^^^^                                 ^^^^^^^^  ^^^^^^^^
 */
export const tag: Tag = {
  names: [MACRO, CALLER],

  parse({ parser, base }) {
    if (base.identifier === MACRO) {
      if (base.isEnd) {
        const node = {
          ...base,
          name: END_MACRO,
        }

        if (parser.startMatch(MACRO, node)) {
          parser.end(node)
        }

        return
      }

      if (base.data) {
        const [, name, args] = base.data.match(RE) ?? []

        if (name) {
          parser.start({
            ...base,
            name: MACRO,
            data: {
              name,
              args: args ? parseFormalArgs(args) : [],
            },
          })
        }

        return
      }
    }

    if (base.identifier === CALLER) {
      const node = {
        ...base,
        name: CALLER,
      }

      if (parser.startMatch(MACRO, node)) {
        parser.start(node)

        // Self closing
        parser.end({
          ...base,
          startIndex: base.endIndex,
          name: END_CALLER,
        })
      }

      return
    }

    return false
  },

  async compile({ template, node, context, out }, compileContent) {
    if (node.name === MACRO) {
      const { level, index } = node.tag
      const affix = `${level.toString(32)}_${index.toString(32)}`
      const { data: { name, args } } = node
      const lines: string[] = []
      lines.push(`${context}.${name}=async(${['_c', ...args].join(',')})=>{`)
      let _context = context
      if (args.length) {
        _context = `${context}_${affix}`
        lines.push(`const ${_context}={`, `...${context},`)
        args.forEach((param: string) => {
          lines.push(`${param.replace(/(\w+)=.+/, '$1')},`)
        })
        lines.push(`};`)
      }
      const loc = out.pushLine(...lines)
      await compileContent({
        template,
        node,
        context: _context,
        out,
      })
      return loc
    }

    if (node.name === CALLER) {
      const loc = out.pushLine(`await _c?.();`)
      await compileContent({ template, node, context, out })
      return loc
    }

    if (node.name === END_MACRO) {
      out.pushLine('};')
    }
  },
}
