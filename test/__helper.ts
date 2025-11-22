import { Compiler } from '../src/compiler';
import { Parser } from '../src/parser';
import { Renderer } from '../src/renderer';
import { Tokenizer } from '../src/tokenizer';
import type { ObjectType, RendererOptions } from '../src/types';
import { fileLoader } from './loaders/file-loader';

const loader = async (_path: string) =>
  fileLoader(`test/templates/${_path}.janja`);
const debug = (error: Error) => {
  throw error;
};

export async function tokenize(template: string, options?: RendererOptions) {
  return new Tokenizer({
    ...options,
    debug,
  }).tokenize(template);
}

export async function parse(template: string, options?: RendererOptions) {
  return new Parser({
    ...options,
    debug,
  }).parse(template);
}

export async function compile(template: string, options?: RendererOptions) {
  const { code } = await new Compiler({
    ...options,
    loader,
    debug,
  }).compile(template);

  return code;
}

export async function render(
  template: string,
  data: ObjectType = {},
  options?: RendererOptions,
) {
  return new Renderer({
    ...options,
    loader,
    debug,
  }).render(template, data);
}

export async function renderFile(
  filepath: string,
  data: ObjectType = {},
  options?: RendererOptions,
) {
  return new Renderer({
    ...options,
    loader,
    debug,
  }).renderFile(filepath, data);
}
