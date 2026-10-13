import { expect, expectTypeOf, it } from 'vitest';
import { Renderer } from './renderer';
import {
  defineFilters,
  definePlugin,
  type Filter,
  type Filters,
  type Script,
} from './types';
import { render, renderCompiled, renderStream } from './index';

it('typed filters', async () => {
  const filters = defineFilters({
    shout(value: string, times = 1) {
      return `${value.toUpperCase()}${'!'.repeat(times)}`;
    },
    async later(value: number) {
      return value + 1;
    },
  });

  expectTypeOf(filters.shout.call({}, 'a', 2)).toEqualTypeOf<string>();
  expectTypeOf(filters.shout).returns.toEqualTypeOf<string>();
  expectTypeOf(filters.later).returns.toEqualTypeOf<Promise<number>>();
  expectTypeOf(filters).toExtend<Filters>();
  expectTypeOf<Filter<string, [number], string>>().toExtend<Filter>();

  const plugin = definePlugin({ filters });

  expect(
    await render(
      '{{= a | shout(2) }}{{= b | later }}',
      { a: 'hi', b: 1 },
      {
        plugins: [plugin],
      },
    ),
  ).toBe('HI!!2');
});

it('typed templates', async () => {
  const renderer = new Renderer();
  const page = renderer.template<{ title: string; count?: number }>(
    '{{= title }}{{= count }}',
  );

  expectTypeOf(page).parameter(0).toEqualTypeOf<{
    title: string;
    count?: number;
  }>();
  expectTypeOf(page).returns.toEqualTypeOf<Promise<string>>();

  // @ts-expect-error title is required
  void page({ count: 1 }).catch(() => {});

  expect(await page({ title: 'a' })).toBe('a');
});

it('public API types', () => {
  expectTypeOf(render).returns.toEqualTypeOf<Promise<string>>();
  expectTypeOf(renderStream).returns.toEqualTypeOf<ReadableStream<string>>();
  expectTypeOf(renderCompiled).parameter(0).toEqualTypeOf<Script>();
  expectTypeOf(new Renderer().getCacheStats()).toExtend<{
    hits: number;
    hitRate: number;
  } | null>();
});
