import type { ExpTokenType } from './types'

export const expTokenTypes: Record<string, ExpTokenType> = {
  'and': 'AND',
  'or': 'OR',
  'not': 'NOT',

  'is': 'IS',
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

  'true': 'LIT',
  'false': 'LIT',
  'null': 'LIT',
  'undefined': 'LIT',

  '|': 'PIPE',

  '=': 'SET',
  '(': 'LP',
  ')': 'RP',
  ',': 'COMMA',
  '.': 'DOT',
}
