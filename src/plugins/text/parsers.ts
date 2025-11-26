import type { Parser } from '../../parser';
import type { TextToken } from '../../types';
import { TextNode } from './syntax';

function parseText(token: TextToken, parser: Parser) {
  parser.advance();

  return new TextNode(token.val, token.loc, token.strip);
}

export const parsers = {
  text: parseText,
};
