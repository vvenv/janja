import { RendererOptions } from './options';
import { Renderer } from './renderer';
import type { ObjectType } from './types';

export * from './renderer';
export type * from './types';
export type * from './exp/exp-types';

export async function render(
  template: string,
  data: ObjectType,
  options?: RendererOptions,
) {
  return new Renderer(options).render(template, data);
}

export async function renderFile(
  filepath: string,
  data: ObjectType,
  options?: RendererOptions,
) {
  return new Renderer(options).renderFile(filepath, data);
}
