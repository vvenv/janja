import type { Parser } from '../../parser';
import type { CommentToken } from '../../types';
import { CommentNode } from './syntax';

function parseComment({ val, loc, strip }: CommentToken, parser: Parser) {
  parser.advance();

  return new CommentNode(val, loc, strip);
}

export const parsers = {
  comment: parseComment,
};
