import type { EngineOptions } from '../src/types'
import { defaultOptions, Engine } from '../src/engine'

export async function parse(template: string, options?: EngineOptions): Promise<any> {
  if (options?.debug && !(options as any).__debug) {
    (options as any).__debug = true
    return await (async () => {
      try {
        return await parse(template, options)
      }
      catch (error: any) {
        return error.details ?? error.message
      }
    })()
  }

  const { parse: _parse } = await new Engine({ ...defaultOptions, ...options }).initialize(template)
  return _parse()
}

export async function compile(template: string, options?: EngineOptions, returnObject = false): Promise<any> {
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

  const obj = await (await parse(template, options)).compile()
  return returnObject ? obj : obj.value
}

export async function render(template: string, data: Record<string, any>, options?: EngineOptions): Promise<any> {
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

  return (await compile(template, options, true)).render(data)
}
