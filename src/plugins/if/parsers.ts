import { CompileError } from '../../compile-error';
import { createUnexpected } from '../../create-unexpected';
import type { Parser } from '../../parser';
import type { DirectiveToken } from '../../types';
import { ElseIfNode, ElseNode, IfNode } from './syntax';

function parseIf(token: DirectiveToken, parser: Parser) {
  if (!token.expression) {
    parser.emitExpErr(token);

    return;
  }

  parser.advance();

  const body = parser.parseUntil(['else', 'elseif', 'elsif', 'elif', 'endif']);
  const alternatives: (ElseIfNode | ElseNode)[] = [];

  while (parser.match(['else', 'elseif', 'elsif', 'elif'])) {
    const branchToken = parser.peek() as DirectiveToken;

    if (branchToken.name.toLowerCase() === 'else') {
      const elseNode = parseElse(branchToken, parser);

      if (elseNode) {
        alternatives.push(elseNode);
      }
    } else {
      const elseIfNode = parseElseIf(branchToken, parser);

      if (elseIfNode) {
        alternatives.push(elseIfNode);
      }
    }
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
  if (!token.expression) {
    parser.emitExpErr(token);

    return;
  }

  parser.advance();

  return new ElseIfNode(
    parser.parseExp(token.expression!),
    parser.parseUntil(['else', 'elseif', 'elsif', 'elif', 'endif']),
    token.loc,
    token.strip,
  );
}

function parseElse(token: DirectiveToken, parser: Parser) {
  if (token.expression) {
    parser.emitExpErr(token, false);

    return;
  }

  parser.advance();

  return new ElseNode(parser.parseUntil(['endif']), token.loc, token.strip);
}

export const parsers = {
  if: parseIf,
  elseif: createUnexpected,
  elsif: createUnexpected,
  elif: createUnexpected,
  endif: createUnexpected,
};
