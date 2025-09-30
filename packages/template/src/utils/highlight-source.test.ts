import { expect, it } from 'vitest'
import { highlightSource } from './highlight-source'

it('highlight', () => {
  expect(
    highlightSource('foo', '1\n2\n3\nhello\nworld\n4\n5\n6', [
      {
        start: 6,
        end: 11,
      },
    ]),
  ).toMatchInlineSnapshot(`
    " JianJia  foo

       ...
    3: 3
    4: hello
       ^^^^^
    5: world
    6: 4
       ...
    "
  `)
  expect(
    highlightSource('foo', '1\n2\n3\nhello\nworld\n4\n5\n6', [
      {
        start: 6,
        end: 17,
      },
    ]),
  ).toMatchInlineSnapshot(`
    " JianJia  foo

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
  `)
  expect(
    highlightSource('foo', '1\n2\n3\nhello\nworld\n4\n5\n6', [
      {
        start: 10,
        end: 13,
      },
    ]),
  ).toMatchInlineSnapshot(`
    " JianJia  foo

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
  `)
})
