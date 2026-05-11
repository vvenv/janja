import { Renderer } from './renderer';
import type { ObjectType } from './types';

export interface MixinDefinition {
  name: string;
  template: string;
  data?: ObjectType;
}

export interface MixinOptions {
  data?: ObjectType;
  options?: any;
}

export class MixinRegistry {
  private mixins: Map<string, MixinDefinition> = new Map();

  register(mixin: MixinDefinition): void {
    this.mixins.set(mixin.name, mixin);
  }

  registerMultiple(mixins: MixinDefinition[]): void {
    for (const mixin of mixins) {
      this.register(mixin);
    }
  }

  get(name: string): MixinDefinition | undefined {
    return this.mixins.get(name);
  }

  has(name: string): boolean {
    return this.mixins.has(name);
  }

  delete(name: string): boolean {
    return this.mixins.delete(name);
  }

  clear(): void {
    this.mixins.clear();
  }

  list(): string[] {
    return Array.from(this.mixins.keys());
  }
}

export const globalMixinRegistry = new MixinRegistry();

export async function applyMixin(
  name: string,
  options: MixinOptions = {},
  registry: MixinRegistry = globalMixinRegistry,
): Promise<string> {
  const mixin = registry.get(name);

  if (!mixin) {
    throw new Error(`Mixin "${name}" not found in registry`);
  }

  const { data = {}, options: renderOptions } = options;
  const mergedData = { ...mixin.data, ...data };
  const renderer = new Renderer(renderOptions);

  return renderer.render(mixin.template, mergedData);
}

export async function applyMixins(
  names: string[],
  options: MixinOptions = {},
  registry: MixinRegistry = globalMixinRegistry,
): Promise<string[]> {
  const results: string[] = [];

  for (const name of names) {
    const result = await applyMixin(name, options, registry);

    results.push(result);
  }

  return results;
}

export async function extendTemplateWithMixin(
  baseTemplate: string,
  mixinName: string,
  options: MixinOptions = {},
  registry: MixinRegistry = globalMixinRegistry,
): Promise<string> {
  const mixinContent = await applyMixin(mixinName, options, registry);
  const renderer = new Renderer({ ...options.options, autoEscape: false });

  return renderer.render(baseTemplate, { _mixin: mixinContent });
}

export function createMixin(
  name: string,
  template: string,
  data?: ObjectType,
): MixinDefinition {
  return {
    name,
    template,
    data,
  };
}
