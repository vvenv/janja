import { createFileLoader, Renderer, type RendererOptions } from 'janja';
import type { Middleware } from 'koa';

export interface ViewsOptions extends Omit<RendererOptions, 'loader'> {
  /**
   * Extension of the views, used when a view or include is named without one.
   * @default '.janja'
   */
  extension?: string;
}

declare module 'koa' {
  interface ExtendableContext {
    /**
     * Render a view from the views directory as the response body. The view
     * sees `ctx.state` overlaid with `data`.
     */
    render: (view: string, data?: Record<string, unknown>) => Promise<void>;
  }
}

/**
 * Middleware that adds `ctx.render(view, data)`:
 *
 *     app.use(views('./views'));
 *     app.use(async (ctx) => ctx.render('home', { title: 'Hello' }));
 *
 * Views and `{{ include "..." }}` are resolved inside `root` and cannot leave
 * it. One renderer serves all requests, so each view is compiled once and
 * recompiled only when it, or a template it includes, changes on disk.
 */
export function views(
  root: string,
  { extension = '.janja', ...options }: ViewsOptions = {},
): Middleware {
  const renderer = new Renderer({
    ...options,
    loader: createFileLoader(root, { extensions: [extension] }),
  });

  return async (ctx, next) => {
    ctx.render = async (view, data = {}) => {
      const html = await renderer.renderFile(view, { ...ctx.state, ...data });

      ctx.type = 'html';
      ctx.body = html;
    };

    await next();
  };
}

export default views;
