import { SetNode } from '../ast';
import type { Parser } from '../parser';
import type { BinaryExp, DirectiveToken, ParserMap } from '../types';

function parseSet(token: DirectiveToken, parser: Parser) {
  parser.requireExpression(token);

  const val = parser.parseExp(token.expression!);

  parser.advance();

  return new SetNode(val as BinaryExp<'SET'>, token.loc, token.strip);
}

export const parsers: ParserMap = {
  set: parseSet,
};
