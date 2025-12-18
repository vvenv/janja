import type { CommentToken } from '../../types';
import { CommentNode } from './syntax';

function* parseComment({ val, loc, strip }: CommentToken) {
  yield 'NEXT';
  yield new CommentNode(val, loc, strip);
}

export const parsers = {
  comment: parseComment,
};
