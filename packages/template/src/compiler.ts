import type { Config, Token } from './types'
import { CompileError } from './compile-error'
import { Context } from './context'
import { OutScript } from './out-script'
import { SourceMap } from './source-map'

export class Compiler {
  constructor(public options: Required<Config>) {}

  async compile(token: Token | null, filepath?: string) {
    const ctx = new Context(this.options)
    const out = new OutScript(this.options)
    const sourcemap = new SourceMap(this.options)

    out.start()
    let i = 0

    while (token) {
      const tags = (this.options.tags[token.name] ?? [])

      for (const tag of tags) {
        try {
          const r = await tag.compile(
            {
              token,
              index: i++,
              ctx,
              out,
            },
          )

          if (r !== false) {
            if (r) {
              sourcemap.addMapping(token, r)
            }

            break
          }
        }
        catch (error: any) {
          throw new CompileError(error.message, token, filepath)
        }
      }

      token = token.next
    }

    ctx.validate()

    out.end()

    return { value: out.value, script: out.script, sourcemap }
  }
}
