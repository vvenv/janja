import type { Tag } from '../types'
import { compileStatement } from '../utils/compile-statement'
import { parseStatement } from '../utils/parse-statement'

const ASSIGN = ['assign', '#assign']
const END_ASSIGN = ['end_assign', 'endassign', '/assign']
const RE
  = /^(?:([a-z$_][\w$]*)|([a-z$_][\w$]*(?:, [a-z$_][\w$]*)*) = ((['"`])(?:\\\4|(?!\4).)*\4|[^=]+))$/i

/**
 * @example {{ assign left = right }}
 * @example {{ assign left_1, left_2 = right }}
 * @example {{ #assign variable }} this is {{= my_value }} {{ /assign }}
 */
export const tag: Tag = {
  names: [...ASSIGN, ...END_ASSIGN],

  async compile({ token: { name, value }, ctx: { context }, out, validator }) {
    if (ASSIGN.includes(name)) {
      if (!value) {
        throw new Error('assign tag must have a value')
      }

      const [, variable, left = variable, right] = value.match(RE) ?? []

      if (!left) {
        throw new Error('assign tag must have a variable')
      }

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

      validator.expect(END_ASSIGN)

      // block assignment
      return out.pushLine(
        `Object.assign(${context},{`,
        `${left}:await(async(s)=>{`,
      )
    }

    if (END_ASSIGN.includes(name)) {
      if (!validator.consume(END_ASSIGN)) {
        throw new Error(`Unexpected ${name}`)
      }

      return out.pushLine('return s;})("")});')
    }
  },
}
