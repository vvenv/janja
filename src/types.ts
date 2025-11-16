import type { ASTNode, NodeType } from './ast'
import type { Compiler } from './compiler'
import type { Context } from './context'
import type { OutScript } from './out-script'
import type { Parser } from './parser'

export type MaybePromise<T> = T | Promise<T>

export type ObjectType = Record<string, any>

export enum TokenType {
  TEXT = 'TEXT',
  OUTPUT = 'OUTPUT',
  DIRECTIVE = 'DIRECTIVE',
  COMMENT = 'COMMENT',
}

export interface Pos {
  line: number
  column: number
}

export interface Loc {
  start: Pos
  end: Pos
}

export interface Strip {
  before?: boolean
  after?: boolean
  start?: boolean
  end?: boolean
}

export interface TokenBase {
  type: TokenType
  val: string
  loc: Loc
  strip: Strip
}

export interface CommentToken extends TokenBase {
  type: TokenType.COMMENT
}

export interface DirectiveToken extends TokenBase {
  type: TokenType.DIRECTIVE
  name: string
  expression: DirectiveExpression | null
}

export interface OutputToken extends TokenBase {
  type: TokenType.OUTPUT
}

export interface TextToken extends TokenBase {
}

export interface DirectiveExpression {
  val: string
  loc: Loc
}

export type Token = CommentToken | DirectiveToken | OutputToken | TextToken

export interface Mapping {
  source: Loc
  target: Loc
}

export type ExpTokenType
  = | 'AND'
    | 'OR'
    | 'IS'
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

export interface ExpToken<T = ExpTokenType> {
  type: T
  value: string | number | boolean | null | undefined
  loc: Loc
  raw?: string
}

export type Checker = (token: ExpToken) => 'BACK' | 'BREAK' | undefined

export type ExpType
  = | 'AND'
    | 'OR'
    | 'IS'
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

export interface ExpBase<T = ExpType> {
  type: T
  loc: Loc
}

export interface IdExp extends ExpBase {
  type: 'ID'
  value: string
  path?: IdExp[]
  args?: Exp[]
}

export interface LitExp<T = string | number | boolean | null | undefined> extends ExpBase {
  type: 'LIT'
  value: T
}

export interface NotExp extends ExpBase {
  type: 'NOT'
  argument: Exp
}

export interface BinaryExp<T = 'AND'
  | 'OR'
  | 'IS'
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
  | 'SET'> extends ExpBase<T> {
  left: Exp
  right: Exp
}

export interface IfExp extends ExpBase {
  type: 'IF'
  test: Exp
  consequent: Exp
  alternative?: Exp
}

export interface PipeExp extends ExpBase {
  type: 'PIPE'
  left: Exp
  right: Exp
}

export interface SeqExp extends ExpBase {
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

export type Filters = Record<string, (value: any, ...args: any[]) => any>

export type Script = (
  globals: ObjectType,
  escape: (v: unknown) => unknown,
  filters: Filters,
) => Promise<string>

export interface Tag {
  name: string
  value?: Exp | null
  raw: string
  previous: Tag | null
  next: Tag | null
  strip?: Strip
  loc?: Loc
}

export interface NodeCompiler {
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
  ) => MaybePromise<Loc | void | false>
}

export interface CacheValue {
  template: string
  code: string
}

export type ParserFn<T = ASTNode> = (token: DirectiveToken, parser: Parser) => T | void
export type ParserMap = Record<string, ParserFn>

export type CompilerFn<T = ASTNode> = (node: T, compiler: Compiler) => MaybePromise<void>
export type CompilerMap = Partial<Record<NodeType, CompilerFn>>

export interface BaseOptions {
  debug?: (error: Error) => unknown
}

export interface ParserOptions extends BaseOptions {
  commentOpen?: string
  commentClose?: string
  directiveOpen?: string
  directiveClose?: string
  outputOpen?: string
  outputClose?: string
  parsers?: ParserMap
}

export interface CompilerOptions extends ParserOptions {
  trimWhitespace?: boolean
  stripComments?: boolean
  compilers?: CompilerMap
  loader?: (path: string) => Promise<string>
}

export interface RendererOptions extends CompilerOptions {
  globals?: ObjectType
  filters?: Filters
  autoEscape?: boolean
}
