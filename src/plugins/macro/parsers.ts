import { CompileError } from '../../compile-error';
import type { Parser } from '../../parser';
import { BinaryExp, DirectiveToken } from '../../types';
import { CallerNode, MacroNode } from './syntax';

const wm = new WeakMap<Parser, boolean>();

async function* parseMacro(token: DirectiveToken, parser: Parser) {
  if (!token.expression) {
    parser.emitExpErr(token);

    return;
  }

  wm.set(parser, true);

  yield 'NEXT';

  const body = await parser.parseUntil(['endmacro']);

  wm.set(parser, false);

  if (parser.match(['endmacro'])) {
    yield 'NEXT';
  } else {
    throw parser.options.debug?.(
      new CompileError(`Unclosed "${token.name}"`, parser.template, token.loc),
    );
  }

  yield new MacroNode(
    parser.parseExp(token.expression!) as BinaryExp<'ASSIGN'>,
    body,
    token.loc,
    token.strip,
  );
}

async function* parseCaller(token: DirectiveToken, parser: Parser) {
  if (token.expression) {
    parser.emitExpErr(token, false);

    return;
  }

  if (!wm.get(parser)) {
    parser.options.debug?.(
      new CompileError(
        '"caller" directive used outside of a macro',
        parser.template,
        token.loc,
      ),
    );

    return;
  }

  yield 'NEXT';
  yield new CallerNode(token.val, token.loc, token.strip);
}

export const parsers = {
  macro: parseMacro,
  caller: parseCaller,
  endmacro: 'unexpected' as const,
};
