import type { EngineOptions, ObjectType } from './types'
import { Engine } from './engine'

export * from './compiler'
export * from './config'
export * from './engine'
export * from './out-script'
export * from './parser'
export * from './safe'
export * from './source-map'
export * from './tags'
export type * from './types'
export * from './utils'

export async function render(template: string, data: ObjectType, options?: EngineOptions) {
  return (await (await (await new Engine(options).initialize(template)).parse()).compile()).render(data)
}

export async function renderFile(filepath: string, data: ObjectType, options?: EngineOptions) {
  const rf = await new Engine(options).load(filepath)
  return typeof rf === 'function' ? rf(data) : (await (await (await rf!.initialize()).parse()).compile()).render(data)
}
