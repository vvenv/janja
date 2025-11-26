import { CompileError } from '../../compile-error';
import { createUnexpected } from '../../create-unexpected';
import type { Parser } from '../../parser';
import type { DirectiveToken, IdExp } from '../../types';
import { CallNode } from './syntax';

function parseCall(token: DirectiveToken, parser: Parser) {
  if (!token.expression) {
    parser.emitExpErr(token);

    return;
  }

  parser.advance();

  const body = parser.parseUntil(['endcall']);

  if (parser.match(['endcall'])) {
    parser.advance();
  } else {
    throw parser.options.debug?.(
      new CompileError(`Unclosed "${token.name}"`, parser.template, token.loc),
    );
  }

  return new CallNode(
    parser.parseExp(token.expression) as IdExp,
    body,
    token.loc,
    token.strip,
  );
}

export const parsers = {
  call: parseCall,
  endcall: createUnexpected,
};
