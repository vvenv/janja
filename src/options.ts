import * as filters from './filters';
import { plugins } from './plugins';
import type {
  CompilerMap,
  Filters,
  ObjectType,
  ParserMap,
  Plugin,
} from './types';

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

export const baseOptions: Required<BaseOptions> = {
  filters,
  parsers: {},
  compilers: {},
  plugins,
  debug: () => {},
};

export const parserOptions: Required<ParserOptions> = {
  ...baseOptions,
  commentOpen: '{{#',
  commentClose: '}}',
  directiveOpen: '{{',
  directiveClose: '}}',
  outputOpen: '{{=',
  outputClose: '}}',
};

export const compilerOptions: Required<CompilerOptions> = {
  ...parserOptions,
  trimWhitespace: false,
  stripComments: false,
  loader: async () => '',
};

export const renderOptions: Required<RendererOptions> = {
  ...compilerOptions,
  globals: {},
  autoEscape: true,
};

export const mergeOptions = <
  T extends Required<BaseOptions>,
  U extends RendererOptions,
>(
  defaultOptions: T,
  options?: U,
): Required<U> => {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
  } as Required<T & U>;

  defaultOptions.plugins?.forEach((plugin) => {
    Object.assign(mergedOptions.filters, plugin.filters ?? {});
    Object.assign(mergedOptions.parsers, plugin.parsers ?? {});
    Object.assign(mergedOptions.compilers, plugin.compilers ?? {});
  });

  options?.plugins?.forEach((plugin) => {
    Object.assign(mergedOptions.filters, plugin.filters ?? {});
    Object.assign(mergedOptions.parsers, plugin.parsers ?? {});
    Object.assign(mergedOptions.compilers, plugin.compilers ?? {});
  });

  return mergedOptions;
};
