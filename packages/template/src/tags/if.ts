import type { Tag } from '../types'
import { compileStatement } from '../utils/compile-statement'
import { parseStatement } from '../utils/parse-statement'

const IF = ['if', '#if']
const ELIF = ['elif']
const ELSE = ['else']
const END_IF = ['end_if', 'endif', '/if']

/**
 * @example {{ #if my_var | my_filter }}yes{{ else }}no{{ /if }}
 *             ^^^ ^^^^^^^^^^^^^^^^^^         ^^^^        ^^^
 */
export const tag: Tag = {
  names: [...IF, ...ELIF, ...ELSE, ...END_IF],

  async compile({ token: { name, value }, ctx: { context }, out, validator }) {
    if (IF.includes(name)) {
      if (!value) {
        throw new Error('if tag must have a value')
      }

      validator.expect(END_IF)

      return out.pushLine(
        `if(${compileStatement(parseStatement(value), context)}){`,
      )
    }

    if (ELIF.includes(name)) {
      if (!value) {
        throw new Error('elif tag must have a value')
      }

      if (!validator.match(END_IF)) {
        throw new Error('elif tag must follow if tag')
      }

      return out.pushLine(
        `}else if(${compileStatement(parseStatement(value!), context)}){`,
      )
    }

    if (ELSE.includes(name)) {
      if (!validator.match(END_IF)) {
        throw new Error('else tag must follow if tag')
      }

      return out.pushLine('}else{')
    }

    if (END_IF.includes(name)) {
      if (!validator.consume(END_IF)) {
        throw new Error(`Unexpected ${name}`)
      }

      return out.pushLine('}')
    }
  },
}
