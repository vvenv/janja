import { LRUCache } from './cache';
import { Compiler } from './compiler';
import { escape } from './escape';
import * as filters from './filters';
import { mergeOptions, renderOptions } from './options';
import { plugins } from './plugins';
import { RenderError } from './render-error';
import { Safe } from './safe';
import { deepEscape, SecurityAuditor, SecuritySandbox } from './security';
import type { CacheOptions, ObjectType, RendererOptions } from './types';

export class Renderer {
  protected options: Required<RendererOptions>;

  private cache?: LRUCache<string>;

  private sandbox?: SecuritySandbox;

  constructor(options: RendererOptions = {}) {
    this.options = mergeOptions(
      renderOptions,
      {
        filters,
        plugins,
      },
      options,
    );

    // Initialize cache if enabled
    if (this.options.cache.enabled) {
      const cacheOptions: Required<CacheOptions> = {
        enabled: this.options.cache.enabled,
        maxSize: this.options.cache.maxSize ?? 1000,
        ttl: this.options.cache.ttl ?? 3600000,
      };

      this.cache = new LRUCache(cacheOptions);
    }

    // Initialize security sandbox if enabled
    if (this.options.security?.sandbox) {
      this.sandbox = new SecuritySandbox(this.options.security);
    }
  }

  async render(template: string, globals: ObjectType) {
    const compiler = new Compiler(this.options, this.cache);

    try {
      await compiler.compile(template);

      // Apply security sandbox if enabled
      const safeGlobals = this.sandbox
        ? this.sandbox.createSecureContext({
            ...this.options.globals,
            ...globals,
          })
        : { ...this.options.globals, ...globals };

      // Apply deep escape if configured
      const escapeFn = this.options.security?.deepEscape
        ? (v: unknown) => {
            if (v instanceof Safe) {
              return `${v}`;
            }

            return this.options.autoEscape ? deepEscape(v) : v;
          }
        : (v: unknown) => {
            if (v instanceof Safe) {
              return `${v}`;
            }

            return this.options.autoEscape ? escape(v) : v;
          };

      return await compiler.script(safeGlobals, escapeFn, this.options.filters);
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
    return this.sandbox?.generateCSPHeaders() || {};
  }
}
