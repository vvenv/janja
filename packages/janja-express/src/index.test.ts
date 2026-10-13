import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import express from 'express';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { engine, type EngineOptions } from './index.js';

let views: string;
let close: (() => void) | undefined;

beforeEach(async () => {
  views = await mkdtemp(join(tmpdir(), 'janja-express-'));
  await mkdir(join(views, 'partials'));
  await writeFile(
    join(views, 'layout.janja'),
    '<main>{{ block content }}default{{ endblock }}</main>',
  );
  await writeFile(
    join(views, 'partials', 'footer.janja'),
    '<footer>{{= site }}</footer>',
  );
  await writeFile(
    join(views, 'page.janja'),
    '{{ include "layout" }}{{ block content }}<h1>{{= title }}</h1>{{ include "partials/footer" }}{{ endblock }}',
  );
});

afterEach(async () => {
  close?.();
  await rm(views, { recursive: true, force: true });
});

async function start(options?: EngineOptions, cache = false) {
  const app = express();

  app.engine('janja', engine(options));
  app.set('view engine', 'janja');
  app.set('views', views);
  app.set('view cache', cache);
  app.locals.site = 'janja';

  app.get('/:view', (req, res) => {
    res.render(req.params.view, { title: req.query.title ?? '<T>' });
  });
  app.use(
    (
      error: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      res.status(500).send(error.message);
    },
  );

  const server = app.listen(0);

  close = () => server.close();

  const { port } = server.address() as AddressInfo;

  return async (path: string) => {
    const response = await fetch(`http://127.0.0.1:${port}${path}`);

    return { status: response.status, body: await response.text() };
  };
}

it('renders views with layouts, includes, locals and escaping', async () => {
  const get = await start();

  expect(await get('/page')).toEqual({
    status: 200,
    body: '<main><h1>&lt;T&gt;</h1><footer>janja</footer></main>',
  });
});

it('picks up changed views and includes unless the view cache is on', async () => {
  const fresh = await start();

  await fresh('/page');
  await writeFile(join(views, 'partials', 'footer.janja'), 'changed');

  expect((await fresh('/page')).body).toContain('changed');
  close?.();

  const cached = await start({ cache: { revalidate: false } }, true);

  await cached('/page');
  await writeFile(join(views, 'partials', 'footer.janja'), 'again');

  expect((await cached('/page')).body).toContain('changed');
});

it('passes renderer options through', async () => {
  await writeFile(
    join(views, 'opts.janja'),
    '{{= title | shout }}{{= version }}',
  );

  const get = await start({
    globals: { version: 2 },
    filters: { shout: (value: string) => `${value}!` },
  });

  expect((await get('/opts?title=hi')).body).toBe('hi!2');
});

it('reports template errors to Express', async () => {
  await writeFile(join(views, 'broken.janja'), '{{ if x }}oops');
  await writeFile(
    join(views, 'escape.janja'),
    '{{ include "../../etc/passwd" }}',
  );

  const get = await start();

  expect(await get('/broken')).toEqual({ status: 500, body: 'Unclosed "if"' });
  expect((await get('/escape')).body).toContain('Failed to load template');
});
