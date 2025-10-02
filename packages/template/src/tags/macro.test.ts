import { expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('basic', async () => {
  expect(await compile('{{ #macro m }}MACRO{{ /macro }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";c.m=async(_c)=>{s+="MACRO";};return s;})();"`,
  )
  expect(
    await compile('{{ #macro m: x, y }}{{= x }}{{= y }}{{ /macro }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";c.m=async(_c,x,y)=>{[x,y,_c]=[_c,x,y];const c_0={...c,x,y,};s+=e(c_0.x);s+=e(c_0.y);};return s;})();"`,
  )
})

it('default args', async () => {
  expect(
    await compile('{{ #macro m: x="=", y=1 }}{{= x }}{{= y }}{{ /macro }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";c.m=async(_c,x="=",y=1)=>{[x,y,_c]=[_c,x,y];const c_0={...c,x,y,};s+=e(c_0.x);s+=e(c_0.y);};return s;})();"`,
  )
})

it('caller', async () => {
  expect(
    await compile('{{ #macro n: x, y }}{{= x }}{{ caller }}{{= y }}{{ /macro }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";c.n=async(_c,x,y)=>{[x,y,_c]=[_c,x,y];const c_0={...c,x,y,};s+=e(c_0.x);await _c?.();s+=e(c_0.y);};return s;})();"`,
  )
})

it('invalid', async () => {
  expect(await compile('{{ #macro }}', { debug: true })).toMatchInlineSnapshot(
    `
    " JianJia  assign tag must have a value

    {{ #macro }}

    0:12"
  `,
  )
  expect(await compile('{{ #macro n }}', { debug: true })).toMatchInlineSnapshot(
    `"expected tokens end_macro, endmacro, /macro, but got nothing"`,
  )
  expect(await compile('{{ /macro }}', { debug: true })).toMatchInlineSnapshot(
    `
    " JianJia  unexpected /macro

    {{ /macro }}

    0:12"
  `,
  )
  expect(await compile('{{ #macro 1 }}{{ /macro }}', { debug: true })).toMatchInlineSnapshot(
    `
    " JianJia  assign tag must have a valid name

    {{ #macro 1 }}

    0:14"
  `,
  )
  expect(await compile('{{ caller }}', { debug: true })).toMatchInlineSnapshot(
    `
    " JianJia  caller tag must be inside a macro tag

    {{ caller }}

    0:12"
  `,
  )
})
