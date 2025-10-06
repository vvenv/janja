/**
 * Parse formal parameters.
 * @example `a, b="foo"`
 *           ^  ^^^^^^^
 */
export function parseArgs(statement: string) {
  const args: string[] = []

  const RE
    = /(?:, )?((?:[a-z$_][\w$]*=)?(['"`])(?:\\\2|(?!\2).)*?\2|[^'"`,\s]+)/gi

  let match
  while ((match = RE.exec(statement))) {
    const [, arg] = match
    args.push(arg)
  }

  return args
}
