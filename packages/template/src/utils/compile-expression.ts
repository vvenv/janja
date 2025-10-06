import type { FilterMeta } from '../types'
import { FILTERS } from '../identifiers'
import { addContext } from './add-context'
import { compileArgs } from './compile-args'
import { isLiteral } from './is-literal'

/**
 * Return the expression with filters applied
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
        ...(args ? compileArgs(args, context) : [context]),
      ]

      identifier = `await ${FILTERS}.${name}.call(${params.join(',')})`
    }
  }

  return identifier
}
