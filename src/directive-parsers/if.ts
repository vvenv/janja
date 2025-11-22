import { ElseIfNode, ElseNode, IfNode } from '../ast';
import { CompileError } from '../compile-error';
import { parseUnexpected } from '../parse-unexpected';
import type { Parser } from '../parser';
import type { DirectiveToken, ParserMap } from '../types';

function parseIf(token: DirectiveToken, parser: Parser) {
  parser.requireExpression(token);

  parser.advance();

  const body = parser.parseUntil(['else', 'elseif', 'elsif', 'elif', 'endif']);
  const alternatives: (ElseIfNode | ElseNode)[] = [];

  while (parser.match(['else', 'elseif', 'elsif', 'elif'])) {
    const branchToken = parser.peek() as DirectiveToken;

    alternatives.push(
      branchToken.name.toLowerCase() === 'else'
        ? parseElse(branchToken, parser)
        : parseElseIf(branchToken, parser),
    );
  }

  if (parser.match(['endif'])) {
    parser.advance();
  } else {
    throw parser.options.debug?.(
      new CompileError(`Unclosed "${token.name}"`, parser.template, token.loc),
    );
  }

  return new IfNode(
    parser.parseExp(token.expression!),
    body,
    alternatives,
    token.loc,
    token.strip,
  );
}

function parseElseIf(token: DirectiveToken, parser: Parser) {
  parser.requireExpression(token);

  parser.advance();

  const body = parser.parseUntil(['else', 'elseif', 'elsif', 'elif', 'endif']);

  return new ElseIfNode(
    parser.parseExp(token.expression!),
    body,
    token.loc,
    token.strip,
  );
}

function parseElse(token: DirectiveToken, parser: Parser) {
  parser.requireNoExpression(token);

  parser.advance();

  const body = parser.parseUntil(['endif']);

  return new ElseNode(body, token.loc, token.strip);
}

export const parsers: ParserMap = {
  if: parseIf,
  elseif: parseUnexpected,
  elsif: parseUnexpected,
  elif: parseUnexpected,
  endif: parseUnexpected,
};
