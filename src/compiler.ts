import type { Config, TagToken } from './types'
import { CompileError } from './compile-error'
import { Context } from './context'
import { OutScript } from './out-script'
import { SourceMap } from './source-map'

export class Compiler {
  constructor(public options: Config) {}

  async compile(tagToken: TagToken | null, filepath?: string) {
    const ctx = new Context(this.options)
    const out = new OutScript(this.options)
    const sourcemap = new SourceMap(this.options)

    out.start()

    while (tagToken) {
      const compilers = (this.options.compilers![tagToken.name] ?? [])

      for (const compiler of compilers) {
        try {
          const r = await compiler.compile(
            {
              token: tagToken,
              ctx,
              out,
            },
          )

          if (r !== false) {
            if (r) {
              sourcemap.addMapping(tagToken, r)
            }

            break
          }
        }
        catch (error: any) {
          throw new CompileError(error.message, tagToken, filepath)
        }
      }

      tagToken = tagToken.next
    }

    try {
      ctx.validate()
    }
    catch (error: any) {
      throw new CompileError(error.message, {
        raw: '',
        start: 0,
        end: 0,
      } as TagToken, filepath)
    }

    out.end()

    return { value: out.value, script: out.script, sourcemap }
  }
}
