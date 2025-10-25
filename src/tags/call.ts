import type { Tag } from '../types'
import { compiler } from '../expression'
import { FILTERS } from '../identifiers'

const CALL = 'call'
const ENDCALL = 'endcall'

/**
 * @example {{ call my_macro(x, "a", 1) }}...{{ endcall }}
 */
export const tag: Tag = {
  names: [CALL, ENDCALL],

  async compile({ token: { name, value }, ctx, out }) {
    if (name === CALL) {
      if (value?.type !== 'ID') {
        throw new Error(`"${name}" tag must have a valid name`)
      }

      ctx.expect(ENDCALL)

      const { context } = ctx

      return out.pushLine(`await ${compiler.compile(value, context, FILTERS)}(async()=>{`)
    }

    if (name === ENDCALL) {
      if (!ctx.consume(ENDCALL)) {
        throw new Error(`unexpected "${name}"`)
      }

      return out.pushLine('});')
    }
  },
}
