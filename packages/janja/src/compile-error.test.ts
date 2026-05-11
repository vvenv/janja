import { expect, it } from 'vitest';
import { CompileError } from './compile-error';

it('parse error', () => {
  const error = new CompileError('foo', '{{ for }}', {
    start: {
      line: 1,
      column: 4,
    },
    end: {
      line: 1,
      column: 7,
    },
  });

  expect(error).toMatchInlineSnapshot(`[CompileError: foo]`);
  expect(error.name).toMatchInlineSnapshot(`"CompileError"`);
  expect(error.message).toMatchInlineSnapshot(`"foo"`);
  expect(error.details).toMatchInlineSnapshot(
    `
    "foo

    1│ {{ for }}
     │    ^ ^
    "
  `,
  );
});

it('parse error with suggestions', () => {
  const error = new CompileError('Unclosed "{{"', '{{ for }', {
    start: {
      line: 1,
      column: 1,
    },
    end: {
      line: 1,
      column: 8,
    },
  });

  expect(error.suggestions).toHaveLength(1);
  expect(error.suggestions[0].message).toContain('not closed properly');
  expect(error.details).toContain('Suggestions');
});
