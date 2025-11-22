import { CompileError } from '../compile-error';
import { createUnexpected } from '../create-unexpected';
import type { Parser } from '../parser';
import { CallerNode, MacroNode } from '../syntax-nodes';
import type { BinaryExp, DirectiveToken, ParserMap } from '../types';

function parseMacro(token: DirectiveToken, parser: Parser) {
  if (!token.expression) {
    parser.emitExpErr(token);

    return;
  }

  parser.advance();

  const body = parser.parseUntil(['endmacro']);

  if (parser.match(['endmacro'])) {
    parser.advance();
  } else {
    throw parser.options.debug?.(
      new CompileError(`Unclosed "${token.name}"`, parser.template, token.loc),
    );
  }

  return new MacroNode(
    parser.parseExp(token.expression!) as BinaryExp<'SET'>,
    body,
    token.loc,
    token.strip,
  );
}

function parseCaller(token: DirectiveToken, parser: Parser) {
  if (token.expression) {
    parser.emitExpErr(token, false);

    return;
  }

  parser.advance();

  return new CallerNode(token.val, token.loc, token.strip);
}

export const parsers: ParserMap = {
  macro: parseMacro,
  caller: parseCaller,
  endmacro: createUnexpected,
};
