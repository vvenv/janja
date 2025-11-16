import type { Parser } from '../parser'
import type { DirectiveToken, IdExp, ParserMap } from '../types'
import { CallNode } from '../ast'
import { CompileError } from '../compile-error'
import { parseUnexpected } from '../parse-unexpected'

function parseCall(token: DirectiveToken, parser: Parser) {
  parser.requireExpression(token)

  const val = parser.parseExp(
    token.expression!,
  )

  parser.advance()
  const body = parser.parseUntil(['endcall'])

  if (parser.match('endcall')) {
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

  return new CallNode(val as IdExp, body, token.loc, token.strip)
}

export const parsers: ParserMap = {
  call: parseCall,
  endcall: parseUnexpected,
}
