import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Koa from 'koa';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { views, type ViewsOptions } from './index.js';

let root: string;
let close: (() => void) | undefined;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'janja-koa-'));
  await mkdir(join(root, 'views', 'partials'), { recursive: true });
  await writeFile(join(root, 'secret.janja'), 'SECRET');
  await writeFile(
    join(root, 'views', 'layout.janja'),
    '<main>{{ block content }}default{{ endblock }}</main>',
  );
  await writeFile(
    join(root, 'views', 'partials', 'footer.janja'),
    '<footer>{{= user }}</footer>',
  );
  await writeFile(
    join(root, 'views', 'page.janja'),
    '{{ include "layout" }}{{ block content }}<h1>{{= title }}</h1>{{ include "partials/footer" }}{{ endblock }}',
  );
});

afterEach(async () => {
  close?.();
  await rm(root, { recursive: true, force: true });
});

function start(options?: ViewsOptions) {
  const app = new Koa();

  app.silent = true;
  app.use(views(join(root, 'views'), options));
  app.use(async (ctx) => {
    ctx.state.user = 'koa';
    await ctx.render(ctx.path.slice(1), { title: ctx.query.title ?? '<T>' });
  });

  const server = app.listen(0);

  close = () => server.close();

  const { port } = server.address() as AddressInfo;

  return async (path: string) => {
    const response = await fetch(`http://127.0.0.1:${port}${path}`);

    return {
      status: response.status,
      type: response.headers.get('content-type'),
      body: await response.text(),
    };
  };
}

it('renders views with layouts, includes, state and escaping', async () => {
  const get = start();

  expect(await get('/page')).toEqual({
    status: 200,
    type: 'text/html; charset=utf-8',
    body: '<main><h1>&lt;T&gt;</h1><footer>koa</footer></main>',
  });
});

it('picks up changed views and includes', async () => {
  const get = start();

  await get('/page');
  await writeFile(join(root, 'views', 'partials', 'footer.janja'), 'changed');

  expect((await get('/page')).body).toContain('changed');

  await writeFile(join(root, 'views', 'page.janja'), 'new page');

  expect((await get('/page')).body).toBe('new page');
});

it('passes renderer options through', async () => {
  await writeFile(
    join(root, 'views', 'opts.html'),
    '{{= title | shout }}{{= v }}',
  );

  const get = start({
    extension: '.html',
    globals: { v: 2 },
    filters: { shout: (value: string) => `${value}!` },
  });

  expect((await get('/opts?title=hi')).body).toBe('hi!2');
});

it('fails the request on errors and stays inside the views directory', async () => {
  await writeFile(join(root, 'views', 'broken.janja'), '{{ if x }}oops');

  const get = start();

  expect((await get('/broken')).status).toBe(500);
  expect((await get('/missing')).status).toBe(500);
  expect(await get('/..%2Fsecret')).toMatchObject({ status: 500 });
});
