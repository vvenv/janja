import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { render } from './index';

// The filter references state the output of their examples; keep them honest
describe.each([
  ['FILTERS.md', 'Data: ', 'Output: '],
  ['website/zh/reference/filters.md', '数据：', '输出：'],
])('%s', (file, dataLabel, outputLabel) => {
  const source = readFileSync(
    new URL(`../../../${file}`, import.meta.url),
    'utf-8',
  );
  const exampleRE = new RegExp(
    `\`\`\`janja\\n((?:(?!\`\`\`)[^])*?)\\n\`\`\`\\n\\n(?:${dataLabel}\`(.*)\`\\n\\n)?${outputLabel}\`(.*)\``,
    'g',
  );
  const examples = [...source.matchAll(exampleRE)];

  it('finds the examples', () => {
    expect(examples.length).toBeGreaterThan(60);
  });

  it.each(
    examples.map(([, template, data, output]) => [template, data, output]),
  )('%s', async (template, data, output) => {
    expect(await render(template, data ? JSON.parse(data) : {})).toBe(output);
  });
});
