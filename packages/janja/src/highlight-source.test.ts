import { expect, it } from 'vitest';
import { highlightSource } from './highlight-source';

it('highlight', () => {
  expect(
    highlightSource(
      'foo',
      `1
2
3
hello
world
6
7
8`,
      {
        start: { line: 4, column: 3 },
        end: { line: 4, column: 4 },
      },
    ),
  ).toMatchInlineSnapshot(
    `
    "foo

       ...
    3｜ 3
    4｜ hello
     ｜   ^
    5｜ world
    6｜ 6
       ...
    "
  `,
  );
  expect(
    highlightSource(
      'foo',
      `1
2
3
hello
world
6
7
8`,
      {
        start: { line: 4, column: 2 },
        end: { line: 4, column: 5 },
      },
    ),
  ).toMatchInlineSnapshot(
    `
    "foo

       ...
    3｜ 3
    4｜ hello
     ｜  ^ ^
    5｜ world
    6｜ 6
       ...
    "
  `,
  );
  expect(
    highlightSource(
      'foo',
      `1
2
3
hello
world
6
7
8`,
      {
        start: { line: 4, column: 3 },
        end: { line: 5, column: 3 },
      },
    ),
  ).toMatchInlineSnapshot(
    `
    "foo

       ...
    3｜ 3
    4｜ hello
     ｜   ^
    5｜ world
     ｜   ^
    6｜ 6
    7｜ 7
       ...
    "
  `,
  );
});
