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

it('parse error with suggestions', () => {
  const error = new ExpError('Expected "RP" after "LP"', {
    start: {
      line: 1,
      column: 4,
    },
    end: {
      line: 1,
      column: 7,
    },
  });

  expect(error.suggestions).toHaveLength(1);
  expect(error.suggestions[0].message).toContain('Missing closing parenthesis');
  expect(error.details).toContain('Suggestions');
});
