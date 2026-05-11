import { Renderer } from './renderer';
import type { ObjectType } from './types';

export interface CompositionOptions {
  data?: ObjectType;
  options?: any;
}

/**
 * Compose multiple templates together, passing the output of one as input to the next.
 */
export async function composeTemplates(
  templates: string[],
  options: CompositionOptions = {},
): Promise<string> {
  let result = '';

  const { data = {}, options: renderOptions } = options;
  const renderer = new Renderer(renderOptions);

  for (const template of templates) {
    result = await renderer.render(template, { ...data, _content: result });
  }

  return result;
}

/**
 * Compose templates with partial data, allowing each template to access specific data.
 */
export async function composeTemplatesWithData(
  templates: Array<{ template: string; data?: ObjectType }>,
  options: CompositionOptions = {},
): Promise<string> {
  let result = '';

  const { options: renderOptions } = options;
  const renderer = new Renderer(renderOptions);

  for (const item of templates) {
    const mergedData = { ...item.data, _content: result };

    result = await renderer.render(item.template, mergedData);
  }

  return result;
}

/**
 * Create a template composition pipeline.
 */
export class TemplatePipeline {
  private templates: string[] = [];

  private data: ObjectType = {};

  private options: any;

  constructor(options?: any) {
    this.options = options;
  }

  addTemplate(template: string): TemplatePipeline {
    this.templates.push(template);

    return this;
  }

  setData(data: ObjectType): TemplatePipeline {
    this.data = { ...this.data, ...data };

    return this;
  }

  setOptions(options: any): TemplatePipeline {
    this.options = { ...this.options, ...options };

    return this;
  }

  async execute(): Promise<string> {
    return composeTemplates(this.templates, {
      data: this.data,
      options: this.options,
    });
  }
}

/**
 * Compose templates in a layout pattern (header, content, footer).
 */
export async function composeLayout(
  layout: string,
  content: string,
  options: CompositionOptions = {},
): Promise<string> {
  const { data = {}, options: renderOptions } = options;
  const renderer = new Renderer({ ...renderOptions, autoEscape: false });

  const renderedContent = await renderer.render(content, data);

  return renderer.render(layout, { ...data, content: renderedContent });
}

/**
 * Compose templates with slots for flexible content placement.
 */
export async function composeWithSlots(
  template: string,
  slots: Record<string, string>,
  options: CompositionOptions = {},
): Promise<string> {
  const { data = {}, options: renderOptions } = options;
  const renderer = new Renderer({ ...renderOptions, autoEscape: false });

  // Render each slot
  const renderedSlots: Record<string, string> = {};

  for (const [key, slotTemplate] of Object.entries(slots)) {
    renderedSlots[key] = await renderer.render(slotTemplate, data);
  }

  // Render main template with slots
  return renderer.render(template, { ...data, slots: renderedSlots });
}
