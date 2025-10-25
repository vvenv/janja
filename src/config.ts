import type { Config } from './types'
import { compilers } from './compilers'
import * as filters from './filters'
import { loader } from './loaders/url-loader'

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
