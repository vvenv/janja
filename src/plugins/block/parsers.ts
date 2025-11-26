import { CompileError } from '../../compile-error';
import { createUnexpected } from '../../create-unexpected';
import type { Parser } from '../../parser';
import type { DirectiveToken, IdExp } from '../../types';
import { BlockNode, SuperNode } from './syntax';

function parseBlock(token: DirectiveToken, parser: Parser) {
  if (!token.expression) {
    parser.emitExpErr(token);

    return;
  }

  parser.advance();

  const body = parser.parseUntil(['endblock']);

  if (parser.match(['endblock'])) {
    parser.advance();
  } else {
    throw parser.options.debug?.(
      new CompileError(`Unclosed "${token.name}"`, parser.template, token.loc),
    );
  }

  return new BlockNode(
    parser.parseExp(token.expression!) as IdExp,
    body,
    token.loc,
    token.strip,
  );
}

function parseSuper(token: DirectiveToken, parser: Parser) {
  if (token.expression) {
    parser.emitExpErr(token, false);

    return;
  }

  parser.advance();

  return new SuperNode(token.val, token.loc, token.strip);
}

export const parsers = {
  block: parseBlock,
  super: parseSuper,
  endblock: createUnexpected,
};
