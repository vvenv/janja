import { CompileError } from '../../compile-error';
import type { Parser } from '../../parser';
import type { DirectiveToken, Token } from '../../types';
import { UnknownNode } from './syntax';

export function* parseUnknown(token: Token, parser: Parser) {
  const name = (token as DirectiveToken).name ?? token.type;

  parser.options.debug?.(
    new CompileError(`Unknown "${name}"`, parser.template, token.loc),
  );

  yield 'NEXT';
  yield new UnknownNode(name, token.val, token.loc, token.strip);
}

export const parsers = {
  unknown: parseUnknown,
};
