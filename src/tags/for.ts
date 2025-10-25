import type { BinaryExp, IdExp, SeqExp } from '../expression'
import type { Tag } from '../types'
import { compiler } from '../expression'
import { FILTERS } from '../identifiers'

const FOR = 'for'
const BREAK = 'break'
const CONTINUE = 'continue'
const ENDFOR = 'endfor'

/**
 * @example {{ for item in items }}{{= item }}{{ endfor }}
 * @example {{ for (x, y) in items }}{{= x }},{{= y }}{{ endfor }}
 */
export const tag: Tag = {
  names: [FOR, BREAK, CONTINUE, ENDFOR],

  async compile({ token: { name, value }, ctx, out }) {
    if (name === FOR) {
      if (!value) {
        throw new Error('"for" tag must have expression')
      }

      ctx.expect(ENDFOR)

      const { context } = ctx

      if ((value as BinaryExp).left.type === 'SEQ') {
        return out.pushLine(
          `{`,
          `for(${compiler.compile(value, context, FILTERS)}){`,
          `const ${ctx.in()}={`,
          `...${context},`,
          `${(((value as BinaryExp).left as SeqExp).elements as IdExp[]).map(({ value }) => value).join(',')}`,
          `};`,
        )
      }

      return out.pushLine(
        `{`,
        `for(${compiler.compile(value, context, FILTERS)}){`,
        `const ${ctx.in()}={`,
        `...${context},`,
        `${((value as BinaryExp).left as IdExp).value},`,
        `};`,
      )
    }

    if (name === BREAK) {
      if (!ctx.matchAny(ENDFOR)) {
        throw new Error('"break" tag must inside a "for" loop')
      }

      return out.pushLine('break;')
    }

    if (name === CONTINUE) {
      if (!ctx.matchAny(ENDFOR)) {
        throw new Error('"continue" tag must inside a "for" loop')
      }

      return out.pushLine('continue;')
    }

    if (name === ENDFOR) {
      if (!ctx.consume(ENDFOR)) {
        throw new Error(`unexpected ${name}`)
      }

      ctx.out()

      return out.pushLine(
        `}}`,
      )
    }
  },
}
