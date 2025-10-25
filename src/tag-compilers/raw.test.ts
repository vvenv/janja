import { expect, it } from 'vitest'
import { compile, render } from '../../test/__helper'

it('raw', async () => {
  expect(
    await compile('hello world'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="hello world";return s;})();"`,
  )
  expect(
    await render('hello world'),
  ).toMatchInlineSnapshot(
    `"hello world"`,
  )
  expect(
    await compile(' hello world '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" hello world ";return s;})();"`,
  )
  expect(
    await render(' hello world '),
  ).toMatchInlineSnapshot(
    `" hello world "`,
  )
  expect(
    await compile(' hello\nworld '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" hello\\nworld ";return s;})();"`,
  )
  expect(
    await render(' hello\nworld '),
  ).toMatchInlineSnapshot(
    `
    " hello
    world "
  `,
  )
})

it('whitespace', async () => {
  expect(
    await compile(' {{ t x -}} hello world {{- t }} '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" ";s+="hello world";s+=" ";return s;})();"`,
  )
  expect(
    await render(' {{ t -}} hello world {{- t }} '),
  ).toMatchInlineSnapshot(
    `" hello world "`,
  )
  expect(
    await compile(' {{- t }} hello world {{ t -}}  '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" hello world ";return s;})();"`,
  )
  expect(
    await render(' {{- t }} hello world {{ t -}}  '),
  ).toMatchInlineSnapshot(
    `" hello world "`,
  )
  expect(
    await compile(' {{- t -}} hello world {{- t -}}  '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="hello world";return s;})();"`,
  )
  expect(
    await render(' {{- t -}} hello world {{- t -}}  '),
  ).toMatchInlineSnapshot(
    `"hello world"`,
  )
})
