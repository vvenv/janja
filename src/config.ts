import type { Config } from './types'
import * as filters from './filters'
import { loader } from './loaders/url-loader'
import { compilers } from './tag-compilers'

export const config: Required<Config> = {
  globals: {
    translations: {},
  },
  filters: { ...filters },
  compilers: { ...compilers },
  autoEscape: true,
  strictMode: true,
  stripComments: false,
  trimWhitespace: false,
  loader,
  cache: false,
}
