import { FilterMeta, parseFilter } from './parse-filter';

/**
 * Parse an expression with optional filters.
 * @example parseExpression('x | replace "a" ","')
 *                           ^   ^^^^^^^^^^^^^^^
 */
export function parseExpression(template: string) {
  const [, value, rest] = template.match(/^(.+?)(\s\|\s.+)?$/ms)!;

  if (!rest) {
    return { value };
  }

  const filters: FilterMeta[] = [];
  const filterRe = /\s\|\s([^|]+?)(?=\s\||$)/g;

  let match;
  while ((match = filterRe.exec(rest))) {
    const [, filter] = match;
    filters.push(parseFilter(filter));
  }

  return {
    value,
    filters,
  };
}
