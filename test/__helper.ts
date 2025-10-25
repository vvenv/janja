import type { Config } from '../src/types'
import { Compiler } from '../src/compiler'
import { config } from '../src/config'
import { Engine } from '../src/engine'
import { Parser } from '../src/parser'

export async function compile(
  template: string,
  options?: Config,
): Promise<any> {
  const opt = { ...config, ...options }
  const { value } = await new Compiler(opt).compile(
    await new Parser(opt).parse(template),
  )

  return value
}

export async function render(
  template: string,
  data: Record<string, any> = {},
  options?: Config,
): Promise<any> {
  return new Engine({ ...config, ...options }).render(template, data)
}
