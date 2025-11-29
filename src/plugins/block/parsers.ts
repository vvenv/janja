import { CompileError } from '../../compile-error';
import type { Parser } from '../../parser';
import type { DirectiveToken } from '../../types';
import { BlockNode, SuperNode } from './syntax';

async function* parseBlock(token: DirectiveToken, parser: Parser) {
  if (!token.expression) {
    parser.emitExpErr(token);

    return;
  }

  yield 'NEXT';

  const body = await parser.parseUntil(['endblock']);

  if (parser.match(['endblock'])) {
    yield 'NEXT';
  } else {
    throw parser.options.debug?.(
      new CompileError(`Unclosed "${token.name}"`, parser.template, token.loc),
    );
  }

  yield new BlockNode(
    parser.parseExp(token.expression),
    body,
    token.loc,
    token.strip,
  );
}

async function* parseSuper(token: DirectiveToken, parser: Parser) {
  if (token.expression) {
    parser.emitExpErr(token, false);

    return;
  }

  yield 'NEXT';
  yield new SuperNode(token.val, token.loc, token.strip);
}

export const parsers = {
  block: parseBlock,
  super: parseSuper,
  endblock: 'unexpected',
};
