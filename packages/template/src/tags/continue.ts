import type { Tag } from '../types'
import { FOR } from './for'

const CONTINUE = 'continue'
const END_CONTINUE = 'end_continue'

/**
 * @example {{ continue }}
 */
export const tag: Tag = {
  names: [CONTINUE],

  parse({ parser, base }) {
    const node = {
      ...base,
      name: CONTINUE,
    }

    if (parser.checkAncestorStartNode(FOR, node)) {
      parser.start(node)

      // Self closing
      parser.end({
        ...base,
        startIndex: base.endIndex,
        name: END_CONTINUE,
      })

      return
    }

    return false
  },

  compile({ node, out }) {
    if (node.name === CONTINUE) {
      return out.pushLine('continue;')
    }
  },
}
