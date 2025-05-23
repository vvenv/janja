import { expect, test } from 'vitest';
import { highlightSource } from './highlight-source';

test('highlight', () => {
  expect(
    highlightSource(`foo`, `1\n2\n3\nhello\nworld\n4\n5\n6`, [
      {
        startIndex: 6,
        endIndex: 11,
      },
    ]),
  ).toMatchInlineSnapshot(`
    " i>j>k  foo

       ...
    3: 3
    4: hello
       ^^^^^
    5: world
    6: 4
       ...
    "
  `);
  expect(
    highlightSource(`foo`, `1\n2\n3\nhello\nworld\n4\n5\n6`, [
      {
        startIndex: 6,
        endIndex: 17,
      },
    ]),
  ).toMatchInlineSnapshot(`
    " i>j>k  foo

       ...
    3: 3
    4: hello
       ^^^^^
    5: world
       ^^^^^
    6: 4
    7: 5
       ...
    "
  `);
  expect(
    highlightSource(`foo`, `1\n2\n3\nhello\nworld\n4\n5\n6`, [
      {
        startIndex: 10,
        endIndex: 13,
      },
    ]),
  ).toMatchInlineSnapshot(`
    " i>j>k  foo

       ...
    3: 3
    4: hello
           ^
    5: world
       ^
    6: 4
    7: 5
       ...
    "
  `);
});
