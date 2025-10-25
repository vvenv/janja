import type { StrExp, TagCompiler } from '../types'

const COMMENT = 'comment'
const ENDCOMMENT = 'endcomment'

/**
 * @example {{# This is a comment }}
 * @example {{ comment }} This is a comment {{ endcomment }}
 */
export const tag: TagCompiler = {
  names: [COMMENT, '#', ENDCOMMENT],

  async compile({ token: { name, value }, ctx, out }) {
    // inline comment
    if (name === '#') {
      if (!(value as StrExp).value || out.options.stripComments) {
        return
      }

      return out.pushStr(
        `<!--${(value as StrExp).value}-->`,
      )
    }

    // block comment
    if (name === COMMENT) {
      ctx.expect(ENDCOMMENT)

      return out.pushStr(
        `<!--`,
      )
    }

    if (name === ENDCOMMENT) {
      if (!ctx.consume(ENDCOMMENT)) {
        throw new Error(`unexpected "${ENDCOMMENT}"`)
      }

      return out.pushStr(
        `-->`,
      )
    }
  },
}
