import { expect, it } from 'vitest'
import { compile, render } from '../../test/__helper'

it('raw', async () => {
  expect(
    await compile('hello world'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+="hello world";return s;})();"`,
  )
  expect(
    await render('hello world'),
  ).toMatchInlineSnapshot(
    `"hello world"`,
  )
  expect(
    await compile(' hello world '),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=" hello world ";return s;})();"`,
  )
  expect(
    await render(' hello world '),
  ).toMatchInlineSnapshot(
    `" hello world "`,
  )
  expect(
    await compile(' hello\nworld '),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=" hello\\nworld ";return s;})();"`,
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
    await compile(' {{= t x -}} hello world {{=- t }} '),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=" ";s+=e(c.x);s+="hello world";s+=e(c.t);s+=" ";return s;})();"`,
  )
  expect(
    await render(' {{= t -}} hello world {{=- t }} ', { t: 1 }),
  ).toMatchInlineSnapshot(
    `" 1hello world1 "`,
  )
  expect(
    await compile(' {{=- t }} hello world {{= t -}}  '),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e(c.t);s+=" hello world ";s+=e(c.t);return s;})();"`,
  )
  expect(
    await render(' {{=- t }} hello world {{= t -}}  ', { t: 1 }),
  ).toMatchInlineSnapshot(
    `"1 hello world 1"`,
  )
  expect(
    await compile(' {{=- t -}} hello world {{=- t -}}  '),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e(c.t);s+="hello world";s+=e(c.t);return s;})();"`,
  )
  expect(
    await render(' {{=- t -}} hello world {{=- t -}}  ', { t: 1 }),
  ).toMatchInlineSnapshot(
    `"1hello world1"`,
  )
})
