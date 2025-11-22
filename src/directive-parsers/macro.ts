import { CallerNode, MacroNode } from '../ast';
import { CompileError } from '../compile-error';
import { parseUnexpected } from '../parse-unexpected';
import type { Parser } from '../parser';
import type { BinaryExp, DirectiveToken, ParserMap } from '../types';

function parseMacro(token: DirectiveToken, parser: Parser) {
  parser.requireExpression(token);

  const name = parser.parseExp(token.expression!);

  parser.advance();

  const body = parser.parseUntil(['endmacro']);

  if (parser.match(['endmacro'])) {
    parser.advance();
  } else {
    throw parser.options.debug?.(
      new CompileError(`Unclosed "${token.name}"`, parser.template, token.loc),
    );
  }

  return new MacroNode(name as BinaryExp<'SET'>, body, token.loc, token.strip);
}

function parseCaller(token: DirectiveToken, parser: Parser) {
  parser.requireNoExpression(token);

  parser.advance();

  return new CallerNode(token.val, token.loc, token.strip);
}

export const parsers: ParserMap = {
  macro: parseMacro,
  caller: parseCaller,
  endmacro: parseUnexpected,
};
