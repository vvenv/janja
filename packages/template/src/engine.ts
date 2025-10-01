import type { SourceMap } from './source-map'
import type { Config, Filters, Globals, Script, Tag } from './types'
import { Compiler } from './compiler'
import { config } from './config'
import { escape } from './escape'
import * as filters from './filters'
import * as helpers from './helpers'
import { RenderError } from './render-error'
import { Safe } from './safe'
import { Tokenizer } from './tokenizer'

const cache = new Map<string, {
  template: string
  script: Script
  sourcemap: SourceMap
}>()

export class Engine {
  protected options: Required<Config>

  constructor({ globals, filters, tags, ...options }: Config = {}) {
    this.options = { ...config, ...options }
    this.registerGlobals(globals)
    this.registerFilters(filters)
    this.registerTags(tags)
  }

  registerGlobals(globals?: Globals) {
    Object.assign(this.options.globals, globals)
  }

  registerFilters(filters?: Filters) {
    Object.assign(this.options.filters, filters)
  }

  registerTags(tags?: Record<string, Tag[]>) {
    Object.assign(this.options.tags, tags)
  }

  async render(
    template: string,
    globals: Globals,
  ) {
    const { script, sourcemap } = await this._compile(template)
    return this._render(template, globals, script, sourcemap)
  }

  async renderFile(filepath: string, globals: Globals) {
    if (this.options.cache && cache.has(filepath)) {
      const { template, script, sourcemap } = cache.get(filepath)!
      return this._render(template, globals, script, sourcemap)
    }

    const template = await this.options.loader!(filepath)
    const { script, sourcemap } = await this._compile(template)
    if (this.options.cache) {
      cache.set(filepath, { template, script, sourcemap })
    }
    return this._render(template, globals, script, sourcemap)
  }

  private async _compile(template: string, filepath?: string) {
    try {
      return await new Compiler(this.options).compile(
        await new Tokenizer(this.options).parse(template),
        filepath,
      )
    }
    catch (error: any) {
      if (this.options.debug) {
        throw error
      }

      return {
        script: async () => 'compile error',
        sourcemap: {} as SourceMap,
      }
    }
  }

  private async _render(
    template: string,
    globals: Globals,
    script: Script,
    sourcemap: SourceMap,
  ) {
    try {
      return await script(
        { ...this.options.globals, ...globals },
        { ...this.options.filters, ...filters },
        (v: unknown) => {
          if (v instanceof Safe) {
            return `${v}`
          }

          return this.options.autoEscape ? escape(v) : v
        },
        helpers,
      )
    }
    catch (error: any) {
      if (this.options.debug) {
        throw new RenderError(error.message, {
          source: template,
          error,
          sourcemap,
        })
      }

      return 'render error'
    }
  }
}
