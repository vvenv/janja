import type { Parser } from '../parser';
import { SetNode } from '../syntax-nodes';
import type { BinaryExp, DirectiveToken, ParserMap } from '../types';

function parseSet(token: DirectiveToken, parser: Parser) {
  if (!token.expression) {
    parser.emitExpErr(token);

    return;
  }

  parser.advance();

  return new SetNode(
    parser.parseExp(token.expression!) as BinaryExp<'ASSIGN'>,
    token.loc,
    token.strip,
  );
}

export const parsers: ParserMap = {
  set: parseSet,
};
