import type { Tag } from '../types'
import { parseFormalArgs } from '../utils/parse-formal-args'

const MACRO = 'macro'
const CALLER = 'caller'
const ENDMACRO = 'endmacro'
const RE = /^([a-z$_][\w$]*)(?:: (.+))?$/

/**
 * @example {{ macro my_macro: x, y }}...{{ caller }}{{ endmacro }}{{ my_macro: "foo", 1 }}
 *                   ^^^^^^^^  ^^^^                                   ^^^^^^^^  ^^^^^^^^
 */
export const tag: Tag = {
  names: [MACRO, CALLER, ENDMACRO],

  async compile({ token: { name, value }, ctx, out }) {
    if (name === MACRO) {
      if (!value) {
        throw new Error('assign tag must have a value')
      }

      const [, _name, _args = ''] = value.match(RE) ?? []

      if (!_name) {
        throw new Error('assign tag must have a valid name')
      }

      ctx.expect(ENDMACRO)

      const args = parseFormalArgs(_args)
      const bareArgs = args.map(arg => arg.replace(/(?<=[a-z$_][\w$]*)=.*$/, ''))
      const lines: string[] = []

      const { context } = ctx
      lines.push(`${context}.${_name}=async(${['_c', ...args].join(',')})=>{`)

      if (args.length) {
        lines.push(
          // swap args to align with the caller
          `[${[...bareArgs, '_c'].join(',')}]=[${['_c', ...bareArgs].join(',')}];`,
          `const ${ctx.in()}={`,
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
      if (!ctx.match(ENDMACRO)) {
        throw new Error('caller tag must be inside a macro tag')
      }

      return out.pushLine('await _c?.();')
    }

    if (name === ENDMACRO) {
      if (!ctx.consume(ENDMACRO)) {
        throw new Error(`unexpected ${name}`)
      }

      return out.pushLine('};')
    }
  },
}
