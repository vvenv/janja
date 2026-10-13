import { expect, it } from 'vitest';
import { Renderer } from './renderer';
import { renderStream } from './index';

async function collect(stream: ReadableStream<string>) {
  const chunks: string[] = [];

  for await (const chunk of stream as unknown as AsyncIterable<string>) {
    chunks.push(chunk);
  }

  return chunks;
}

const items = Array.from({ length: 500 }, (_, i) => ({ id: i, name: `n${i}` }));
const page =
  '<ul>{{ for item of items }}<li>{{= item.id }}:{{= item.name | upper }}</li>{{ endfor }}</ul>{{= footer }}';

it('streams the same output as render, in several chunks', async () => {
  const renderer = new Renderer();
  const data = { items, footer: '<end>' };

  const chunks = await collect(renderer.renderStream(page, data));

  expect(chunks.length).toBeGreaterThan(3);
  expect(chunks.join('')).toBe(await renderer.render(page, data));
  // chunks are cut between loop iterations, never inside one
  expect(chunks.slice(0, -1).every((chunk) => chunk.endsWith('</li>'))).toBe(
    true,
  );
});

it('sends output before the rest of the template has run', async () => {
  const events: string[] = [];
  const renderer = new Renderer({
    filters: {
      async slow(value: number) {
        events.push(`filter ${value}`);

        return value;
      },
    },
  });

  const reader = renderer
    .renderStream('{{ for i of list }}{{= pad }}{{= i | slow }}{{ endfor }}', {
      list: [1, 2, 3],
      pad: 'x'.repeat(2000),
    })
    .getReader();

  const first = await reader.read();

  events.push('first chunk read');

  expect(first.value?.endsWith('1')).toBe(true);
  expect(events).not.toContain('filter 3');

  while (!(await reader.read()).done) {}

  expect(events).toContain('filter 3');
});

it('keeps captures, macros, blocks and includes intact', async () => {
  const renderer = new Renderer({
    loader: async (path) => `[${path}:{{= pad }}]`,
  });
  const template = [
    '{{ macro m(x) }}<{{= x }}{{= pad }}>{{ endmacro }}',
    '{{ capture c }}{{ for i of list }}{{= i }}{{= pad }}{{ endfor }}{{ endcapture }}',
    '{{ block b }}{{ for i of list }}b{{= i }}{{= pad }}{{ endfor }}{{ endblock }}',
    '{{ include "part" }}',
    '{{ if list }}{{ for i of list }}{{ call m(i) }}{{ endcall }}{{ endfor }}{{ endif }}',
    '{{= c }}',
  ].join('|');
  const data = { list: [1, 2, 3], pad: 'p'.repeat(700) };

  expect((await collect(renderer.renderStream(template, data))).join('')).toBe(
    await renderer.render(template, data),
  );
});

it('reports errors through the stream', async () => {
  await expect(collect(renderStream('{{ if x }}', {}))).rejects.toThrow(
    'Unclosed "if"',
  );
  await expect(collect(renderStream('a{{= a.b.c }}', {}))).rejects.toThrow(
    "Cannot read properties of undefined (reading 'b')",
  );

  // in lenient mode the stream ends instead
  const errors: string[] = [];
  const renderer = new Renderer({ debug: (e) => errors.push(e.message) });

  expect(await collect(renderer.renderStream('a{{= a.b.c }}', {}))).toEqual([]);
  expect(errors).toHaveLength(1);
});

it('stops rendering when the stream is cancelled', async () => {
  let calls = 0;

  const renderer = new Renderer({
    filters: {
      count(value: unknown) {
        calls++;

        return value;
      },
    },
  });

  const reader = renderer
    .renderStream('{{ for i of list }}{{= pad }}{{= i | count }}{{ endfor }}', {
      list: Array.from({ length: 1000 }, (_, i) => i),
      pad: 'x'.repeat(2000),
    })
    .getReader();

  await reader.read();
  await reader.cancel();
  await new Promise((resolve) => setTimeout(resolve, 20));

  expect(calls).toBeLessThan(50);
});

it('caches stream and non-stream compilations separately', async () => {
  const renderer = new Renderer();

  await renderer.render(page, { items: [] });
  await collect(renderer.renderStream(page, { items: [] }));
  await collect(renderer.renderStream(page, { items: [] }));

  expect(renderer.getCacheStats()).toMatchObject({ size: 2, hits: 1 });
});
