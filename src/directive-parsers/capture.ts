import type { Parser } from '../parser'
import type { DirectiveToken, IdExp, ParserMap } from '../types'
import { CaptureNode } from '../ast'
import { CompileError } from '../compile-error'
import { parseUnexpected } from '../parse-unexpected'

function parseCapture(token: DirectiveToken, parser: Parser) {
  parser.requireExpression(token)

  const val = parser.parseExp(
    token.expression!,
  )

  parser.advance()
  const body = parser.parseUntil(['endcapture'])

  if (parser.match('endcapture')) {
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

  return new CaptureNode(val as IdExp, body, token.loc, token.strip)
}

export const parsers: ParserMap = {
  capture: parseCapture,
  endcapture: parseUnexpected,
}
