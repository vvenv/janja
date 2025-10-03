import type { Tag } from '../types'
import { compileStatement } from '../utils/compile-statement'
import { parseStatement } from '../utils/parse-statement'

const ASSIGN = 'assign'
const END_ASSIGN = 'endassign'
const RE
  = /^(?:([a-z$_][\w$]*)|([a-z$_][\w$]*(?:, [a-z$_][\w$]*)*) = ((['"`])(?:\\\4|(?!\4).)*\4|[^=]+))$/i

/**
 * @example {{ assign left = right }}
 * @example {{ assign left_1, left_2 = right }}
 * @example {{ assign variable }} this is {{= my_value }} {{ endassign }}
 */
export const tag: Tag = {
  names: [ASSIGN, END_ASSIGN],

  async compile({ token: { name, value }, ctx, out }) {
    if (name === ASSIGN) {
      if (!value) {
        throw new Error('assign tag must have a value')
      }

      const [, variable, left = variable, right] = value.match(RE) ?? []

      if (!left) {
        throw new Error('assign tag must have a variable')
      }

      const { context } = ctx

      const names = left.split(/, +/)

      // inline assignment
      if (right) {
        const lines: string[] = []

        lines.push(`Object.assign(${context},{`)

        const v = compileStatement(parseStatement(right), context)

        if (names.length > 1) {
          names.forEach((n, index) => {
            lines.push(`${index > 0 ? ',' : ''}${n}:${v}.${n}`)
          })
        }
        else {
          lines.push(`${left}:${v}`)
        }

        lines.push('});')

        return out.pushLine(...lines)
      }

      ctx.expect(END_ASSIGN)

      // block assignment
      return out.pushLine(
        `Object.assign(${context},{`,
        `${left}:await(async(s)=>{`,
      )
    }

    if (name === END_ASSIGN) {
      if (!ctx.consume(END_ASSIGN)) {
        throw new Error(`unexpected ${name}`)
      }

      return out.pushLine('return s;})("")});')
    }
  },
}
