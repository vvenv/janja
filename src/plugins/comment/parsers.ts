import type { CommentToken, ParserMap } from '../../types';
import { CommentNode } from './syntax';

async function* parseComment({ val, loc, strip }: CommentToken) {
  yield 'NEXT';
  yield new CommentNode(val, loc, strip);
}

export const parsers: ParserMap = {
  comment: parseComment,
};
