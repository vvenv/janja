import type { Tag } from '../types'
import { parseFormalArgs } from '../utils/parse-formal-args'

const MACRO = 'macro'
const CALLER = 'caller'
const END_MACRO = 'endmacro'
const RE = /^([a-z$_][\w$]*)(?:: (.+))?$/

/**
 * @example {{ macro my_macro: x, y }}...{{ caller }}{{ endmacro }}{{ my_macro: "foo", 1 }}
 *                   ^^^^^^^^  ^^^^                                   ^^^^^^^^  ^^^^^^^^
 */
export const tag: Tag = {
  names: [...MACRO, ...CALLER, ...END_MACRO],

  async compile({ token: { name, value }, index, ctx, out, validator }) {
    if (name === MACRO) {
      if (!value) {
        throw new Error('assign tag must have a value')
      }

      const [, _name, _args = ''] = value.match(RE) ?? []

      if (!_name) {
        throw new Error('assign tag must have a valid name')
      }

      validator.expect(END_MACRO)

      const args = parseFormalArgs(_args)
      const bareArgs = args.map(arg => arg.replace(/(?<=[a-z$_][\w$]*)=.*$/, ''))
      const lines: string[] = []

      const { context } = ctx
      lines.push(`${context}.${_name}=async(${['_c', ...args].join(',')})=>{`)

      if (args.length) {
        lines.push(
          // swap args to align with the caller
          `[${[...bareArgs, '_c'].join(',')}]=[${['_c', ...bareArgs].join(',')}];`,
          `const ${ctx.affix(index)}={`,
          `...${context},`,
        )
        args.forEach((param: string) => {
          lines.push(`${param.replace(/(\w+)=.+/, '$1')},`)
        })
        lines.push('};')
      }

      return out.pushLine(...lines)
    }

    if (name === CALLER) {
      if (!validator.match(END_MACRO)) {
        throw new Error('caller tag must be inside a macro tag')
      }

      return out.pushLine('await _c?.();')
    }

    if (name === END_MACRO) {
      if (!validator.consume(END_MACRO)) {
        throw new Error(`unexpected ${name}`)
      }

      return out.pushLine('};')
    }
  },
}
