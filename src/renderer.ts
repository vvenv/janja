import type { ObjectType, RendererOptions } from './types'
import { Compiler } from './compiler'
import { renderOptions } from './config'
import { escape } from './escape'
import * as filters from './filters'
import { RenderError } from './render-error'
import { Safe } from './safe'

export class Renderer {
  protected options: Required<RendererOptions>

  constructor({ globals, filters, parsers, compilers, ...options }: RendererOptions = {}) {
    this.options = { ...renderOptions, ...options }
    Object.assign(this.options.globals!, globals)
    Object.assign(this.options.filters!, filters)
    Object.assign(this.options.parsers!, parsers)
    Object.assign(this.options.compilers!, compilers)
  }

  async render(
    template: string,
    globals: ObjectType,
  ) {
    const compiler = new Compiler(this.options)

    try {
      await compiler.compile(template)

      return await compiler.script(
        { ...this.options.globals, ...globals },
        (v: unknown) => {
          if (v instanceof Safe) {
            return `${v}`
          }

          return this.options.autoEscape ? escape(v) : v
        },
        { ...this.options.filters, ...filters },
      )
    }
    catch (error: any) {
      if (error.name === 'CompileError') {
        throw error
      }
      throw new RenderError(
        error.message,
        template,
        () => {
          const matched = error.stack!.match(/<anonymous>:(\d+):(\d+)\)/)
          if (!matched) {
            return error.stack ?? ''
          }
          const [loc] = compiler.getSourceLoc(
            {
              line: +matched[1] - 2,
              column: +matched[2],
            },
          )
          return loc
        },
      )
    }
  }

  async renderFile(filepath: string, globals: ObjectType) {
    return this.render(await this.options.loader!(filepath), globals)
  }
}
