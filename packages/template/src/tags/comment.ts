import type { Tag } from '../types'

const COMMENT = ['comment', '#comment', '!']
const END_COMMENT = ['end_comment', 'endcomment', '/comment']

/**
 * @example {{! This is a comment }}
 * @example {{ #comment }} This is a comment {{ /comment }}
 */
export const tag: Tag = {
  names: [...COMMENT, ...END_COMMENT],

  async compile({ token: { name, value }, out, validator }) {
    if (COMMENT.includes(name)) {
      // inline comment
      if (value) {
        if (out.options.stripComments) {
          return
        }

        return out.pushStr(`<!--${value}-->`)
      }

      // block comment
      validator.expect(END_COMMENT)

      if (out.options.stripComments) {
        return
      }

      return out.pushStr('<!--')
    }

    if (END_COMMENT.includes(name)) {
      if (!validator.consume(END_COMMENT)) {
        throw new Error(`unexpected ${name}`)
      }

      if (out.options.stripComments) {
        return
      }

      return out.pushStr('-->')
    }
  },
}
