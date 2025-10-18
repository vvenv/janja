import { expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('invalid', async () => {
  try {
    await compile('{{ set }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: \`set\` tag must have expression]`)
    expect(error.details).toMatchInlineSnapshot(`
      "\`set\` tag must have expression

      1: {{ set }}
         ^^^^^^^^^
      "
    `)
  }
  try {
    await compile('{{ endset }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: unexpected endset]`)
    expect(error.details).toMatchInlineSnapshot(`
      "unexpected endset

      1: {{ endset }}
         ^^^^^^^^^^^^
      "
    `)
  }
  try {
    await compile('{{ set x = [1] }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[ParseError: unexpect "["]`)
    expect(error.details).toMatchInlineSnapshot(`
      "unexpect "["

      1: x = [1]
             ^
      "
    `)
  }
  try {
    await compile('{{ set x = {a:1} }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[ParseError: unexpect "{"]`)
    expect(error.details).toMatchInlineSnapshot(`
      "unexpect "{"

      1: x = {a:1}
             ^
      "
    `)
  }
})

it('string', async () => {
  expect(await compile('{{ set x = "" }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:""});return s;})();"`,
  )
  expect(await compile('{{ set x = "a" }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:"a"});return s;})();"`,
  )
})

it('id', async () => {
  expect(await compile('{{ set x = y }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:c.y});return s;})();"`,
  )
})

it('block', async () => {
  expect(await compile('{{ set x }}{{= y }}{{ endset }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:await(async(s)=>{s+=e(c.y);return s;})("")});return s;})();"`,
  )
  expect(await compile('{{ set x }}a{{ endset }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:await(async(s)=>{s+="a";return s;})("")});return s;})();"`,
  )
})

it('w/ expression', async () => {
  expect(await compile('{{ set x = y and z }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:(c.y&&c.z)});return s;})();"`,
  )
  expect(await compile('{{ set x = y = 1 }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:(c.y=1)});return s;})();"`,
  )
})

it('w/ filter', async () => {
  expect(await compile('{{ set x = y | f(a) }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:(await f.f.call(c,c.y,c.a))});return s;})();"`,
  )
})

it('override', async () => {
  expect(await compile('{{ set x = \'y\' }}{{ set x = "y" }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:"y"});Object.assign(c,{x:"y"});return s;})();"`,
  )
})

it('correction', async () => {
  expect(await compile('{{ set 1 = "a" }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{1:"a"});return s;})();"`,
  )
  expect(await compile('{{ set x y }}a{{ endset }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{y:await(async(s)=>{s+="a";return s;})("")});return s;})();"`,
  )
})
