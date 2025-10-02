import type { Tag } from '../types'
import { parseActualArgs } from '../utils/parse-actual-args'

const CALL = ['call', '#call']
const END_CALL = ['end_call', 'endcall', '/call']
const RE = /^([a-z$_][\w$]*)(?:: (.+)|\b)/

/**
 * @example {{ #call my_macro: "foo", "bar" }}...{{ /call }}
 */
export const tag: Tag = {
  names: [...CALL, ...END_CALL],

  async compile({ token: { name, value }, ctx: { context }, out, validator }) {
    if (CALL.includes(name)) {
      if (!value) {
        throw new Error('call tag must have a value')
      }

      const [, _name, _args = ''] = value.match(RE) ?? []

      if (!_name) {
        throw new Error('call tag must have a valid name')
      }

      validator.expect(END_CALL)

      const args = parseActualArgs(_args, context)

      return out.pushLine(`await ${context}.${_name}(${[...args, 'async()=>{'].join(',')}`)
    }

    if (END_CALL.includes(name)) {
      if (!validator.consume(END_CALL)) {
        throw new Error(`unexpected ${name}`)
      }

      return out.pushLine('});')
    }
  },
}
