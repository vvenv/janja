import { AST, BaseTag, EndTag, StartTag } from './ast';
import { OutScript } from './out-script';
import { Parser } from './parser';
import { Location } from './source-map';

export type MaybePromise<T> = T | Promise<T>;

export interface EngineOptions {
  debug?: boolean;
  globals?: Globals;
  filters?: Filters;
  tags?: Tag[];
  strictMode?: boolean;
  autoEscape?: boolean;
  stripComments?: boolean;
  start?: string;
  end?: string;
  loader?: (path: string) => Promise<string>;
}

export interface Globals {
  translations?: Record<string, string>;
  [key: string]: any;
}

export type Filters = Record<string, Filter>;

export interface Filter {
  (value: any, ...args: any[]): any;
}

export type ParsedFunction = (
  globals: Globals,
  filters: Filters,
  escape: (v: unknown) => unknown,
) => Promise<string>;

export interface Tag {
  priority?: number;

  names: string[];

  /**
   * - void: handled by the parser
   * - false: not handled by the parser
   */
  parse(arg: { ast: AST; base: BaseTag }): MaybePromise<void | false>;

  compile(
    arg: {
      parser: Parser;
      template: string;
      tag: StartTag | EndTag;
      context: string;
      ast: AST;
      out: OutScript;
    },
    compileContent: (arg: {
      template: string;
      tag: StartTag;
      context: string;
      out: OutScript;
    }) => Promise<void>,
  ): MaybePromise<void | false | Location>;
}
