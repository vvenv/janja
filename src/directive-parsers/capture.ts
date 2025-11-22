import { CompileError } from '../compile-error';
import { createUnexpected } from '../create-unexpected';
import type { Parser } from '../parser';
import { CaptureNode } from '../syntax-nodes';
import type { DirectiveToken, IdExp, ParserMap } from '../types';

function parseCapture(token: DirectiveToken, parser: Parser) {
  if (!token.expression) {
    parser.emitExpErr(token);

    return;
  }

  parser.advance();

  const body = parser.parseUntil(['endcapture']);

  if (parser.match(['endcapture'])) {
    parser.advance();
  } else {
    throw parser.options.debug?.(
      new CompileError(`Unclosed "${token.name}"`, parser.template, token.loc),
    );
  }

  return new CaptureNode(
    parser.parseExp(token.expression!) as IdExp,
    body,
    token.loc,
    token.strip,
  );
}

export const parsers: ParserMap = {
  capture: parseCapture,
  endcapture: createUnexpected,
};
