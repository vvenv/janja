import type { Compiler } from './compiler';
import type { Parser } from './parser';
import type { SecurityOptions } from './security';
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

/**
 * A filter receives the piped value followed by the arguments written in the
 * template. `this` is the context the expression is evaluated in. It may
 * return a promise.
 */
export type Filter<
  Value = any,
  Args extends any[] = any[],
  Result = unknown,
> = (this: ObjectType, value: Value, ...args: Args) => Result;

export type Filters = Record<string, Filter>;

export type Script = (
  globals: ObjectType,
  escape: (v: any) => any,
  filters: Filters,
  /** Receives chunks of output when the template was compiled for streaming */
  write?: (chunk: string) => void | Promise<void>,
) => Promise<string>;

export interface Plugin {
  filters?: Filters;
  parsers?: ParserMap;
  compilers?: CompilerMap;
  formatters?: FormatterMap;
}

export type ParserFn<T extends Token = any, U extends SyntaxNode = any> = (
  token: T,
  parser: Parser,
) => Generator<U | 'NEXT' | void>;
export type ParserMap = Record<string, string | ParserFn>;

export type CompilerFn<T extends SyntaxNode = any> = (
  node: T,
  compiler: Compiler,
) => MaybePromise<void>;
export type CompilerMap = Record<string, string | CompilerFn>;

export type FormatterFn<T extends SyntaxNode = any> = (node: T) => string;
export type FormatterMap = Record<string, string | FormatterFn>;

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

export interface FormatterOptions extends ParserOptions {
  trimWhitespace?: boolean;
  stripComments?: boolean;
}

export interface CacheOptions {
  enabled?: boolean;
  maxSize?: number;
  ttl?: number;
  /**
   * Re-read included templates through the loader on every cache hit and
   * recompile when one of them changed. Disable when templates are immutable
   * at runtime to skip those loader calls.
   * @default true
   */
  revalidate?: boolean;
}

export interface RendererOptions extends CompilerOptions {
  globals?: ObjectType;
  autoEscape?: boolean;
  cache?: CacheOptions;
  security?: SecurityOptions;
}

/**
 * Define filters with their value and argument types checked, e.g.
 * `defineFilters({ shout: (value: string, times = 1) => ... })`.
 */
export function defineFilters<T extends Filters>(filters: T): T {
  return filters;
}

/**
 * Define a plugin (filters, parsers and compilers) with its shape checked.
 */
export function definePlugin<T extends Plugin>(plugin: T): T {
  return plugin;
}
