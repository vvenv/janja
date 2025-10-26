import type { Config } from '../src/types'
import { Compiler } from '../src/compiler'
import { config } from '../src/config'
import { render as _render, renderFile as _renderFile } from '../src/index'
import { Parser } from '../src/parser'

export async function parse(
  template: string,
  options?: Config,
): Promise<any> {
  return new Parser({ ...config, ...options }).parse(template)
}

export async function compile(
  template: string,
  options?: Config,
): Promise<any> {
  const opt = { ...config, ...options }
  const { value } = await new Compiler(opt).compile(
    await parse(template, options),
  )

  return value
}

export async function render(
  template: string,
  data: Record<string, any> = {},
  options?: Config,
): Promise<any> {
  return _render(template, data, { ...config, ...options })
}

export async function renderFile(
  filepath: string,
  data: Record<string, any> = {},
  options?: Config,
): Promise<any> {
  return _renderFile(filepath, data, { ...config, ...options })
}
