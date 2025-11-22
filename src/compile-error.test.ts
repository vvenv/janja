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

    1｜ {{ for }}
     ｜    ^ ^
    "
  `,
  );
});
