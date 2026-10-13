import type { Parser } from '../../parser';
import type { DirectiveToken } from '../../types';
import { updatePosition } from '../../update-position';
import { OutputNode } from './syntax';

function* parseOutput(token: DirectiveToken, parser: Parser) {
  yield 'NEXT';

  // The expression starts after the opening marker, not at the token start
  const start = updatePosition(
    `${parser.options.outputOpen}${token.strip.before ? '-' : ''}`,
    { ...token.loc.start },
  );

  yield new OutputNode(
    parser.parseExp({ val: token.val, loc: { start, end: token.loc.end } })!,
    token.loc,
    token.strip,
  );
}

export const parsers = {
  output: parseOutput,
};
