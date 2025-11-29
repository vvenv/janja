import { CompileError } from '../../compile-error';
import { IdExp } from '../../exp/exp-types';
import type { Parser } from '../../parser';
import type { DirectiveToken } from '../../types';
import { CaptureNode } from './syntax';

async function* parseCapture(token: DirectiveToken, parser: Parser) {
  if (!token.expression) {
    parser.emitExpErr(token);

    return;
  }

  yield 'NEXT';

  const body = await parser.parseUntil(['endcapture']);

  if (parser.match(['endcapture'])) {
    yield 'NEXT';
  } else {
    throw parser.options.debug?.(
      new CompileError(`Unclosed "${token.name}"`, parser.template, token.loc),
    );
  }

  yield new CaptureNode(
    parser.parseExp(token.expression!) as IdExp,
    body,
    token.loc,
    token.strip,
  );
}

export const parsers = {
  capture: parseCapture,
  endcapture: 'unexpected' as const,
};
