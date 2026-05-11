import { CompileError } from '../../compile-error';
import type { Parser } from '../../parser';
import type { DirectiveToken, ParserFn } from '../../types';
import { WithNode } from './syntax';

function* parseWith(token: DirectiveToken, parser: Parser) {
  if (!token.expression) {
    parser.emitExpErr(token);

    return;
  }

  yield 'NEXT';

  const body = parser.parseUntil(['endwith']);

  if (parser.match(['endwith'])) {
    yield 'NEXT';
  } else {
    throw parser.options.debug?.(
      new CompileError(`Unclosed "${token.name}"`, parser.template, token.loc),
    );
  }

  yield new WithNode(
    parser.parseExp(token.expression)!,
    body,
    token.loc,
    token.strip,
  );
}

export const parsers: Record<string, ParserFn | string> = {
  with: parseWith,
  endwith: 'unexpected',
};
