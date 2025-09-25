import type { OutScript } from './out-script'
import type { Parser } from './parser'

export type MaybePromise<T> = T | Promise<T>

export type ObjectType = Record<string, any>

export interface Location {
  startIndex: number
  endIndex: number
}

export interface Mapping {
  source: Location
  target: Location
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

export type ParsedScript = (
  globals: Globals,
  filters: Filters,
  escape: (v: unknown) => unknown,
  helpers: Helpers
) => Promise<string>

export type RenderFunction = (
  globals: Globals,
) => Promise<string>

export interface ASTNodeBase extends Location {
  identifier: string
  data?: string
  isStart?: boolean
  isEnd?: boolean
  original: string
  stripBefore: boolean
  stripAfter: boolean
  /**
   * The previous node in all levels.
   */
  previous: ASTNode | null
  /**
   * The next node in all levels.
   */
  next: ASTNode | null
}

export interface ASTNode extends ASTNodeBase {
  name: string
  data?: any
  /**
   * The tag that contains this node.
   */
  tag: ASTTag
  /**
   * The previous node in the same level.
   */
  previousSibling: ASTNode | null
  /**
   * The next node in the same level.
   */
  nextSibling: ASTNode | null
  /**
   * The tags that contained in this node.
   */
  tags: ASTTag[]
}

export interface ASTTag {
  body: ASTNode[]
  parent: ASTTag | null
  previousSibling: ASTTag | null
  nextSibling: ASTTag | null
  level: number
  index: number
}

export interface Tag {
  names: string[]

  /**
   * - void: handled by the parser
   * - false: not handled by the parser
   */
  parse: (arg: { parser: Parser, base: ASTNodeBase }) => MaybePromise<void | false>

  compile: (
    arg: {
      template: string
      node: ASTNode
      context: string
      parser: Parser
      out: OutScript
    },
    compileContent: (arg: {
      template: string
      node: ASTNode
      context: string
      out: OutScript
    }) => Promise<void>,
  ) => MaybePromise<void | false | Location>
}

export interface EngineOptions {
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
