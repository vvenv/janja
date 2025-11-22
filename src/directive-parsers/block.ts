import { BlockNode, SuperNode } from '../ast';
import { CompileError } from '../compile-error';
import { parseUnexpected } from '../parse-unexpected';
import type { Parser } from '../parser';
import type { DirectiveToken, IdExp, ParserMap } from '../types';

function parseBlock(token: DirectiveToken, parser: Parser) {
  parser.requireExpression(token);

  const val = parser.parseExp(token.expression!);

  parser.advance();

  const body = parser.parseUntil(['endblock']);

  if (parser.match(['endblock'])) {
    parser.advance();
  } else {
    throw parser.options.debug?.(
      new CompileError(`Unclosed "${token.name}"`, parser.template, token.loc),
    );
  }

  return new BlockNode(val as IdExp, body, token.loc, token.strip);
}

function parseSuper(token: DirectiveToken, parser: Parser) {
  parser.requireNoExpression(token);

  parser.advance();

  return new SuperNode(token.val, token.loc, token.strip);
}

export const parsers: ParserMap = {
  block: parseBlock,
  super: parseSuper,
  endblock: parseUnexpected,
};
