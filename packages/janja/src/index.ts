import { Renderer } from './renderer';
import type { ObjectType, RendererOptions } from './types';

export * from './types';
export * from './exp/exp-types';
export * from './compile-error';
export * from './compiler';
export * from './options';
export * from './parser';
export * from './render-error';
export * from './renderer';
export * from './safe';
export * from './syntax-nodes';
export * from './tokenizer';
export * from './exp/exp-compiler';
export * from './exp/exp-error';
export * from './exp/exp-parser';
export * from './exp/exp-tokenizer';

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
