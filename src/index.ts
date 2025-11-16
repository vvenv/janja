import type { ObjectType, RendererOptions } from './types'
import { Renderer } from './renderer'

export * from './renderer'
export type * from './types'

export async function render(template: string, data: ObjectType, options?: RendererOptions) {
  return new Renderer(options).render(template, data)
}

export async function renderFile(filepath: string, data: ObjectType, options?: RendererOptions) {
  return new Renderer(options).renderFile(filepath, data)
}
