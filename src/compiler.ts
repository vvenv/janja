import type { Config, Tag } from './types'
import { CompileError } from './compile-error'
import { Context } from './context'
import { OutScript } from './out-script'
import { SourceMap } from './source-map'

export class Compiler {
  constructor(public options: Config) {}

  async compile(tag: Tag | null, filepath?: string) {
    const ctx = new Context(this.options)
    const out = new OutScript(this.options)
    const sourcemap = new SourceMap(this.options)

    out.start()

    while (tag) {
      const compilers = (this.options.compilers![tag.name] ?? [])

      for (const compiler of compilers) {
        try {
          const r = await compiler.compile(
            {
              tag,
              ctx,
              out,
            },
          )

          if (r !== false) {
            if (r) {
              sourcemap.addMapping(tag, r)
            }

            break
          }
        }
        catch (error: any) {
          throw new CompileError(error.message, tag, filepath)
        }
      }

      tag = tag.next
    }

    try {
      ctx.validate()
    }
    catch (error: any) {
      throw new CompileError(error.message, {
        raw: '',
        start: 0,
        end: 0,
      } as Tag, filepath)
    }

    out.end()

    return { value: out.value, script: out.script, sourcemap }
  }
}
