import { compileExpression } from './compile-expression'
import { isLiteral } from './is-literal'

/**
 * Compile actual parameters.
 * @example {{ x | replace: a="b" }}
 *                          ^^^^^
 * @example {{ x | replace: a, "b" }}
 *                          ^^^^^^
 */
export function compileArgs(value: string, context: string) {
  const kvArgs: string[] = []
  const args: string[] = []

  let match

  const RE
    = /(?:, )?(?:([a-z$_][\w$]*)=)?(?:(['"`])((?:\\\2|(?!\2).)*?)\2|([^'"`,\s]+))/gi

  while ((match = RE.exec(value))) {
    const [, name, quote, literal, arg] = match

    if (!name) {
      args.push(
        quote
          ? `${quote}${literal}${quote}`
          : isLiteral(arg)
            ? arg
            : compileExpression(arg, context),
      )

      continue
    }

    kvArgs.push(kvArgs.length ? ',' : '{')
    kvArgs.push(
      `${name}:${
        quote
          ? `${quote}${literal}${quote}`
          : isLiteral(arg)
            ? arg
            : compileArgs(arg, context)
      }`,
    )
  }

  if (kvArgs.length) {
    kvArgs.push('}')

    return [kvArgs.join('')]
  }

  return args
}
