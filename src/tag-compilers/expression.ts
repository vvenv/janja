import type { TagCompiler } from '../types'
import { compiler } from '../exp'
import { FILTERS } from '../identifiers'

const EXPRESSION = '='

/**
 * @example {{= x | f }}
 * @example {{= 'a' if x else 'b' }}
 */
export const tag: TagCompiler = {
  names: [EXPRESSION],

  compile({ token: { value }, ctx: { context }, out }) {
    return out.pushVar(
      compiler.compile(value!, context, FILTERS),
    )
  },
}
