import type { Tag } from '../types'

const COMMENT = 'comment'
const END_COMMENT = 'endcomment'

/**
 * @example {{# This is a comment }}
 * @example {{ comment }} This is a comment {{ endcomment }}
 */
export const tag: Tag = {
  names: [COMMENT, '#', END_COMMENT],

  async compile({ token: { name, value }, ctx, out }) {
    // inline comment
    if (name === '#') {
      if (!value || out.options.stripComments) {
        return
      }

      return out.pushStr(`<!--${value}-->`)
    }

    // block comment
    if (name === COMMENT) {
      ctx.expect(END_COMMENT)

      return out.pushStr('<!--')
    }

    if (name === END_COMMENT) {
      if (!ctx.consume(END_COMMENT)) {
        throw new Error(`unexpected ${name}`)
      }

      return out.pushStr('-->')
    }
  },
}
