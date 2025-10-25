import type { SourceMap } from './source-map'
import type { Config, Globals, ObjectType, Script } from './types'
import { Compiler } from './compiler'
import { config } from './config'
import { escape } from './escape'
import * as filters from './filters'
import { Parser } from './parser'
import { RenderError } from './render-error'
import { Safe } from './safe'

const cache = new Map<string, {
  template: string
  script: Script
  sourcemap: SourceMap
}>()

export class Engine {
  protected options: Required<Config>

  constructor({ globals, filters, compilers, ...options }: Config = {}) {
    this.options = { ...config, ...options }
    Object.assign(this.options.globals, globals)
    Object.assign(this.options.filters, filters)
    Object.assign(this.options.compilers, compilers)
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
    return new Compiler(this.options).compile(
      await new Parser(this.options).parse(template),
      filepath,
    )
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
      )
    }
    catch (error: any) {
      throw new RenderError(error.message, {
        source: template,
        error,
        sourcemap,
      })
    }
  }
}

export type * from './types'

export async function render(template: string, data: ObjectType, options?: Config) {
  return new Engine(options).render(template, data)
}

export async function renderFile(filepath: string, data: ObjectType, options?: Config) {
  return new Engine(options).renderFile(filepath, data)
}
