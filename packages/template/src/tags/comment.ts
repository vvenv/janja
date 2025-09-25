import type { Tag } from '../types'

export const COMMENT = 'comment'
const END_COMMENT = 'end_comment'

/**
 * @example {{! This is a comment }}
 * @example {{ #comment }} This is a comment {{ /comment }}
 */
export const tag: Tag = {
  names: [COMMENT],

  parse({ parser, base }) {
    if (base.isEnd) {
      const node = {
        ...base,
        name: END_COMMENT,
      }

      if (parser.startMatch(COMMENT, node)) {
        parser.end(node)
      }

      return
    }

    // Inline comment
    if (base.data) {
      parser.start({
        ...base,
        name: COMMENT,
      })

      // Self closing
      parser.end({
        ...base,
        startIndex: base.endIndex,
        name: END_COMMENT,
      })

      return
    }

    parser.start({
      ...base,
      name: COMMENT,
    })
  },

  async compile({ template, node, context, parser, out }, compileContent) {
    if (node.name === COMMENT) {
      if (out.options.stripComments) {
        parser.goto(node.nextSibling!)
      }
      else {
        out.pushStr(`<!--`)
        if (node.data) {
          out.pushStr(node.data)
        }
        else {
          await compileContent({
            template,
            node,
            context,
            out,
          })
        }
      }

      return
    }

    if (node.name === END_COMMENT) {
      if (!out.options.stripComments) {
        out.pushStr('-->')
      }
    }
  },
}
