import type { Statement } from '../types'
import { compileExpression } from './compile-expression'

export function compileStatement(statements: Statement[] = [], context: string) {
  return statements
    .map(({ type, value, filters }) =>
      type === 'expression'
        ? compileExpression(value, context, filters)
        : value === 'in'
          ? ' in '
          : value,
    )
    .join('')
}
