import type {
  BaseOptions,
  CompilerOptions,
  ParserOptions,
  Plugin,
  RendererOptions,
} from './types';

export const baseOptions: Required<BaseOptions> = {
  filters: {},
  parsers: {},
  compilers: {},
  plugins: [],
  debug: () => {},
};

export const parserOptions: Required<ParserOptions> = {
  ...baseOptions,
  commentOpen: '{{#',
  commentClose: '#}}',
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
  ...optionsArray: U[]
): Required<U> => {
  const mergedOptions = {
    ...defaultOptions,
  } as Required<T & U>;

  const mergePlugins = (plugin: Plugin) => {
    mergedOptions.filters = {
      ...mergedOptions.filters,
      ...plugin.filters,
    };
    mergedOptions.parsers = {
      ...mergedOptions.parsers,
      ...plugin.parsers,
    };
    mergedOptions.compilers = {
      ...mergedOptions.compilers,
      ...plugin.compilers,
    };
  };

  defaultOptions.plugins?.forEach(mergePlugins);

  optionsArray.forEach(({ plugins, ...options }) => {
    Object.assign(mergedOptions, options);
    plugins?.forEach(mergePlugins);
  });

  return mergedOptions;
};
