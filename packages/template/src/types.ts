import type { Context } from './context'
import type { OutScript } from './out-script'

export type MaybePromise<T> = T | Promise<T>

export type ObjectType = Record<string, any>

export interface Loc {
  start: number
  end: number
}

export interface Mapping {
  source: Loc
  target: Loc
}

export interface FilterMeta {
  name: string
  args: string
}

export interface Statement {
  type: 'expression' | 'operator'
  value: string
  filters?: FilterMeta[]
}

export interface Globals {
  translations?: Record<string, string>
  [key: string]: any
}

export interface Helpers {
  getIn: (obj: any[] | ObjectType, index: number, key: string) => any
}

export type Filters = Record<string, Filter>

export interface Filter {
  (value: any, ...args: any[]): any
}

export type Script = (
  globals: Globals,
  filters: Filters,
  escape: (v: unknown) => unknown,
  helpers: Helpers
) => Promise<string>

export interface Token extends Loc {
  name: string
  value: string | null
  raw: string
  previous: Token | null
  next: Token | null
  stripBefore?: boolean
  stripAfter?: boolean
}

export interface AST {
  cursor: Token | null
}

export interface Tag {
  names: string[]

  /**
   * - Return `Location` to indicate the range of the tag.
   * - Return `false` to pass the control to the next tag.
   * - Return `void` to continue compiling.
   */
  compile: (
    arg: {
      token: Token
      index: number
      ctx: Context
      out: OutScript
    },
  ) => MaybePromise<Loc | void | false>
}

export interface Config {
  debug?: boolean
  globals?: Globals
  filters?: Filters
  tags?: Record<string, Tag[]>
  strictMode?: boolean
  autoEscape?: boolean
  stripComments?: boolean
  trimWhitespace?: boolean
  loader?: (path: string) => Promise<string>
  cache?: boolean
}
