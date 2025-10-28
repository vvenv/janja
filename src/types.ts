import type { Context } from './context'
import type { OutScript } from './out-script'
import type { SourceMap } from './source-map'

export type MaybePromise<T> = T | Promise<T>

export type ObjectType = Record<string, any>

export interface Range {
  start: number
  end: number
}

export interface Mapping {
  source: Range
  target: Range
}

export type ExpTokenType
  = | 'AND'
    | 'OR'
    | 'NOT'
    | 'EQ'
    | 'NE'
    | 'GT'
    | 'LT'
    | 'GE'
    | 'LE'
    | 'IN'
    | 'NI'
    | 'OF'
    | 'ADD'
    | 'SUB'
    | 'MUL'
    | 'DIV'
    | 'MOD'
    | 'PIPE'
    | 'IF'
    | 'ELSE'
    | 'SET'
    | 'LP'
    | 'RP'
    | 'COMMA'
    | 'DOT'
    | 'ID'
    | 'LIT'

export interface ExpToken<T = ExpTokenType> extends Range {
  type: T
  value: string | number | boolean
  raw?: string
}

export type Checker = (token: ExpToken) => 'BACK' | 'BREAK' | undefined

export type ExpType
  = | 'AND'
    | 'OR'
    | 'NOT'
    | 'EQ'
    | 'NE'
    | 'GT'
    | 'LT'
    | 'GE'
    | 'LE'
    | 'IN'
    | 'NI'
    | 'OF'
    | 'ADD'
    | 'SUB'
    | 'MUL'
    | 'DIV'
    | 'MOD'
    | 'PIPE'
    | 'IF'
    | 'SET'
    | 'SEQ'
    | 'ID'
    | 'LIT'

export interface BaseExp extends Range {
  type: ExpType
}

export interface IdExp extends BaseExp {
  type: 'ID'
  value: string
  path?: IdExp[]
  args?: Exp[]
}

export interface LitExp extends BaseExp {
  type: 'LIT'
  value: string | number | boolean
}

export interface NotExp extends BaseExp {
  type: 'NOT'
  argument: Exp
}

export interface BinaryExp extends BaseExp {
  type: 'AND'
    | 'OR'
    | 'EQ'
    | 'NE'
    | 'GT'
    | 'LT'
    | 'GE'
    | 'LE'
    | 'IN'
    | 'NI'
    | 'OF'
    | 'ADD'
    | 'SUB'
    | 'MUL'
    | 'DIV'
    | 'MOD'
    | 'SET'
  left: Exp
  right: Exp
}

export interface IfExp extends BaseExp {
  type: 'IF'
  test: Exp
  consequent: Exp
  alternative?: Exp
}

export interface PipeExp extends BaseExp {
  type: 'PIPE'
  left: Exp
  right: Exp
}

export interface SeqExp extends BaseExp {
  type: 'SEQ'
  elements: Exp[]
}

export type Exp
  = | IdExp
    | LitExp
    | NotExp
    | BinaryExp
    | IfExp
    | PipeExp
    | SeqExp

export interface Globals {
  translations?: Record<string, string>
  [key: string]: any
}

export type Filters = Record<string, (value: any, ...args: any[]) => any>

export type Script = (
  globals: Globals,
  filters: Filters,
  escape: (v: unknown) => unknown,
) => Promise<string>

export interface Tag extends Range {
  name: string
  value?: Exp | null
  raw: string
  previous: Tag | null
  next: Tag | null
  stripBefore?: boolean
  stripAfter?: boolean
}

export interface TagCompiler {
  names: string[]

  /**
   * - Return `Range` to indicate the range of the tag.
   * - Return `false` to pass the control to the next tag.
   * - Return `void` to continue compiling.
   */
  compile: (
    arg: {
      tag: Tag
      ctx: Context
      out: OutScript
    },
  ) => MaybePromise<Range | void | false>
}

export interface CacheValue {
  template: string
  script: Script
  sourcemap: SourceMap
}

export interface Config {
  globals?: Globals
  filters?: Filters
  compilers?: Record<string, TagCompiler[]>
  strictMode?: boolean
  autoEscape?: boolean
  stripComments?: boolean
  trimWhitespace?: boolean
  loader?: (path: string) => Promise<string>
  cache?: {
    has: (path: string) => boolean
    get: (path: string) => CacheValue | undefined
    set: (path: string, content: CacheValue) => void
  }
}
