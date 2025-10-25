import type { Tag } from '../types'
import { compiler } from '../expression'
import { FILTERS } from '../identifiers'

const EXPRESSION = '='

/**
 * @example {{= x | f }}
 * @example {{= 'a' if x else 'b' }}
 */
export const tag: Tag = {
  names: [EXPRESSION],

  compile({ token: { value }, ctx: { context }, out }) {
    return out.pushVar(
      compiler.compile(value!, context, FILTERS),
    )
  },
}
