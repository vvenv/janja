import type { FilterMeta } from '../types'
import { FILTERS } from '../config'
import { addContext } from './add-context'
import { isLiteral } from './is-literal'
import { parseActualArgs } from './parse-actual-args'

/**
 * Returns the expression with filters applied
 */
export function compileExpression(
  value: string,
  context: string,
  filters?: FilterMeta[],
) {
  let identifier = isLiteral(value) ? value : addContext(value, context)

  if (filters?.length) {
    for (const { name, args } of filters) {
      const params = [
        context,
        identifier,
        ...(args ? parseActualArgs(args, context) : [context]),
      ]

      identifier = `await ${FILTERS}.${name}.call(${params.join(',')})`
    }
  }

  return identifier
}
