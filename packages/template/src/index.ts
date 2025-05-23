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

export async function template(template: string, data: ObjectType, options?: EngineOptions) {
  return (await (await (await new Engine(options).initialize(template)).parse()).compile()).render(data)
}
