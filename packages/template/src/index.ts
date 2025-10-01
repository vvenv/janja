import type { EngineOptions, ObjectType } from './types'
import { Engine } from './engine'

export * from './compiler'
export * from './config'
export * from './engine'
export * from './out-script'
export * from './safe'
export * from './source-map'
export * from './tags'
export type * from './types'
export * from './utils'

export async function render(template: string, data: ObjectType, options?: EngineOptions) {
  return new Engine(options).render(template, data)
}

export async function renderFile(filepath: string, data: ObjectType, options?: EngineOptions) {
  return new Engine(options).renderFile(filepath, data)
}
