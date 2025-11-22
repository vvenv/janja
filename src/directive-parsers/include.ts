import type { Parser } from '../parser';
import { IncludeNode } from '../syntax-nodes';
import type { DirectiveToken, LitExp, ParserMap } from '../types';

function parseInclude(token: DirectiveToken, parser: Parser) {
  if (!token.expression) {
    parser.emitExpErr(token);

    return;
  }

  parser.advance();

  return new IncludeNode(
    parser.parseExp(token.expression!) as LitExp<string>,
    token.loc,
    token.strip,
  );
}

export const parsers: ParserMap = {
  include: parseInclude,
};
