import { Compiler } from './compiler';
import { escape } from './escape';
import * as filters from './filters';
import { mergeOptions, type RendererOptions, renderOptions } from './options';
import { RenderError } from './render-error';
import { Safe } from './safe';
import type { ObjectType } from './types';

export class Renderer {
  protected options: Required<RendererOptions>;

  constructor(options?: RendererOptions) {
    this.options = mergeOptions(renderOptions, options);
  }

  async render(template: string, globals: ObjectType) {
    const compiler = new Compiler(this.options);

    try {
      await compiler.compile(template);

      return await compiler.script(
        { ...globals, ...this.options.globals },
        (v: unknown) => {
          if (v instanceof Safe) {
            return `${v}`;
          }

          return this.options.autoEscape ? escape(v) : v;
        },
        { ...filters, ...this.options.filters },
      );
    } catch (error: any) {
      this.options.debug(
        (() => {
          if (error.name === 'CompileError') {
            return error;
          }

          return new RenderError(error.message, template, () => {
            const matched = error.stack!.match(/<anonymous>:(\d+):(\d+)\)/);

            if (!matched) {
              return error.stack ?? '';
            }

            const [loc] = compiler.getSourceLoc({
              line: +matched[1] - 2,
              column: +matched[2],
            });

            return loc;
          });
        })(),
      );
    }

    return '';
  }

  async renderFile(filepath: string, globals: ObjectType) {
    return this.render(await this.options.loader(filepath), globals);
  }
}
