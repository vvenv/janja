import type { Parser } from '../parser'
import type { BinaryExp, DirectiveToken, ParserMap } from '../types'
import { BreakNode, ContinueNode, ForNode } from '../ast'
import { CompileError } from '../compile-error'
import { parseUnexpected } from '../parse-unexpected'

function parseFor(token: DirectiveToken, parser: Parser) {
  parser.requireExpression(token)

  const loop = parser.parseExp(
    token.expression!,
  )

  parser.advance()
  const body = parser.parseUntil(['endfor'])

  if (parser.match('endfor')) {
    parser.advance()
  }
  else {
    throw parser.options.debug?.(
      new CompileError(
        `Unclosed "${token.name}"`,
        parser.template,
        token.loc,
      ),
    )
  }

  return new ForNode(
    loop as BinaryExp<'OF'>,
    body,
    token.loc,
    token.strip,
  )
}

function parseBreak(token: DirectiveToken, parser: Parser) {
  parser.requireNoExpression(token)

  parser.advance()
  return new BreakNode(token.val, token.loc, token.strip)
}

function parseContinue(token: DirectiveToken, parser: Parser) {
  parser.requireNoExpression(token)

  parser.advance()
  return new ContinueNode(token.val, token.loc, token.strip)
}

export const parsers: ParserMap = {
  for: parseFor,
  break: parseBreak,
  continue: parseContinue,
  endfor: parseUnexpected,
}
