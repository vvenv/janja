import type { Tag } from '../types'
import { FOR } from './for'

const BREAK = 'break'
const END_BREAK = 'end_break'

/**
 * @example {{ break }}
 */
export const tag: Tag = {
  names: [BREAK],

  parse({ parser, base }) {
    const node = {
      ...base,
      name: BREAK,
    }

    if (parser.startRecursiveMatch(FOR, node)) {
      parser.start(node)

      // Self closing
      parser.end({
        ...base,
        startIndex: base.endIndex,
        name: END_BREAK,
      })

      return
    }

    return false
  },

  compile({ node, out }) {
    if (node.name === BREAK) {
      return out.pushLine('break;')
    }
  },
}
