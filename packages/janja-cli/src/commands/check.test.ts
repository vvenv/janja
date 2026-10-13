import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { checkTemplates } from './check.js';

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'janja-check-'));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

it('reports errors and warnings per file', async () => {
  await writeFile(join(dir, 'good.janja'), '{{= a | upper }}');
  await writeFile(join(dir, 'bad.janja'), 'x\n{{ if a }}{{= b | nope }}');
  await writeFile(join(dir, 'ignored.txt'), '{{ if }}');

  const results = await checkTemplates(dir);

  expect(results.map(({ file }) => file)).toEqual([
    join(dir, 'bad.janja'),
    join(dir, 'good.janja'),
  ]);
  expect(results[0].errors).toEqual([
    expect.objectContaining({ message: 'Unclosed "if"', line: 2, column: 1 }),
  ]);
  expect(results[0].warnings).toEqual([
    expect.objectContaining({ message: 'Unknown filter "nope"' }),
  ]);
  expect(results[1]).toMatchObject({ errors: [], warnings: [] });
});

it('checks a single file', async () => {
  await writeFile(join(dir, 'one.html'), '{{ endfor }}');

  const [result] = await checkTemplates(join(dir, 'one.html'));

  expect(result.errors[0].message).toBe('Unexpected "endfor"');
});
