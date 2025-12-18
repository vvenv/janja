import type { TextToken } from '../../types';
import { TextNode } from './syntax';

function* parseText(token: TextToken) {
  yield 'NEXT';
  yield new TextNode(token.val, token.loc, token.strip);
}

export const parsers = {
  text: parseText,
};
