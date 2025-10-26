import type { Config } from './types'
import * as filters from './filters'
import { compilers } from './tag-compilers'

export const config: Config = {
  globals: {
    translations: {},
  },
  filters: { ...filters },
  compilers: { ...compilers },
  autoEscape: true,
  strictMode: true,
  stripComments: false,
  trimWhitespace: false,
}
