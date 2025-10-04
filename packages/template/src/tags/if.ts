import type { Tag } from '../types'
import { compileStatement } from '../utils/compile-statement'
import { parseStatement } from '../utils/parse-statement'

const IF = 'if'
const ELIF = 'elif'
const ELSE = 'else'
const ENDIF = 'endif'

/**
 * @example {{ if my_var | my_filter }}yes{{ else }}no{{ endif }}
 *             ^^^ ^^^^^^^^^^^^^^^^^         ^^^^        ^^^^^
 */
export const tag: Tag = {
  names: [IF, ELIF, ELSE, ENDIF],

  async compile({ token: { name, value }, ctx, out }) {
    if (name === IF) {
      if (!value) {
        throw new Error('if tag must have a value')
      }

      ctx.expect(ENDIF)

      const { context } = ctx
      return out.pushLine(
        `if(${compileStatement(parseStatement(value), context)}){`,
      )
    }

    if (name === ELIF) {
      if (!value) {
        throw new Error('elif tag must have a value')
      }

      if (!ctx.match(ENDIF)) {
        throw new Error('elif tag must follow if tag')
      }

      const { context } = ctx
      return out.pushLine(
        `}else if(${compileStatement(parseStatement(value!), context)}){`,
      )
    }

    if (name === ELSE) {
      if (!ctx.match(ENDIF)) {
        throw new Error('else tag must follow if tag')
      }

      return out.pushLine('}else{')
    }

    if (name === ENDIF) {
      if (!ctx.consume(ENDIF)) {
        throw new Error(`unexpected ${name}`)
      }

      return out.pushLine('}')
    }
  },
}
