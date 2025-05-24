import { AST, BaseTag, EndTag, StartTag } from './ast';
import { OutScript } from './out-script';
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

  /**
   * - void: handled by the parser
   * - false: not handled by the parser
   */
  parse(
    this: AST,
    tag: BaseTag,
    /**
     * The content of the tag, without tags and whitespaces.
     */
    content: string,
    /**
     * The original tag statement, with tags and whitespaces.
     */
    original: string,
  ): void | false;

  compile(
    this: AST,
    template: string,
    tag: StartTag | EndTag,
    context: string,
    out: OutScript,
    compileContent: (
      template: string,
      tag: StartTag,
      context: string,
      ast: AST,
      out: OutScript,
    ) => Promise<void>,
  ): MaybePromise<void | false | Location>;

  format?(this: AST, tag: StartTag | EndTag): string;
}
