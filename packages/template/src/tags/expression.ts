import type { Tag } from '../types'
import { compileStatement } from '../utils/compile-statement'
import { hasKeyword } from '../utils/has-keyword'
import { isEvil } from '../utils/is-evil'
import { parseStatement } from '../utils/parse-statement'

const EXPRESSION = 'expression'
const END_EXPRESSION = 'end_expression'

/**
 * @example {{ x | f }}
 * @example {{ 'a' if x else 'b' }}
 */
export const tag: Tag = {
  names: ['='],

  parse({ parser, base }) {
    if (verifyExpression(base.data!)) {
      parser.start({
        ...base,
        name: EXPRESSION,
      })

      // Self closing
      parser.end({
        ...base,
        startIndex: base.endIndex,
        name: END_EXPRESSION,
      })

      return
    }

    return false
  },

  compile({ node, context, out }) {
    if (node.name === EXPRESSION) {
      const [, a, cond, b]
        = node.data!.match(/^(.+?) if (.+?)(?: else (.+))?$/)
          ?? []
      if (cond) {
        return out.pushVar(
          `${compileStatement(parseStatement(cond), context)} ? ${compileStatement(parseStatement(a), context)} : ${b ? compileStatement(parseStatement(b), context) : '""'}`,
        )
      }
      const [statement0] = parseStatement(node.data!)
      return out.pushVar(
        compileStatement(
          [
            {
              ...statement0,
              value: out.unescapeTag(statement0.value),
            },
          ],
          context,
        ),
      )
    }
  },
}

function verifyExpression(content: string) {
  return !isEvil(content) && !hasKeyword(content)
}
