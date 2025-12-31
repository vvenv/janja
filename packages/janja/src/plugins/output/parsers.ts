import type { Parser } from '../../parser';
import type { DirectiveToken } from '../../types';
import { OutputNode } from './syntax';

function* parseOutput(token: DirectiveToken, parser: Parser) {
  yield 'NEXT';
  yield new OutputNode(parser.parseExp(token)!, token.loc, token.strip);
}

export const parsers = {
  output: parseOutput,
};
