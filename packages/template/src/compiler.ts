import type { EngineOptions, Script, Token } from './types'
import { CompileError } from './compile-error'
import { Context } from './context'
import { OutScript } from './out-script'
import { SourceMap } from './source-map'
import { Validator } from './validator'

export class Compiler {
  constructor(public options: Required<EngineOptions>) {}

  async compile(token: Token | null, filepath?: string) {
    const ctx = new Context(this.options)
    const out = new OutScript(this.options)
    const sourcemap = new SourceMap(this.options)
    const validator = new Validator(this.options)

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
              validator,
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
          if (this.options.debug) {
            throw new CompileError(error.message, token, filepath)
          }

          return { value: '', script: (async () => 'invalid template') as unknown as Script, sourcemap }
        }
      }

      token = token.next
    }

    try {
      validator.validate()
    }
    catch (error: any) {
      if (this.options.debug) {
        throw error
      }

      return { value: '', script: (async () => 'invalid template') as unknown as Script, sourcemap }
    }

    out.end()

    return { value: out.value, script: out.script, sourcemap }
  }
}
