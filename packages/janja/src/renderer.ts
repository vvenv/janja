import { LRUCache } from './cache';
import {
  type CompiledTemplate,
  Compiler,
  optionsFingerprint,
  templateCacheKey,
} from './compiler';
import { escape } from './escape';
import * as filters from './filters';
import { mergeOptions, renderOptions } from './options';
import { plugins } from './plugins';
import { RenderError } from './render-error';
import { Safe } from './safe';
import { deepEscape, SecurityAuditor, SecuritySandbox } from './security';
import { SourceMap } from './source-map';
import type { Filters, ObjectType, RendererOptions, Script } from './types';

// Thrown inside a template to stop rendering a stream nobody reads anymore
const cancellation = new Error('Stream cancelled');

export class Renderer {
  protected options: Required<RendererOptions>;

  private cache?: LRUCache<CompiledTemplate>;

  private sandbox?: SecuritySandbox;

  // Null prototype, so `x | constructor` can't resolve to Object.prototype
  private filters: Filters;

  private escape: (value: unknown) => unknown;

  constructor(options: RendererOptions = {}) {
    this.options = mergeOptions(
      renderOptions,
      {
        filters,
        plugins,
      },
      options,
    );

    this.filters = Object.assign(Object.create(null), this.options.filters);

    const escapeValue = this.options.security?.deepEscape ? deepEscape : escape;
    const { autoEscape } = this.options;

    this.escape = (v: unknown) => {
      if (v === null || v === undefined) {
        return '';
      }

      if (v instanceof Safe) {
        return `${v}`;
      }

      return autoEscape ? escapeValue(v) : v;
    };

    // The cache is on unless explicitly disabled
    if (this.options.cache?.enabled !== false) {
      this.cache = new LRUCache(this.options.cache);
    }

    // Initialize security sandbox if enabled
    if (this.options.security?.sandbox) {
      this.sandbox = new SecuritySandbox(this.options.security);
    }
  }

  async render(template: string, globals: ObjectType) {
    // Fast path: a compiled template without includes needs no compiler
    const cached = this.cache?.peek(templateCacheKey(template));

    if (
      cached?.script &&
      cached.sources.size === 0 &&
      cached.fingerprint === optionsFingerprint(this.options)
    ) {
      this.cache!.get(templateCacheKey(template));

      try {
        return await this.run(cached.script, globals);
      } catch (error: any) {
        const sourceMap = new SourceMap();

        sourceMap.mappings = cached.mappings;
        this.options.debug(this.wrapError(error, template, sourceMap));

        return '';
      }
    }

    const compiler = this.createCompiler();

    try {
      await compiler.compile(template);

      return await this.run(compiler.script, globals);
    } catch (error: any) {
      this.options.debug(this.wrapError(error, template, compiler));
    }

    return '';
  }

  /**
   * Bind a template to the type of data it expects:
   * `const page = renderer.template<{ title: string }>(source)`.
   */
  template<Data extends ObjectType = ObjectType>(template: string) {
    return (data: Data) => this.render(template, data);
  }

  /**
   * Render a template that was compiled ahead of time by `precompileTemplate`.
   */
  async renderCompiled(script: Script, globals: ObjectType = {}) {
    try {
      return await this.run(script, globals);
    } catch (error: any) {
      this.options.debug(error);
    }

    return '';
  }

  /**
   * Render a template as a stream of chunks, so the first bytes can be sent
   * before the whole page is rendered. Output is written between top-level
   * parts of the template and between the iterations of top-level loops.
   */
  renderStream(template: string, globals: ObjectType = {}) {
    let resume: (() => void) | undefined;
    let cancelled = false;

    return new ReadableStream<string>({
      start: (controller) => {
        const write = (chunk: string) => {
          if (cancelled) {
            throw cancellation;
          }

          controller.enqueue(chunk);

          // Wait for the consumer when it is not keeping up
          if ((controller.desiredSize ?? 1) <= 0) {
            return new Promise<void>((resolve) => {
              resume = resolve;
            });
          }
        };

        const compiler = this.createCompiler(true);

        // Not awaited: `start` returns right away and chunks are enqueued as
        // they are produced
        void (async () => {
          try {
            await compiler.compile(template);

            const rest = await this.run(compiler.script, globals, write);

            if (rest && !cancelled) {
              controller.enqueue(rest);
            }

            controller.close();
          } catch (error: any) {
            if (error === cancellation) {
              return;
            }

            try {
              this.options.debug(this.wrapError(error, template, compiler));
              controller.close();
            } catch (reported) {
              controller.error(reported);
            }
          }
        })();
      },
      pull: () => {
        resume?.();
        resume = undefined;
      },
      cancel: () => {
        cancelled = true;
        resume?.();
      },
    });
  }

  private createCompiler(stream = false) {
    return new Compiler(
      this.options,
      this.cache,
      this.options.cache?.revalidate ?? true,
      stream,
    );
  }

  private wrapError(error: any, template: string, sourceMap: SourceMap) {
    if (error?.name === 'CompileError') {
      return error;
    }

    return new RenderError(`${error?.message ?? error}`, template, () => {
      const matched = error?.stack?.match(/<anonymous>:(\d+):(\d+)\)/);

      if (!matched) {
        return error?.stack ?? '';
      }

      const [loc] = sourceMap.getSourceLoc({
        line: +matched[1] - 2,
        column: +matched[2],
      });

      return loc;
    });
  }

  private run(
    script: Script,
    globals: ObjectType,
    write?: (chunk: string) => void | Promise<void>,
  ) {
    // The sandbox restricts the globals configured on the renderer; data
    // passed to this call is always available to the template
    const context = this.sandbox
      ? {
          ...this.sandbox.createSecureContext(this.options.globals),
          ...globals,
        }
      : { ...this.options.globals, ...globals };

    return script(context, this.escape, this.filters, write);
  }

  async renderFile(filepath: string, globals: ObjectType) {
    return this.render(await this.options.loader(filepath), globals);
  }

  // Cache management methods
  clearCache(): void {
    this.cache?.clear();
  }

  invalidateCache(predicate?: (key: string) => boolean): void {
    this.cache?.invalidate(predicate);
  }

  getCacheStats() {
    if (!this.cache) {
      return null;
    }

    return this.cache.getStats();
  }

  resetCacheStats(): void {
    this.cache?.resetStats();
  }

  // Security audit methods
  auditTemplate(template: string) {
    const auditor = new SecurityAuditor();

    return auditor.auditTemplate(template);
  }

  getCSPHeaders() {
    return new SecuritySandbox(this.options.security).generateCSPHeaders();
  }
}
