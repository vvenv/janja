import { Compiler } from './compiler'
import { Parser } from './parser'

export * from './compiler'
export * from './parse-error'
export * from './parser'
export type * from './types'

export const compiler = new Compiler()
export const parser = new Parser()
