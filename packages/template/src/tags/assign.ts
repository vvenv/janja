import type { Tag } from '../types'
import { compileStatement } from '../utils/compile-statement'
import { parseStatement } from '../utils/parse-statement'

const ASSIGN = 'assign'
const END_ASSIGN = 'end_assign'
const RE
  = /^(?:([a-z$_][\w$]*)|([a-z$_][\w$]*(?:, [a-z$_][\w$]*)*) = ((['"`])(?:\\\4|(?!\4).)*\4|[^=]+))$/i

/**
 * @example {{ assign my_variable = my_value }}
 * @example {{ assign my_variable1, my_variable2 = my_value }}
 * @example {{ #assign my_variable }} this is {{= my_value }} {{ /assign }}
 */
export const tag: Tag = {
  names: [ASSIGN],

  parse({ parser, base }) {
    if (base.isEnd) {
      const node = {
        ...base,
        name: END_ASSIGN,
      }

      if (parser.startMatch(ASSIGN, node)) {
        parser.end(node)
      }

      return
    }

    if (base.data) {
      const [, variable, left, right] = base.data.match(RE) ?? []

      if (base.isStart) {
        if (!variable) {
          parser.throwError(`invalid tag data`, [base])

          return false
        }

        parser.start({
          ...base,
          name: ASSIGN,
          data: {
            left: variable,
          },
        })

        return
      }

      if (!left || !right) {
        parser.throwError(`invalid tag data`, [base])

        return false
      }

      parser.start({
        ...base,
        name: ASSIGN,
        data: {
          left,
          right,
        },
      })

      // Self closing
      parser.end({
        ...base,
        startIndex: base.endIndex,
        name: END_ASSIGN,
      })

      return
    }

    return false
  },

  async compile({ template, node, context, out }, compileContent) {
    if (node.name === ASSIGN) {
      const { data: { left, right } } = node
      const names = (left as string).split(/, +/)
      if (right) {
        const lines: string[] = []
        lines.push(`Object.assign(${context},{`)
        const value = compileStatement(parseStatement(right), context)
        if (names.length > 1) {
          names.forEach((key, index) => {
            lines.push(`${index > 0 ? ',' : ''}${key}:${value}.${key}`)
          })
        }
        else {
          lines.push(`${left}:${value}`)
        }

        lines.push(`});`)
        return out.pushLine(...lines)
      }

      const loc = out.pushLine(
        `Object.assign(${context},{`,
        `${left}:await(async(s)=>{`,
      )
      await compileContent({
        template,
        node,
        context,
        out,
      })
      out.pushLine(`return s;})("")});`)
      return loc
    }
  },
}
