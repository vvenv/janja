import { expect, it } from 'vitest';
import { ExpError } from './exp-error';

it('parse error', () => {
  const error = new ExpError('foo', {
    start: {
      line: 1,
      column: 4,
    },
    end: {
      line: 1,
      column: 7,
    },
  });

  expect(error).toMatchInlineSnapshot(`[ExpError: foo]`);
  expect(error.name).toMatchInlineSnapshot(`"ExpError"`);
  expect(error.message).toMatchInlineSnapshot(`"foo"`);
});
