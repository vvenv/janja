import type { Statement } from '../types'
import { isLiteral } from './is-literal'
import { parseExpression } from './parse-expression'

export const operators = {
  'and': '&&',
  'or': '||',
  'eq': '===',
  'ne': '!==',
  'gt': '>',
  'ge': '>=',
  'lt': '<',
  'le': '<=',
  'in': 'in',
  '&&': '&&',
  '||': '||',
  '===': '===',
  '!==': '!==',
  '==': '===',
  '!=': '!==',
  '=': '=',
}

export function parseStatement(value: string): Statement[] {
  if (isLiteral(value)) {
    return [
      {
        type: 'expression',
        value,
      },
    ]
  }

  // First level operators
  const RE = / (and|or|eq|ne|gt|ge|lt|le|in|&&|\|\||===|!==|==|!=|=) /g

  const statements: Statement[] = []

  let cursor = 0
  let match: RegExpExecArray | null

  while ((match = RE.exec(value))) {
    statements.push({
      type: 'expression',
      ...parseExpression(value.slice(cursor, match.index)),
    })
    statements.push({
      type: 'operator',
      value: (operators as any)[match[1]],
    })
    cursor = RE.lastIndex
  }

  statements.push({
    type: 'expression',
    ...parseExpression(value.slice(cursor)),
  })

  return statements
}
