import type { BinaryExp, IdExp, SeqExp, TagCompiler } from '../types'
import { compiler } from '../exp'
import { FILTERS } from '../identifiers'

const MACRO = 'macro'
const CALLER = 'caller'
const ENDMACRO = 'endmacro'

/**
 * @example {{ macro my_macro = (x, y) }}...{{ caller }}{{ endmacro }}{{ my_macro("foo", 1) }}
 */
export const tag: TagCompiler = {
  names: [MACRO, CALLER, ENDMACRO],

  async compile({ token: { name, value }, ctx, out }) {
    if (name === MACRO) {
      if (value?.type !== 'SET') {
        throw new Error(`"${name}" tag must have a "set" expression`)
      }

      ctx.expect(ENDMACRO)

      const { context } = ctx

      return out.pushLine(
        compiler.compile(value, context, FILTERS),
        `const ${ctx.in()}={`,
        `...${context},`,
        `${(((value as BinaryExp).right as SeqExp).elements).map(el => el.type === 'SET' ? `${(el.left as IdExp).value}` : (el as IdExp).value).join(',')}`,
        '};',
      )
    }

    if (name === CALLER) {
      if (!ctx.matchAny(ENDMACRO)) {
        throw new Error(`"${name}" tag must inside a "macro" tag`)
      }

      return out.pushLine('await _c?.();')
    }

    if (name === ENDMACRO) {
      if (!ctx.consume(ENDMACRO)) {
        throw new Error(`unexpected "${name}"`)
      }

      ctx.out()

      return out.pushLine('};')
    }
  },
}
