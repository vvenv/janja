import { isNumber } from './is-number'
import { isString } from './is-string'

/**
 * Check if a value is a literal.
 * limited to string, number, boolean, null, and undefined.
 */
export function isLiteral(value: string) {
  return (
    value === 'true'
    || value === 'false'
    || value === 'null'
    || value === 'undefined'
    || isString(value)
    || isNumber(value)
  )
}
