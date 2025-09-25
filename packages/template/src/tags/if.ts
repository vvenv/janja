import type { Tag } from '../types'
import { compileStatement } from '../utils/compile-statement'
import { parseStatement } from '../utils/parse-statement'

const IF = 'if'
const ELIF = 'elif'
const ELSE = 'else'
const END_IF = 'end_if'

/**
 * @example {{ #if my_var | my_filter }}yes{{ else }}no{{ /if }}
 *             ^^^ ^^^^^^^^^^^^^^^^^^         ^^^^        ^^^
 */
export const tag: Tag = {
  names: [IF, ELIF, ELSE],

  parse({ parser, base }) {
    if (base.isEnd) {
      const node = {
        ...base,
        name: END_IF,
      }

      if (parser.startMatch(IF, node)) {
        parser.end(node)
      }

      return
    }

    if (base.identifier === ELSE) {
      const node = {
        ...base,
        name: ELSE,
      }

      if (parser.startOptionalMatch(IF, node)) {
        parser.between(node)
        return
      }
    }

    if (base.identifier === ELIF) {
      if (base.data) {
        const node = {
          ...base,
          name: ELIF,
        }

        if (parser.startMatch(IF, node)) {
          parser.between(node)
        }

        return
      }
    }

    if (base.identifier === IF) {
      if (base.data) {
        parser.start({
          ...base,
          name: IF,
        })

        return
      }
    }

    return false
  },

  async compile({ template, node, context, out }, compileContent) {
    if (node.name === IF) {
      const loc = out.pushLine(
        `if(${compileStatement(parseStatement(node.data!), context)}){`,
      )
      await compileContent({ template, node, context, out })
      return loc
    }

    if (node.name === ELIF) {
      const loc = out.pushLine(
        `}else if(${compileStatement(parseStatement(node.data!), context)}){`,
      )
      await compileContent({ template, node, context, out })
      return loc
    }

    if (node.name === ELSE) {
      // checking is required here because of ELSE can be used for FOR tag too
      if (
        node.previousSibling?.name === IF
        || node.previousSibling?.name === ELIF
      ) {
        const loc = out.pushLine('}else{')
        await compileContent({ template, node, context, out })
        return loc
      }

      return false
    }

    if (node.name === END_IF) {
      out.pushLine('}')
    }
  },
}
