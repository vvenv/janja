import { expect, it } from 'vitest'
import { compileStatement as cs } from './compile-statement'

it('basic', () => {
  expect(
    cs(
      [
        {
          type: 'expression',
          value: 'x',
        },
        {
          type: 'operator',
          value: '===',
        },
        {
          type: 'expression',
          value: 'y',
        },
      ],
      'c',
    ),
  ).toMatchInlineSnapshot('"c.x===c.y"')
})

it('not', () => {
  expect(
    cs(
      [
        {
          type: 'expression',
          value: '!x',
        },
        {
          type: 'operator',
          value: 'in',
        },
        {
          type: 'expression',
          value: '!y',
        },
      ],
      'c',
    ),
  ).toMatchInlineSnapshot('"!c.x in !c.y"')
  expect(
    cs(
      [
        {
          filters: [
            {
              args: 'a',
              name: 'f',
            },
          ],
          type: 'expression',
          value: 'not x',
        },
        {
          type: 'operator',
          value: '&&',
        },
        {
          filters: [
            {
              args: 'b="x"',
              name: 'f',
            },
          ],
          type: 'expression',
          value: 'not y',
        },
      ],
      'c',
    ),
  ).toMatchInlineSnapshot('"await f.f.call(c,!c.x,c.a)&&await f.f.call(c,!c.y,{b:"x"})"')
})

it('filter', () => {
  expect(
    cs(
      [
        {
          type: 'expression',
          value: 'x',
          filters: [
            {
              name: 'f',
              args: '',
            },
          ],
        },
        {
          type: 'operator',
          value: '===',
        },
        {
          type: 'expression',
          value: 'y',
          filters: [
            {
              name: 'f',
              args: '',
            },
          ],
        },
      ],
      'c',
    ),
  ).toMatchInlineSnapshot('"await f.f.call(c,c.x,c)===await f.f.call(c,c.y,c)"')
})

it('filter w/ named args', () => {
  expect(
    cs(
      [
        {
          type: 'expression',
          value: '!x',
          filters: [
            {
              name: 'f',
              args: '"a"',
            },
          ],
        },
        {
          type: 'operator',
          value: '===',
        },
        {
          type: 'expression',
          value: '!y',
          filters: [
            {
              name: 'f',
              args: '"a" `b`',
            },
          ],
        },
      ],
      'c',
    ),
  ).toMatchInlineSnapshot(
    '"await f.f.call(c,!c.x,"a")===await f.f.call(c,!c.y,"a",`b`)"',
  )
  expect(
    cs(
      [
        {
          type: 'expression',
          value: '!x',
          filters: [
            {
              name: 'f',
              args: 'a="a"',
            },
          ],
        },
        {
          type: 'operator',
          value: '===',
        },
        {
          type: 'expression',
          value: '!y',
          filters: [
            {
              name: 'f',
              args: 'a=a b=`b`',
            },
          ],
        },
      ],
      'c',
    ),
  ).toMatchInlineSnapshot(
    '"await f.f.call(c,!c.x,{a:"a"})===await f.f.call(c,!c.y,{a:c.a,b:`b`})"',
  )
})
