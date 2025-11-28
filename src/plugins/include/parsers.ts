import type { Parser } from '../../parser';
import type { DirectiveToken, LitExp } from '../../types';
import { IncludeNode } from './syntax';

async function* parseInclude(token: DirectiveToken, parser: Parser) {
  if (!token.expression) {
    parser.emitExpErr(token);

    return;
  }

  yield 'NEXT';
  yield new IncludeNode(
    parser.parseExp(token.expression!) as LitExp<string>,
    token.loc,
    token.strip,
  );
}

export const parsers = {
  include: parseInclude,
};
