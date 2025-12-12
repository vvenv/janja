import { CompileError } from '../../compile-error';
import type { Parser } from '../../parser';
import type { DirectiveToken } from '../../types';
import { BreakNode, ContinueNode, ElseNode, ForNode } from './syntax';

const wm = new WeakMap<Parser, boolean>();

async function* parseFor(token: DirectiveToken, parser: Parser) {
  if (!token.expression) {
    parser.emitExpErr(token);

    return;
  }

  wm.set(parser, true);

  yield 'NEXT';

  const body = await parser.parseUntil(['else', 'endfor']);

  wm.set(parser, false);

  let alternative: ElseNode | null = null;

  if (parser.match(['else'])) {
    const g = parseElse(parser.peek() as DirectiveToken, parser);

    while (true) {
      const { value, done } = await g.next();

      if (done) {
        break;
      }

      if (value) {
        if (value === 'NEXT') {
          yield 'NEXT';

          continue;
        }

        alternative = value;
      }
    }
  }

  if (parser.match(['endfor'])) {
    yield 'NEXT';
  } else {
    throw parser.options.debug?.(
      new CompileError(`Unclosed "${token.name}"`, parser.template, token.loc),
    );
  }

  yield new ForNode(
    parser.parseExp(token.expression)!,
    body,
    alternative,
    token.loc,
    token.strip,
  );
}

async function* parseElse(token: DirectiveToken, parser: Parser) {
  if (token.expression) {
    parser.emitExpErr(token, false);

    return;
  }

  yield 'NEXT';
  yield new ElseNode(
    await parser.parseUntil(['endfor']),
    token.loc,
    token.strip,
  );
}

async function* parseBreak(token: DirectiveToken, parser: Parser) {
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

  yield 'NEXT';
  yield new BreakNode(token.val, token.loc, token.strip);
}

async function* parseContinue(token: DirectiveToken, parser: Parser) {
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

  yield 'NEXT';
  yield new ContinueNode(token.val, token.loc, token.strip);
}

export const parsers = {
  for: parseFor,
  break: parseBreak,
  continue: parseContinue,
  endfor: 'unexpected',
};
