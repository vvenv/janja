import type { Config } from './types'
import * as filters from './filters'
import { loader } from './loaders/url-loader'
import { tags } from './tags'

export const config: Required<Config> = {
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
