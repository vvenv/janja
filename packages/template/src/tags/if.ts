import type { Tag } from '../types'
import { compiler } from '@jj/expression'
import { FILTERS } from '../identifiers'

const IF = 'if'
const ELIF = 'elif'
const ELSE = 'else'
const ENDIF = 'endif'

/**
 * @example {{ if my_var | my_filter }}yes{{ else }}no{{ endif }}
 */
export const tag: Tag = {
  names: [IF, ELIF, ELSE, ENDIF],

  async compile({ token: { name, value }, ctx, out }) {
    if (name === IF) {
      if (!value) {
        throw new Error('`if` tag must have expression')
      }

      ctx.expect(ENDIF)

      const { context } = ctx
      return out.pushLine(
        `if(${compiler.compile(value, context, FILTERS)}){`,
      )
    }

    if (name === ELIF) {
      if (!value) {
        throw new Error('"elif" tag must have expression')
      }

      if (!ctx.match(ENDIF)) {
        throw new Error('"elif" tag must follow "if" tag')
      }

      const { context } = ctx
      return out.pushLine(
        `}else if(${compiler.compile(value, context, FILTERS)}){`,
      )
    }

    if (name === ELSE) {
      if (!ctx.match(ENDIF)) {
        throw new Error('"else" tag must follow "if" tag')
      }

      return out.pushLine('}else{')
    }

    if (name === ENDIF) {
      if (!ctx.consume(ENDIF)) {
        throw new Error(`unexpected "${name}"`)
      }

      return out.pushLine('}')
    }
  },
}
