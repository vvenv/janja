import { parsers as blockParsers } from './block'
import { parsers as callParsers } from './call'
import { parsers as captureParsers } from './capture'
import { parsers as forParsers } from './for'
import { parsers as ifParsers } from './if'
import { parsers as includeParsers } from './include'
import { parsers as macroParsers } from './macro'
import { parsers as setParsers } from './set'

export const parsers = {
  ...ifParsers,
  ...forParsers,
  ...includeParsers,
  ...blockParsers,
  ...macroParsers,
  ...callParsers,
  ...setParsers,
  ...captureParsers,
}
