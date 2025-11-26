import { CompileError } from '../../compile-error';
import { createUnexpected } from '../../create-unexpected';
import type { Parser } from '../../parser';
import type { BinaryExp, DirectiveToken } from '../../types';
import { BreakNode, ContinueNode, ForNode } from './syntax';

const wm = new WeakMap<Parser, boolean>();

function parseFor(token: DirectiveToken, parser: Parser) {
  if (!token.expression) {
    parser.emitExpErr(token);

    return;
  }

  wm.set(parser, true);

  parser.advance();

  const body = parser.parseUntil(['endfor']);

  wm.set(parser, false);

  if (parser.match(['endfor'])) {
    parser.advance();
  } else {
    throw parser.options.debug?.(
      new CompileError(`Unclosed "${token.name}"`, parser.template, token.loc),
    );
  }

  return new ForNode(
    parser.parseExp(token.expression!) as BinaryExp<'OF'>,
    body,
    token.loc,
    token.strip,
  );
}

function parseBreak(token: DirectiveToken, parser: Parser) {
  if (token.expression) {
    parser.emitExpErr(token, false);

    return;
  }

  if (!wm.get(parser)) {
    parser.options.debug?.(
      new CompileError(
        '"break" directive used outside of a loop',
        parser.template,
        token.loc,
      ),
    );

    return;
  }

  parser.advance();

  return new BreakNode(token.val, token.loc, token.strip);
}

function parseContinue(token: DirectiveToken, parser: Parser) {
  if (token.expression) {
    parser.emitExpErr(token, false);

    return;
  }

  if (!wm.get(parser)) {
    parser.options.debug?.(
      new CompileError(
        '"continue" directive used outside of a loop',
        parser.template,
        token.loc,
      ),
    );

    return;
  }

  parser.advance();

  return new ContinueNode(token.val, token.loc, token.strip);
}

export const parsers = {
  for: parseFor,
  break: parseBreak,
  continue: parseContinue,
  endfor: createUnexpected,
};
