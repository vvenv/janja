import type { Config } from './types'
import * as filters from './filters'
import { loader as fileLoader } from './loaders/file-loader'
import { loader as urlLoader } from './loaders/url-loader'
import { tags } from './tags'

export const CONTEXT = 'c'
export const FILTERS = 'f' // Filters can be async
export const ESCAPE = 'e'
export const HELPERS = 'h'

export const BLOCK = ['block']
export const SUPER = ['super']
export const END_BLOCK = ['endblock']

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
  loader: typeof window === 'undefined' ? fileLoader : urlLoader,
  cache: false,
}
