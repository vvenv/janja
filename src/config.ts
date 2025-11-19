import type { CompilerOptions, ParserOptions, RendererOptions } from './types'
import { parsers } from './directive-parsers'
import * as filters from './filters'
import { compilers } from './node-compilers'

export const parserOptions: Required<ParserOptions> = {
  commentOpen: '{{#',
  commentClose: '}}',
  directiveOpen: '{{',
  directiveClose: '}}',
  outputOpen: '{{=',
  outputClose: '}}',
  parsers,
  debug: () => {},
}

export const compilerOptions: Required<CompilerOptions> = {
  ...parserOptions,
  trimWhitespace: false,
  stripComments: false,
  compilers,
  loader: async () => '',
}

export const renderOptions: Required<RendererOptions> = {
  ...compilerOptions,
  globals: {},
  filters,
  autoEscape: true,
  plugins: [],
}
