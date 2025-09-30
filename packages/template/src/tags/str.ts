import type { Tag } from '../types'

const STR = 'str'

/**
 * @example hello world
 *          ^^^^^^^^^^^
 */
export const tag: Tag = {
  names: [STR],

  async compile({ token: { value, previous, next }, out }) {
    let v = value ?? ''

    if (previous?.stripAfter) {
      v = v.trimStart()
    }

    if (next?.stripBefore) {
      v = v.trimEnd()
    }

    return out.pushStr(v)
  },
}
