import type { SourceMap } from './source-map'
import type { EngineOptions, Filters, Globals, ParsedScript, Tag } from './types'
import { Compiler } from './compiler'
import { escape } from './escape'
import * as filters from './filters'
import * as helpers from './helpers'
import { loader } from './loaders/url-loader'
import { Parser } from './parser'
import { RuntimeError } from './runtime-error'
import { Safe } from './safe'
import { tags } from './tags'

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
}

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

  async initialize(template: string) {
    template = await this.handlePartial(template)

    return {
      template,
      parse: async () => this.parse(template),
    }
  }

  async parse(template: string) {
    const parser = await new Parser(this.options).parse(template)

    return {
      parser,
      compile: async () => this.compile(template, parser),
    }
  }

  async compile(template: string, parser: Parser) {
    const { value, script, sourcemap } = await new Compiler(this.options).compile(
      template,
      parser,
    )

    return {
      value,
      script,
      sourcemap,
      render: async (globals: Globals) => this.render(globals, script, template, sourcemap),
    }
  }

  async render(
    globals: Globals,
    func: ParsedScript,
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
        throw new RuntimeError(error.message, {
          source: template,
          error,
          sourcemap,
        })
      }

      return ''
    }
  }

  private async handlePartial(template: string) {
    const partialRe
      = /\{\{(-)? (layout|include) (['"`])((?:\\\3|(?!\3).)*)\3 (-)?\}\}/gs
    let match
    // eslint-disable-next-line no-cond-assign
    while ((match = partialRe.exec(template))) {
      if (match[2] === 'layout') {
        template = this.replaceTemplate(template, await this.options.loader!(`layouts/${match[4]}.jianjia`), match)
      }
      else if (match[2] === 'include') {
        template = this.replaceTemplate(template, await this.options.loader!(`partials/${match[4]}.jianjia`), match)
      }
    }

    return template
  }

  private replaceTemplate(template: string, partial: string, match: RegExpExecArray) {
    const before = template.slice(0, match.index)
    const after = template.slice(match.index + match[0].length)
    const stripBefore = match[1] === '-' || this.options.trimWhitespace
    const stripAfter = match[5] === '-' || this.options.trimWhitespace
    return `${stripBefore ? before.trimEnd() : before}${partial}${stripAfter ? after.trimStart() : after}`
  }
}
