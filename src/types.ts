import type { Compiler } from './compiler';
import type { Parser } from './parser';
import type { SyntaxNode } from './syntax-nodes';

export type MaybePromise<T> = T | Promise<T>;

export type ObjectType<T = any> = Record<string, T>;

export type Primitive = string | number | boolean | null | undefined;

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

export type Filters = Record<string, (value: any, ...args: any[]) => any>;

export type Script = (
  globals: ObjectType,
  escape: (v: any) => any,
  filters: Filters,
) => Promise<string>;

export interface Plugin {
  filters?: Filters;
  parsers?: ParserMap;
  compilers?: CompilerMap;
}

export type ParserFn<T extends Token = any, U extends SyntaxNode = any> = (
  token: T,
  parser: Parser,
) => AsyncGenerator<U | 'NEXT' | void>;
export type ParserMap = Record<string, 'unexpected' | ParserFn>;

export type CompilerFn<T extends SyntaxNode = any> = (
  node: T,
  compiler: Compiler,
) => MaybePromise<void>;
export type CompilerMap = Record<string, CompilerFn>;
