export interface FilterMeta {
  name: string;
  args: string;
}

/**
 * Parse a filter with optional parameters.
 * @example replace a b
 *          ^^^^^^^ ^^^
 * @example replace a=b
 *          ^^^^^^^ ^^^
 */
export function parseFilter(filter: string): FilterMeta {
  const [, name, args] = filter.match(/^([\w$]+)(?:\s+(.+?))?$/)!;

  return {
    name,
    args,
  };
}
