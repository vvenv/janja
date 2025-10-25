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
  try {
    await compile('{{ set 1 = "a" }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: Cannot read properties of undefined (reading 'map')]`)
    expect(error.details).toMatchInlineSnapshot(`
      "Cannot read properties of undefined (reading 'map')

      1: {{ set 1 = "a" }}
         ^^^^^^^^^^^^^^^^^
      "
    `)
  }
  try {
    await compile('{{ set x = y = 1 }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[SyntaxError: Unexpected token ';']`)
    expect(error.details).toMatchInlineSnapshot(`undefined`)
  }
})

it('literal', async () => {
  expect(await compile('{{ set x = "" }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:""});return s;})();"`,
  )
  expect(await compile('{{ set x = "a" }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:"a"});return s;})();"`,
  )
  expect(await compile('{{ set x = 12 }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:12});return s;})();"`,
  )
  expect(await compile('{{ set x = 12.34 }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:12.34});return s;})();"`,
  )
  expect(await compile('{{ set x = true }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:true});return s;})();"`,
  )
  expect(await compile('{{ set x = false }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:false});return s;})();"`,
  )
})

it('id', async () => {
  expect(await compile('{{ set x = y }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:c.y});return s;})();"`,
  )
  expect(await compile('{{ set x = y | f }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:(await f.f.call(c,c.y))});return s;})();"`,
  )
  expect(await compile('{{ set x = y | f(a) }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:(await f.f.call(c,c.y,c.a))});return s;})();"`,
  )
  expect(await compile('{{ set x = y.z }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:c.y.z});return s;})();"`,
  )
  expect(await compile('{{ set x = y.z | f }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:(await f.f.call(c,c.y.z))});return s;})();"`,
  )
  expect(await compile('{{ set x = y.z | f(a) }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:(await f.f.call(c,c.y.z,c.a))});return s;})();"`,
  )
})

it('expression', async () => {
  expect(await compile('{{ set x = y and z }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:(c.y&&c.z)});return s;})();"`,
  )
})

it('destructuring', async () => {
  expect(await compile('{{ set (x, y) = z }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,f.pick.call(c,c.z,["x","y"]));return s;})();"`,
  )
  expect(await compile('{{ set (x, y) = z | f }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,f.pick.call(c,(await f.f.call(c,c.z)),["x","y"]));return s;})();"`,
  )
  expect(await compile('{{ set (x, y) = z | f(a) }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,f.pick.call(c,(await f.f.call(c,c.z,c.a)),["x","y"]));return s;})();"`,
  )
})

it('block set', async () => {
  expect(await compile('{{ set x }}{{= y }}{{ endset }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:await(async(s)=>{s+=e(c.y);return s;})("")});return s;})();"`,
  )
  expect(await compile('{{ set x }}a{{ endset }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:await(async(s)=>{return s;})("")});return s;})();"`,
  )
})

it('override', async () => {
  expect(await compile('{{ set x = \'y\' }}{{ set x = "y" }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";Object.assign(c,{x:"y"});Object.assign(c,{x:"y"});return s;})();"`,
  )
})
