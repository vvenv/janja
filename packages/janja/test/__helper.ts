import { Compiler } from '../src/compiler';
import * as filters from '../src/filters';
import { Formatter } from '../src/formatter';
import { mergeOptions, renderOptions } from '../src/options';
import { Parser } from '../src/parser';
import { plugins } from '../src/plugins';
import { Renderer } from '../src/renderer';
import { Tokenizer } from '../src/tokenizer';
import type { ObjectType, RendererOptions } from '../src/types';
import { fileLoader } from './loaders/file-loader';

const loader = async (_path: string) =>
  fileLoader(`test/templates/${_path}.janja`);
const debug = (error: Error) => {
  throw error;
};
const makeOptions = (options: RendererOptions = {}) =>
  mergeOptions(
    renderOptions,
    {
      filters,
      plugins,
      debug,
      loader,
    },
    options,
  );

export function tokenize(template: string, options?: RendererOptions) {
  return new Tokenizer(makeOptions(options)).tokenize(template);
}

export function parse(template: string, options?: RendererOptions) {
  return new Parser(makeOptions(options)).parse(template);
}

export function format(template: string, options?: RendererOptions) {
  return new Formatter(makeOptions(options)).format(
    parse(template, options).body[0],
  );
}

export async function compile(template: string, options?: RendererOptions) {
  const { code } = await new Compiler(makeOptions(options)).compile(template);

  return code;
}

export async function render(
  template: string,
  data: ObjectType = {},
  options?: RendererOptions,
) {
  return new Renderer(makeOptions(options)).render(template, data);
}

export async function renderFile(
  filepath: string,
  data: ObjectType = {},
  options?: RendererOptions,
) {
  return new Renderer(makeOptions(options)).renderFile(filepath, data);
}
