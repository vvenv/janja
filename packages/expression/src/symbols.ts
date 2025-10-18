import type { TokenType } from './types'

export const symbols: Record<string, TokenType> = {
  'and': 'AND',
  'or': 'OR',
  'not': 'NOT',

  'eq': 'EQ',
  'ne': 'NE',
  'gt': 'GT',
  'lt': 'LT',
  'ge': 'GE',
  'le': 'LE',
  'in': 'IN',
  'ni': 'NI',
  'of': 'OF',

  '+': 'ADD',
  '-': 'SUB',
  '*': 'MUL',
  '/': 'DIV',
  '%': 'MOD',

  'if': 'IF',
  'else': 'ELSE',

  'true': 'BOOL',
  'false': 'BOOL',

  '|': 'PIPE',

  '=': 'SET',
  '(': 'LP',
  ')': 'RP',
  ',': 'COMMA',
}
