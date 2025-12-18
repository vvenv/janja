import { CompileError } from '../../compile-error';
import type { Parser } from '../../parser';
import type { DirectiveToken, Token } from '../../types';
import { UnexpectedNode } from './syntax';

export function* parseUnexpected(token: Token, parser: Parser) {
  const name = (token as DirectiveToken).name ?? token.type;

  parser.options.debug?.(
    new CompileError(`Unexpected "${name}"`, parser.template, token.loc),
  );

  yield 'NEXT';
  yield new UnexpectedNode(name, token.val, token.loc, token.strip);
}

export const parsers = {
  unexpected: parseUnexpected,
};
