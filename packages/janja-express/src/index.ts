import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  createFileLoader,
  type ObjectType,
  Renderer,
  type RendererOptions,
} from 'janja';

export interface EngineOptions extends Omit<RendererOptions, 'loader'> {
  /**
   * Directory that `{{ include "..." }}` paths are resolved against.
   * @default the application's `views` directory
   */
  root?: string;
  /**
   * Extension tried when an include path has none.
   * @default the extension of the view being rendered
   */
  extension?: string;
}

type Callback = (error: Error | null, html?: string) => void;

// What Express passes to an engine besides the locals of the render call
interface ExpressLocals extends ObjectType {
  settings?: { views?: string | string[]; 'view cache'?: boolean };
}

/**
 * Create a view engine:
 *
 *     app.engine('janja', engine());
 *     app.set('view engine', 'janja');
 *
 * One renderer serves all requests, so every view is compiled once. Its cache
 * follows Express' `view cache` setting: in development, where that setting
 * is off, views are re-read from disk on every request.
 */
export function engine({ root, extension, ...options }: EngineOptions = {}) {
  const renderers = new Map<string, Renderer>();

  const getRenderer = (base: string, fallbackExtension: string) => {
    const key = `${base}\0${fallbackExtension}`;

    let renderer = renderers.get(key);

    if (!renderer) {
      renderer = new Renderer({
        ...options,
        // Includes cannot leave the views directory
        loader: createFileLoader(base, { extensions: [fallbackExtension] }),
      });
      renderers.set(key, renderer);
    }

    return renderer;
  };

  return (file: string, locals: ExpressLocals, callback: Callback) => {
    const { settings, ...data } = locals;
    const views = settings?.views;
    const base = path.resolve(
      root ?? (Array.isArray(views) ? views[0] : views) ?? path.dirname(file),
    );
    const renderer = getRenderer(base, extension ?? path.extname(file));

    // Without the view cache, a changed view must show up on the next request
    if (!settings?.['view cache']) {
      renderer.clearCache();
    }

    readFile(file, 'utf-8')
      .then((template) => renderer.render(template, data))
      .then(
        (html) => callback(null, html),
        (error) => callback(error),
      );
  };
}

export default engine;
