import type { Tag } from '../types'
import { compileStatement } from '../utils/compile-statement'
import { hasKeyword } from '../utils/has-keyword'
import { isEvil } from '../utils/is-evil'
import { parseStatement } from '../utils/parse-statement'
import { unescapeTag } from '../utils/unescape-tag'

const EXPRESSION = '='

/**
 * @example {{= x | f }}
 * @example {{= 'a' if x else 'b' }}
 */
export const tag: Tag = {
  names: [EXPRESSION],

  compile({ token: { name, value }, ctx: { context }, out }) {
    if (name === EXPRESSION) {
      if (!verifyExpression(value!)) {
        throw new Error(`invalid expression: ${value}`)
      }

      const [, a, cond, b]
        = value!.match(/^(.+?) if (.+?)(?: else (.+))?$/)
          ?? []

      if (cond) {
        return out.pushVar(
          `${compileStatement(parseStatement(cond), context)} ? ${compileStatement(parseStatement(a), context)} : ${b ? compileStatement(parseStatement(b), context) : '""'}`,
        )
      }

      const [statement] = parseStatement(value!)

      return out.pushVar(
        compileStatement(
          [
            {
              ...statement,
              value: unescapeTag(statement.value),
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
