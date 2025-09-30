import type { Tag } from '../types'
import { tag as assignTag } from './assign'
import { tag as callTag } from './call'
import { tag as commentTag } from './comment'
import { tag as expressionTag } from './expression'
import { tag as forTag } from './for'
import { tag as ifTag } from './if'
import { tag as macroTag } from './macro'
import { tag as strTag } from './str'

export const tags = [
  assignTag,
  callTag,
  commentTag,
  expressionTag,
  forTag,
  ifTag,
  macroTag,
  strTag,
].reduce((acc, tag) => {
  for (const name of tag.names) {
    acc[name] = [...(acc[name] || []), tag]
  }

  return acc
}, {} as Record<string, Tag[]>)
