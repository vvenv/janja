import type { ParserMap } from './types';

export const createUnexpected: ParserMap[keyof ParserMap] = (token, parser) =>
  parser.createUnexpectedDirective(token);
