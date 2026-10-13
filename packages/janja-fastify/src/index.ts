import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { createFileLoader, Renderer, type RendererOptions } from 'janja';

export interface JanjaViewOptions extends Omit<RendererOptions, 'loader'> {
  /** Directory of the views */
  root: string;
  /**
   * Extension of the views, used when a view or include is named without one.
   * @default '.janja'
   */
  extension?: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    /** Render a view to a string */
    view: (view: string, data?: Record<string, unknown>) => Promise<string>;
  }

  interface FastifyReply {
    /**
     * Render a view and send it as an HTML response. The view sees
     * `reply.locals`, if set, overlaid with `data`.
     */
    view: (view: string, data?: Record<string, unknown>) => Promise<this>;
    locals?: Record<string, unknown>;
  }
}

const plugin: FastifyPluginAsync<JanjaViewOptions> = async (
  fastify,
  { root, extension = '.janja', ...options },
) => {
  if (!root) {
    throw new Error('janja-fastify: the "root" option is required');
  }

  // One renderer for all requests: each view is compiled once and recompiled
  // only when it, or a template it includes, changes on disk
  const renderer = new Renderer({
    ...options,
    loader: createFileLoader(root, { extensions: [extension] }),
  });

  fastify.decorate('view', (view, data = {}) =>
    renderer.renderFile(view, data),
  );

  fastify.decorateReply('view', async function view(name, data = {}) {
    const html = await renderer.renderFile(name, { ...this.locals, ...data });

    return this.type('text/html; charset=utf-8').send(html);
  });
};

/**
 * Fastify plugin that adds `reply.view(view, data)`:
 *
 *     await fastify.register(janjaView, { root: './views' });
 *     fastify.get('/', (request, reply) => reply.view('home', { title: 'Hi' }));
 */
export const janjaView = fp(plugin, {
  fastify: '5.x',
  name: 'janja-fastify',
});

export default janjaView;
