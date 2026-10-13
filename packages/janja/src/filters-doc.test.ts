import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { render } from './index';

// FILTERS.md states the output of its examples; keep it honest
const source = readFileSync(
  new URL('../../../FILTERS.md', import.meta.url),
  'utf-8',
);
const exampleRE =
  /```janja\n((?:(?!```)[^])*?)\n```\n\n(?:Data: `(.*)`\n\n)?Output: `(.*)`/g;
const examples = [...source.matchAll(exampleRE)];

it('finds the examples', () => {
  expect(examples.length).toBeGreaterThan(60);
});

it.each(examples.map(([, template, data, output]) => [template, data, output]))(
  '%s',
  async (template, data, output) => {
    expect(await render(template, data ? JSON.parse(data) : {})).toBe(output);
  },
);
