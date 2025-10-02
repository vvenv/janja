import type { Config } from './types'
import * as filters from './filters'
import { loader } from './loaders/url-loader'
import { tags } from './tags'

export const CONTEXT = 'c'
export const FILTERS = 'f' // Filters can be async
export const ESCAPE = 'e'
export const HELPERS = 'h'

export const BLOCK = ['block', '#block']
export const SUPER = ['super']
export const END_BLOCK = ['end_block', 'endblock', '/block']

export const config: Required<Config> = {
  debug: false,
  globals: {
    translations: {},
  },
  filters: { ...filters },
  tags: { ...tags },
  autoEscape: true,
  strictMode: true,
  stripComments: false,
  trimWhitespace: false,
  loader,
  cache: false,
}
