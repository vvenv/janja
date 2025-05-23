import type { Tag } from '../types'

const WITH = 'with'
const END_WITH = 'end_with'

/**
 * @example {{ #with obj }}{{= key1 }}{{= key2 }}{{ /with }}
 */
export const tag: Tag = {
  names: [WITH],

  parse({ parser, base }) {
    if (base.isEnd) {
      const node = {
        ...base,
        name: END_WITH,
      }

      if (parser.checkStartNode(WITH, node)) {
        parser.end(node)
        return
      }

      return false
    }

    if (base.data) {
      parser.start({
        ...base,
        name: WITH,
      })

      return
    }

    return false
  },

  async compile({ template, node, context, out }, compileContent) {
    if (node.name === WITH) {
      const { level, index } = node.ast
      const affix = `${level.toString(32)}_${index.toString(32)}`
      const _context = `${context}_${affix}`
      const loc = out.pushLine(
        `const ${_context}={`,
        `...${context},`,
        `...${context}.${node.data}`,
        `};`,
      )
      await compileContent({
        template,
        node,
        context: _context,
        out,
      })
      return loc
    }
  },
}
