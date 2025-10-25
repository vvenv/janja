import { expect, it } from 'vitest'
import { compile, render } from '../../test/__helper'

it('raw', async () => {
  expect(
    await compile('hello world'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
  )
  expect(
    await render('hello world'),
  ).toMatchInlineSnapshot(
    `""`,
  )
  expect(
    await compile(' hello world '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
  )
  expect(
    await render(' hello world '),
  ).toMatchInlineSnapshot(
    `""`,
  )
  expect(
    await compile(' hello\nworld '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
  )
  expect(
    await render(' hello\nworld '),
  ).toMatchInlineSnapshot(
    `""`,
  )
})

it('whitespace', async () => {
  expect(
    await compile(' {{ t x -}} hello world {{- t }} '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
  )
  expect(
    await render(' {{ t -}} hello world {{- t }} '),
  ).toMatchInlineSnapshot(
    `""`,
  )
  expect(
    await compile(' {{- t }} hello world {{ t -}}  '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
  )
  expect(
    await render(' {{- t }} hello world {{ t -}}  '),
  ).toMatchInlineSnapshot(
    `""`,
  )
  expect(
    await compile(' {{- t -}} hello world {{- t -}}  '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
  )
  expect(
    await render(' {{- t -}} hello world {{- t -}}  '),
  ).toMatchInlineSnapshot(
    `""`,
  )
})
