import { Renderer } from './renderer';
import type { ObjectType, RendererOptions, Script } from './types';

export * from './types';
export * as filters from './filters';
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
export * from './precompile';
export * from './source-map-v3';
export * from './i18n';
export * from './compose';
export * from './whitespace';
export * from './mixins';
export * from './validator';
export * from './analyze';
export * from './format';
export * from './file-loader';
export * from './error-recovery';

// Renderers are reused between calls so that their compile cache is too: one
// for calls without options, and one per options object.
let defaultRenderer: Renderer | undefined;

const renderers = new WeakMap<RendererOptions, Renderer>();

function getRenderer(options?: RendererOptions) {
  if (!options) {
    return (defaultRenderer ??= new Renderer());
  }

  let renderer = renderers.get(options);

  if (!renderer) {
    renderer = new Renderer(options);
    renderers.set(options, renderer);
  }

  return renderer;
}

export async function render(
  template: string,
  data: ObjectType,
  options?: RendererOptions,
) {
  return getRenderer(options).render(template, data);
}

export async function renderFile(
  filepath: string,
  data: ObjectType,
  options?: RendererOptions,
) {
  return getRenderer(options).renderFile(filepath, data);
}

/**
 * Render a template that was compiled ahead of time by `precompileTemplate`.
 */
export async function renderCompiled(
  script: Script,
  data: ObjectType = {},
  options?: RendererOptions,
) {
  return getRenderer(options).renderCompiled(script, data);
}

/**
 * Render a template as a stream of chunks. See `Renderer.renderStream`.
 */
export function renderStream(
  template: string,
  data: ObjectType = {},
  options?: RendererOptions,
) {
  return getRenderer(options).renderStream(template, data);
}
