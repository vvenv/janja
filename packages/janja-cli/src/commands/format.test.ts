import { mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { formatTemplates } from './format.js';

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'janja-format-'));
  await writeFile(join(dir, 'messy.janja'), '<p>{{=name|upper}}</p>');
  await writeFile(join(dir, 'tidy.janja'), '<p>{{= name }}</p>');
  await writeFile(join(dir, 'broken.janja'), '{{= name');
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

it('formats files in place and reports what changed', async () => {
  expect(await formatTemplates(dir)).toEqual([
    {
      file: join(dir, 'broken.janja'),
      changed: false,
      error: 'Unclosed "{{="',
    },
    { file: join(dir, 'messy.janja'), changed: true },
    { file: join(dir, 'tidy.janja'), changed: false },
  ]);
  expect(await readFile(join(dir, 'messy.janja'), 'utf-8')).toBe(
    '<p>{{= name | upper }}</p>',
  );
  expect(await readFile(join(dir, 'broken.janja'), 'utf-8')).toBe('{{= name');
});

it('does not write in check mode', async () => {
  const results = await formatTemplates(join(dir, 'messy.janja'), {
    check: true,
  });

  expect(results).toEqual([{ file: join(dir, 'messy.janja'), changed: true }]);
  expect(await readFile(join(dir, 'messy.janja'), 'utf-8')).toBe(
    '<p>{{=name|upper}}</p>',
  );
});
