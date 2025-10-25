import type { TagCompiler } from '../types'
import { tag as callTag } from './call'
import { tag as commentTag } from './comment'
import { tag as expressionTag } from './expression'
import { tag as forTag } from './for'
import { tag as ifTag } from './if'
import { tag as macroTag } from './macro'
import { tag as rawTag } from './raw'
import { tag as assignTag } from './set'

export const compilers = [
  assignTag,
  callTag,
  commentTag,
  expressionTag,
  forTag,
  ifTag,
  macroTag,
  rawTag,
].reduce((acc, compiler) => {
  for (const name of compiler.names) {
    acc[name] = [...(acc[name] || []), compiler]
  }

  return acc
}, {} as Record<string, TagCompiler[]>)
