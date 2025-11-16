import type { ParserMap } from './types'

export const parseUnexpected: ParserMap[keyof ParserMap] = (token, parser) => parser.createUnexpectedDirective(token)
