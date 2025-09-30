import type { SourceMap } from './source-map'
import type { EngineOptions, Filters, Globals, Render, Script, Tag } from './types'
import { Compiler } from './compiler'
import { escape } from './escape'
import * as filters from './filters'
import * as helpers from './helpers'
import { loader } from './loaders/url-loader'
import { RenderError } from './render-error'
import { Safe } from './safe'
import { tags } from './tags'
import { Tokenizer } from './tokenizer'

export const defaultOptions: Required<EngineOptions> = {
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

const cache = new Map<string, Render>()

export class Engine {
  protected options: Required<EngineOptions>

  constructor({ globals, filters, tags, ...options }: EngineOptions = {}) {
    this.options = { ...defaultOptions, ...options }
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

  async load(filepath: string) {
    if (this.options.cache && cache.has(filepath)) {
      return cache.get(filepath)
    }

    const template = await this.options.loader!(filepath)

    return {
      template,
      compile: async () => this.compile(template, filepath),
    }
  }

  async compile(template: string, filepath?: string) {
    const { value, script, sourcemap } = await new Compiler(this.options).compile(
      await new Tokenizer(this.options).parse(template),
    )

    const render = async (globals: Globals) => this.render(globals, script, template, sourcemap)

    if (this.options.cache && filepath) {
      cache.set(filepath, render)
    }

    return {
      value,
      script,
      sourcemap,
      render,
    }
  }

  async render(
    globals: Globals,
    func: Script,
    template: string,
    sourcemap: SourceMap,
  ) {
    try {
      return await func(
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

      return ''
    }
  }
}
