import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { janjaView, type JanjaViewOptions } from './index.js';

let root: string;
let app: FastifyInstance | undefined;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'janja-fastify-'));
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
  await app?.close();
  await rm(root, { recursive: true, force: true });
});

async function start(options?: Partial<JanjaViewOptions>) {
  app = Fastify();

  await app.register(janjaView, { root: join(root, 'views'), ...options });

  app.addHook('preHandler', async (_request, reply) => {
    reply.locals = { user: 'fastify' };
  });
  app.get<{ Params: { view: string }; Querystring: { title?: string } }>(
    '/:view',
    (request, reply) =>
      reply.view(request.params.view, { title: request.query.title ?? '<T>' }),
  );

  return app;
}

it('renders views with layouts, includes, locals and escaping', async () => {
  const response = await (await start()).inject('/page');

  expect(response.statusCode).toBe(200);
  expect(response.headers['content-type']).toBe('text/html; charset=utf-8');
  expect(response.body).toBe(
    '<main><h1>&lt;T&gt;</h1><footer>fastify</footer></main>',
  );
});

it('renders to a string outside of a request', async () => {
  const fastify = await start();

  expect(await fastify.view('partials/footer', { user: 'x' })).toBe(
    '<footer>x</footer>',
  );
});

it('picks up changed views and includes', async () => {
  const fastify = await start();

  await fastify.inject('/page');
  await writeFile(join(root, 'views', 'partials', 'footer.janja'), 'changed');

  expect((await fastify.inject('/page')).body).toContain('changed');
});

it('passes renderer options through', async () => {
  await writeFile(
    join(root, 'views', 'opts.html'),
    '{{= title | shout }}{{= v }}',
  );

  const fastify = await start({
    extension: '.html',
    globals: { v: 2 },
    filters: { shout: (value: string) => `${value}!` },
  });

  expect((await fastify.inject('/opts?title=hi')).body).toBe('hi!2');
});

it('fails the request on errors and stays inside the views directory', async () => {
  await writeFile(join(root, 'views', 'broken.janja'), '{{ if x }}oops');

  const fastify = await start();

  expect((await fastify.inject('/broken')).json()).toMatchObject({
    statusCode: 500,
    message: 'Unclosed "if"',
  });
  expect((await fastify.inject('/..%2Fsecret')).statusCode).toBe(500);
});

it('requires a root', async () => {
  await expect(
    Fastify().register(janjaView, {} as JanjaViewOptions),
  ).rejects.toThrow('"root" option is required');
});
