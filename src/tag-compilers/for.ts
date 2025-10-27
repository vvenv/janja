import type { BinaryExp, IdExp, SeqExp, TagCompiler } from '../types'
import { compiler } from '../exp'
import { FILTERS } from '../identifiers'

const FOR = 'for'
const BREAK = 'break'
const CONTINUE = 'continue'
const ENDFOR = 'endfor'

/**
 * @example {{ for item in items }}{{= item }}{{ endfor }}
 * @example {{ for (x, y) in items }}{{= x }},{{= y }}{{ endfor }}
 */
export const tag: TagCompiler = {
  names: [FOR, BREAK, CONTINUE, ENDFOR],

  async compile({ token: { name, value }, ctx, out }) {
    if (name === FOR) {
      if (!value) {
        throw new Error(`"${FOR}" tag must have expression`)
      }

      ctx.expect(ENDFOR)

      const { context } = ctx
      const { type, elements } = (value as BinaryExp).left as SeqExp
      if (type === 'SEQ') {
        return out.pushLine(
          `{`,
          `for(${compiler.compile(value, context, FILTERS)}){`,
          `const ${ctx.in()}={`,
          `...${context},`,
          (elements as IdExp[]).map(({ value }) => value).join(','),
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
        throw new Error(`"${BREAK}" tag must inside a "${FOR}" loop`)
      }

      return out.pushLine(
        `break;`,
      )
    }

    if (name === CONTINUE) {
      if (!ctx.matchAny(ENDFOR)) {
        throw new Error(`"${CONTINUE}" tag must inside a "${FOR}" loop`)
      }

      return out.pushLine(
        `continue;`,
      )
    }

    if (name === ENDFOR) {
      if (!ctx.consume(ENDFOR)) {
        throw new Error(`unexpected "${ENDFOR}"`)
      }

      ctx.out()
      return out.pushLine(
        `}}`,
      )
    }
  },
}
