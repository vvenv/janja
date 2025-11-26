import type { Parser } from '../../parser';
import type { BinaryExp, DirectiveToken } from '../../types';
import { SetNode } from './syntax';

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

export const parsers = {
  set: parseSet,
};
