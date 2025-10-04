import type { Tag } from '../types'
import { parseActualArgs } from '../utils/parse-actual-args'

const CALL = 'call'
const ENDCALL = 'endcall'
const RE = /^([a-z$_][\w$]*)(?:: (.+)|\b)/

/**
 * @example {{ call my_macro: "foo", "bar" }}...{{ endcall }}
 */
export const tag: Tag = {
  names: [CALL, ENDCALL],

  async compile({ token: { name, value }, ctx, out }) {
    if (name === CALL) {
      if (!value) {
        throw new Error('call tag must have a value')
      }

      const [, _name, _args = ''] = value.match(RE) ?? []

      if (!_name) {
        throw new Error('call tag must have a valid name')
      }

      const { context } = ctx
      ctx.expect(ENDCALL)

      const args = parseActualArgs(_args, context)

      return out.pushLine(`await ${context}.${_name}?.(${[...args, 'async()=>{'].join(',')}`)
    }

    if (name === ENDCALL) {
      if (!ctx.consume(ENDCALL)) {
        throw new Error(`unexpected ${name}`)
      }

      return out.pushLine('});')
    }
  },
}
