import type { Compiler } from './compiler';
import type { Context } from './context';
import type { OutScript } from './out-script';
import type { Parser } from './parser';
import type { SyntaxNode } from './syntax-nodes';

export type MaybePromise<T> = T | Promise<T>;

export type ObjectType<T = any> = Record<string, T>;

export enum TokenType {
  TEXT = 'TEXT',
  OUTPUT = 'OUTPUT',
  DIRECTIVE = 'DIRECTIVE',
  COMMENT = 'COMMENT',
}

export interface Pos {
  line: number;
  column: number;
}

export interface Loc {
  start: Pos;
  end: Pos;
}

export interface Strip {
  before?: boolean;
  after?: boolean;
  start?: boolean;
  end?: boolean;
}

export interface TokenBase {
  type: TokenType;
  val: string;
  loc: Loc;
  strip: Strip;
}

export interface CommentToken extends TokenBase {
  type: TokenType.COMMENT;
}

export interface DirectiveToken extends TokenBase {
  type: TokenType.DIRECTIVE;
  name: string;
  expression: DirectiveExpression | null;
}

export interface OutputToken extends TokenBase {
  type: TokenType.OUTPUT;
}

export interface TextToken extends TokenBase {
  type: TokenType.TEXT;
}

export interface DirectiveExpression {
  val: string;
  loc: Loc;
}

export type Token = CommentToken | DirectiveToken | OutputToken | TextToken;

export interface Mapping {
  source: Loc;
  target: Loc;
}

export type UnaryExpTokenType = 'NOT';
export type BinaryExpTokenType =
  | 'AND'
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
  | 'PIPE'
  | 'ASSIGN';
export type TernaryExpTokenType = 'IF' | 'ELSE';
export type ExpTokenType =
  | UnaryExpTokenType
  | BinaryExpTokenType
  | TernaryExpTokenType
  | 'LP'
  | 'RP'
  | 'COMMA'
  | 'DOT'
  | 'ID'
  | 'LIT';

export interface ExpToken<T = ExpTokenType> {
  type: T;
  value: string | number | boolean | null | undefined;
  loc: Loc;
  raw?: string;
}

export type Checker = (token: ExpToken) => 'BACK' | 'BREAK' | undefined;

export type UnaryExpType = UnaryExpTokenType;
export type BinaryExpType = BinaryExpTokenType;
export type TernaryExpType = TernaryExpTokenType;
export type ExpType =
  | UnaryExpType
  | BinaryExpType
  | TernaryExpType
  | 'SEQ'
  | 'ID'
  | 'LIT';

export interface ExpBase<T = ExpType> {
  type: T;
  loc: Loc;
}

export interface NotExp extends ExpBase<'NOT'> {
  argument: Exp;
}

export interface BinaryExp<T extends BinaryExpType = BinaryExpType>
  extends ExpBase<T> {
  left: Exp;
  right: Exp;
}

export interface IfExp extends ExpBase<'IF'> {
  test: Exp;
  consequent: Exp;
  alternative?: Exp;
}

export interface IdExp extends ExpBase<'ID'> {
  value: string;
  path?: IdExp[];
  args?: Exp[];
}

export interface LitExp<T = string | number | boolean | null | undefined>
  extends ExpBase<'LIT'> {
  value: T;
}

export interface SeqExp extends ExpBase<'SEQ'> {
  elements: Exp[];
}

export type Exp = NotExp | BinaryExp | IfExp | IdExp | LitExp | SeqExp;

export type Filters = Record<string, (value: any, ...args: any[]) => any>;

export type Script = (
  globals: ObjectType,
  escape: (v: any) => any,
  filters: Filters,
) => Promise<string>;

export interface Tag {
  name: string;
  value?: Exp | null;
  raw: string;
  previous: Tag | null;
  next: Tag | null;
  strip?: Strip;
  loc?: Loc;
}

export interface NodeCompiler {
  names: string[];

  /**
   * - Return `Range` to indicate the range of the tag.
   * - Return `false` to pass the control to the next tag.
   * - Return `void` to continue compiling.
   */
  compile: (arg: {
    tag: Tag;
    ctx: Context;
    out: OutScript;
  }) => MaybePromise<Loc | void | false>;
}

export interface Plugin {
  filters?: Filters;
  parsers?: ParserMap;
  compilers?: CompilerMap;
}

export type ParserFn<T extends SyntaxNode = SyntaxNode> = (
  token: Token,
  parser: Parser,
) => AsyncGenerator<T | 'NEXT' | void>;
export type ParserMap = Record<string, ParserFn>;

export type CompilerFn<T extends SyntaxNode = SyntaxNode> = (
  node: T,
  compiler: Compiler,
) => MaybePromise<void>;
export type CompilerMap = Partial<Record<string, CompilerFn>>;

export interface BaseOptions {
  debug?: (error: Error) => any;
  filters?: Filters;
  parsers?: ParserMap;
  compilers?: CompilerMap;
  plugins?: Plugin[];
}

export interface ParserOptions extends BaseOptions {
  commentOpen?: string;
  commentClose?: string;
  directiveOpen?: string;
  directiveClose?: string;
  outputOpen?: string;
  outputClose?: string;
}

export interface CompilerOptions extends ParserOptions {
  trimWhitespace?: boolean;
  stripComments?: boolean;
  loader?: (path: string) => Promise<string>;
}

export interface RendererOptions extends CompilerOptions {
  globals?: ObjectType;
  autoEscape?: boolean;
}
