import { Compiler } from './compiler'
import { Parser } from './parser'

export * from './compiler'
export * from './parser'

export const compiler = new Compiler()
export const parser = new Parser()
