import type { Tag } from '../types'

const STR = 'str'

/**
 * @example hello world
 *          ^^^^^^^^^^^
 */
export const tag: Tag = {
  names: [STR],

  async compile({ token: { value, previous, next }, out }) {
    return out.pushStr(value ?? '', {
      trimStart: previous?.stripAfter,
      trimEnd: next?.stripBefore,
    })
  },
}
