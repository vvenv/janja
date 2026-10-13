import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { type CompilerOptions, precompile } from 'janja';
import type { Plugin } from 'vite';

export interface JanjaPluginOptions {
  /**
   * Directory that `{{ include "..." }}` paths are resolved against.
   * @default the directory of the template being compiled
   */
  root?: string;
  /**
   * Extensions of the files to compile. The first one is also tried when an
   * include path has no extension.
   * @default ['.janja']
   */
  extensions?: string[];
  /** Compiler options: custom delimiters, plugins, `stripComments`, ... */
  compilerOptions?: Omit<CompilerOptions, 'loader'>;
}

/**
 * Compile imported templates at build time:
 *
 *     import render from './page.janja';
 *     const html = await render({ title: 'Hello' });
 *
 * Included templates are inlined, and changing one rebuilds the templates
 * that include it. Works as a Vite plugin and as a Rollup plugin.
 */
export default function janja({
  root,
  extensions = ['.janja'],
  compilerOptions,
}: JanjaPluginOptions = {}): Plugin {
  return {
    name: 'janja',

    async transform(code, id) {
      // Vite appends queries such as `?import` to module ids
      const [file] = id.split('?');

      if (!extensions.some((extension) => file.endsWith(extension))) {
        return null;
      }

      const base = path.resolve(root ?? path.dirname(file));

      const result = await precompile(code, {
        ...compilerOptions,
        includeRuntime: true,
        sourceMap: true,
        filename: file,
        loader: async (name) => {
          const candidates = [name, `${name}${extensions[0]}`].map(
            (candidate) => path.resolve(base, candidate),
          );

          for (const candidate of candidates) {
            try {
              const template = await readFile(candidate, 'utf-8');

              this.addWatchFile(candidate);

              return template;
            } catch {
              // try the next candidate
            }
          }

          throw new Error(`Template "${name}" not found in ${base}`);
        },
      });

      return { code: result.code, map: result.map };
    },
  };
}

export { janja };
