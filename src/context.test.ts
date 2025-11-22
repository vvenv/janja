import { expect, it } from 'vitest';
import { Context } from './context';
import { CONTEXT } from './identifiers';

it('context', () => {
  const ctx = new Context();

  expect(ctx.context).toBe(CONTEXT);
  expect(ctx.in()).toBe('c_0');
  expect(ctx.context).toBe('c_0');
  expect(ctx.in()).toBe('c_0_1');
  expect(ctx.context).toBe('c_0_1');
  ctx.out();
  expect(ctx.context).toBe('c_0');
  ctx.out();
  expect(ctx.context).toBe('c');
  ctx.out();
  expect(ctx.context).toBe('c');
  ctx.out();
  expect(ctx.context).toBe('c');
});
