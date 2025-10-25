import type { TagCompiler } from '../types'

const STR = 'str'

/**
 * @example hello world
 */
export const tag: TagCompiler = {
  names: [STR],

  async compile({ token: { raw, previous, next }, out }) {
    return out.pushStr(raw, {
      trimStart: previous?.stripAfter,
      trimEnd: next?.stripBefore,
    })
  },
}
