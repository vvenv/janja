import type { Parser } from '../../parser';
import type { DirectiveToken } from '../../types';
import { OutputNode } from './syntax';

function parseOutput(token: DirectiveToken, parser: Parser) {
  parser.advance();

  return new OutputNode(
    token.val,
    token.loc,
    token.strip,
    parser.parseExp(token),
  );
}

export const parsers = {
  output: parseOutput,
};
