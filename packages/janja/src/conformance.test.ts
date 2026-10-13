import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Renderer } from './renderer';
import type { ObjectType, RendererOptions } from './types';

interface Case {
  template: string;
  output?: string;
  error?: string;
  note?: string;
  data?: ObjectType;
  files?: Record<string, string>;
  options?: RendererOptions;
  filters?: Record<string, string>;
  functions?: Record<string, string>;
}

const suite: {
  data: ObjectType;
  sections: { section: string; cases: Case[] }[];
} = JSON.parse(
  readFileSync(
    new URL('../../../spec/conformance.json', import.meta.url),
    'utf-8',
  ),
);

// The suite is plain JSON so that it can be reused elsewhere; functions are
// stored as source text
// eslint-disable-next-line no-new-func
const evaluate = (source: string) => new Function(`return (${source})`)();

const evaluateAll = (sources: Record<string, string> = {}) =>
  Object.fromEntries(
    Object.entries(sources).map(([name, source]) => [name, evaluate(source)]),
  );

for (const { section, cases } of suite.sections) {
  describe(section, () => {
    for (const testCase of cases) {
      const { template, output, error, files } = testCase;

      it(JSON.stringify(template), async () => {
        const renderer = new Renderer({
          ...testCase.options,
          filters: evaluateAll(testCase.filters),
          loader: async (path) => {
            if (!files || !(path in files)) {
              throw new Error(`Template "${path}" not found`);
            }

            return files[path];
          },
        });

        const data = {
          ...structuredClone(testCase.data ?? suite.data),
          ...evaluateAll(testCase.functions),
        };
        const render = renderer.render(template, data);

        if (error !== undefined) {
          await expect(render).rejects.toThrow(error);
        } else {
          expect(await render).toBe(output);
        }
      });
    }
  });
}
