import type { Parser } from '../../parser';
import type { DirectiveToken } from '../../types';
import { SetNode } from './syntax';

function* parseSet(token: DirectiveToken, parser: Parser) {
  if (!token.expression) {
    parser.emitExpErr(token);

    return;
  }

  yield 'NEXT';
  yield new SetNode(parser.parseExp(token.expression)!, token.loc, token.strip);
}

export const parsers = {
  set: parseSet,
};
