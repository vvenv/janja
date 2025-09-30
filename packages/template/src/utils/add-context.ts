import { isLiteral } from './is-literal'

/**
 * Find non-literal strings and add context to them
 */
export function addContext(value: string, context: string) {
  function _addContext(str: string) {
    return str
      .replace(
        /\bnot /g,
        '!',
      )
      .replace(
        /[a-z$_][\w$]*(?:\.[a-z$_][\w$]*)*/gi,
        $0 => isLiteral($0) ? $0 : `${context}.${$0}`,
      )
  }

  const re = /(['"`])(?:\\\1|(?!\1).)*?\1/g

  let ret = ''
  let cursor = 0
  let match: RegExpExecArray | null

  while ((match = re.exec(value))) {
    // before string literal
    ret += _addContext(value.slice(cursor, match.index))
    // string literal with quotes
    ret += match[0]
    cursor = re.lastIndex
  }

  // after last string literal
  return ret + _addContext(value.slice(cursor))
}
