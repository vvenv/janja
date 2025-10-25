import type { BinaryExp, IdExp, TagCompiler } from '../types'
import { compiler } from '../exp'
import { CONTEXT, FILTERS } from '../identifiers'

const SET = 'set'
const ENDSET = 'endset'

/**
 * @example {{ set left = right }}
 * @example {{ set variable }} this is {{= my_value }} {{ endset }}
 */
export const tag: TagCompiler = {
  names: [SET, ENDSET],

  async compile({ token: { name, value }, ctx, out }) {
    if (name === SET) {
      if (!value) {
        throw new Error('`set` tag must have expression')
      }

      const { context } = ctx

      // inline assignment
      if ((value as BinaryExp).right) {
        return out.pushLine(compiler.compile(value, CONTEXT, FILTERS),
        )
      }

      ctx.expect(ENDSET)

      // block assignment
      return out.pushLine(
        `Object.assign(${context},{`,
        `${(value as IdExp).value}:await(async(s)=>{`,
      )
    }

    if (name === ENDSET) {
      if (!ctx.consume(ENDSET)) {
        throw new Error(`unexpected ${name}`)
      }

      return out.pushLine('return s;})("")});')
    }
  },
}
