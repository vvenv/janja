import type { Config } from '../src/types'
import { Compiler } from '../src/compiler'
import { config } from '../src/config'
import { Engine } from '../src/engine'
import { Tokenizer } from '../src/tokenizer'

export async function compile(
  template: string,
  options?: Config,
): Promise<any> {
  if (options?.debug && !(options as any).__debug) {
    (options as any).__debug = true

    return await (async () => {
      try {
        return await compile(template, options)
      }
      catch (error: any) {
        return error.details ?? error.message
      }
    })()
  }

  const opt = { ...config, ...options }
  const { value } = await new Compiler(opt).compile(
    await new Tokenizer(opt).parse(template),
  )

  return value
}

export async function render(
  template: string,
  data: Record<string, any>,
  options?: Config,
): Promise<any> {
  if (options?.debug && !(options as any).__debug) {
    (options as any).__debug = true

    return await (async () => {
      try {
        return await render(template, data, options)
      }
      catch (error: any) {
        return error.details ?? error.message
      }
    })()
  }

  return new Engine({ ...config, ...options }).render(template, data)
}
