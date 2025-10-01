import type { Config, ObjectType } from './types'
import { Engine } from './engine'

export * from './engine'
export type * from './types'

export async function render(template: string, data: ObjectType, options?: Config) {
  return new Engine(options).render(template, data)
}

export async function renderFile(filepath: string, data: ObjectType, options?: Config) {
  return new Engine(options).renderFile(filepath, data)
}
