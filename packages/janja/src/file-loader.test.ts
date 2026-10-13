import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { createFileLoader } from './file-loader';
import { Renderer } from './renderer';

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'janja-loader-'));
  await mkdir(join(root, 'views', 'partials'), { recursive: true });
  await writeFile(join(root, 'secret.janja'), 'SECRET');
  await writeFile(
    join(root, 'views', 'page.janja'),
    'P{{ include "partials/a" }}',
  );
  await writeFile(join(root, 'views', 'partials', 'a.html'), 'A{{= x }}');
  await writeFile(join(root, 'views', 'data.txt'), 'T');
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

it('resolves paths with and without extension', async () => {
  const loader = createFileLoader(join(root, 'views'));

  expect(await loader('page')).toBe('P{{ include "partials/a" }}');
  expect(await loader('page.janja')).toBe('P{{ include "partials/a" }}');
  expect(await loader('partials/a')).toBe('A{{= x }}');
  expect(await loader('data.txt')).toBe('T');
  await expect(loader('missing')).rejects.toThrow(
    'Template "missing" not found',
  );
});

it('cannot be steered outside its root', async () => {
  const loader = createFileLoader(join(root, 'views'));

  await expect(loader('../secret')).rejects.toThrow('not found');
  await expect(loader(join(root, 'secret.janja'))).rejects.toThrow('not found');
  // a sibling directory sharing the root's name as a prefix is outside too
  await mkdir(join(root, 'views-private'));
  await writeFile(join(root, 'views-private', 'x.janja'), 'X');
  await expect(loader('../views-private/x')).rejects.toThrow('not found');
});

it('works as the loader of a renderer', async () => {
  const renderer = new Renderer({
    loader: createFileLoader(join(root, 'views'), { extensions: ['.html'] }),
  });

  expect(await renderer.renderFile('partials/a', { x: 1 })).toBe('A1');
  expect(
    await new Renderer({
      loader: createFileLoader(join(root, 'views')),
    }).renderFile('page', { x: 2 }),
  ).toBe('PA2');
});
