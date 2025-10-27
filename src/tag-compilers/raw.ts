import type { TagCompiler } from '../types'

const RAW = 'raw'

/**
 * @example hello world
 */
export const tag: TagCompiler = {
  names: [RAW],

  async compile({ tag: { raw, previous, next }, out }) {
    return out.pushStr(
      raw,
      {
        trimStart: previous?.stripAfter,
        trimEnd: next?.stripBefore,
      },
    )
  },
}
