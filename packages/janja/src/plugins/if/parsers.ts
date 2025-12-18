import { CompileError } from '../../compile-error';
import type { Parser } from '../../parser';
import type { DirectiveToken } from '../../types';
import { ElseIfNode, ElseNode, IfNode } from './syntax';

function* parseIf(token: DirectiveToken, parser: Parser) {
  if (!token.expression) {
    parser.emitExpErr(token);

    return;
  }

  yield 'NEXT';

  const body = parser.parseUntil(['else', 'elseif', 'elsif', 'elif', 'endif']);
  const alternatives: (ElseIfNode | ElseNode)[] = [];

  while (parser.match(['else', 'elseif', 'elsif', 'elif'])) {
    const branchToken = parser.peek() as DirectiveToken;

    if (branchToken.name.toLowerCase() === 'else') {
      const g = parseElse(branchToken, parser);

      while (true) {
        const { value, done } = g.next();

        if (done) {
          break;
        }

        if (value) {
          if (value === 'NEXT') {
            yield 'NEXT';

            continue;
          }

          alternatives.push(value);
        }
      }
    } else {
      const g = parseElseIf(branchToken, parser);

      while (true) {
        const { value, done } = g.next();

        if (done) {
          break;
        }

        if (value) {
          if (value === 'NEXT') {
            yield 'NEXT';

            continue;
          }

          alternatives.push(value);
        }
      }
    }
  }

  if (parser.match(['endif'])) {
    yield 'NEXT';
  } else {
    throw parser.options.debug?.(
      new CompileError(`Unclosed "${token.name}"`, parser.template, token.loc),
    );
  }

  yield new IfNode(
    parser.parseExp(token.expression)!,
    body,
    alternatives,
    token.loc,
    token.strip,
  );
}

function* parseElseIf(token: DirectiveToken, parser: Parser) {
  if (!token.expression) {
    parser.emitExpErr(token);

    return;
  }

  yield 'NEXT';
  yield new ElseIfNode(
    parser.parseExp(token.expression)!,
    parser.parseUntil(['else', 'elseif', 'elsif', 'elif', 'endif']),
    token.loc,
    token.strip,
  );
}

function* parseElse(token: DirectiveToken, parser: Parser) {
  if (token.expression) {
    parser.emitExpErr(token, false);

    return;
  }

  yield 'NEXT';
  yield new ElseNode(parser.parseUntil(['endif']), token.loc, token.strip);
}

export const parsers = {
  if: parseIf,
  elseif: 'unexpected',
  elsif: 'unexpected',
  elif: 'unexpected',
  endif: 'unexpected',
};
