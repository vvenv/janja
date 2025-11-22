import { IncludeNode } from '../ast';
import type { Parser } from '../parser';
import type { DirectiveToken, LitExp, ParserMap } from '../types';

function parseInclude(token: DirectiveToken, parser: Parser) {
  parser.requireExpression(token);

  const val = parser.parseExp(token.expression!);

  parser.advance();

  return new IncludeNode(val as LitExp<string>, token.loc, token.strip);
}

export const parsers: ParserMap = {
  include: parseInclude,
};
