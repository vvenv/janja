import { CompileError } from '../../compile-error';
import type { Parser } from '../../parser';
import type { DirectiveToken } from '../../types';
import { CallerNode, MacroNode, type MacroNodeVal } from './syntax';

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

  const val: MacroNodeVal = parser.parseExp(token.expression)!;

  if (val.type === 'ASSIGN') {
    if (val.left.type !== 'ID') {
      parser.options.debug?.(
        new CompileError('Invalid macro name', parser.template, token.loc),
      );

      return;
    }

    if (val.right.type !== 'SEQ') {
      parser.options.debug?.(
        new CompileError(
          'Invalid macro parameters',
          parser.template,
          token.loc,
        ),
      );

      return;
    } else {
      for (const element of val.right.elements) {
        if (element.type === 'ASSIGN') {
          if (element.left.type !== 'ID') {
            parser.options.debug?.(
              new CompileError(
                'Invalid parameter name',
                parser.template,
                token.loc,
              ),
            );

            return;
          }
        } else if (element.type !== 'ID') {
          parser.options.debug?.(
            new CompileError(
              'Invalid macro parameter',
              parser.template,
              token.loc,
            ),
          );

          return;
        }
      }
    }
  } else if (val.type !== 'ID') {
    parser.options.debug?.(
      new CompileError('Invalid macro definition', parser.template, token.loc),
    );

    return;
  }

  yield new MacroNode(val, body, token.loc, token.strip);
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
  endmacro: 'unexpected',
};
