import { expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('invalid', async () => {
  try {
    await compile('{{ macro }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: "macro" tag must have a "set" expression]`)
    expect(error.details).toMatchInlineSnapshot(`
      ""macro" tag must have a "set" expression

      1: {{ macro }}
         ^^^^^^^^^^^
      "
    `)
  }
  try {
    await compile('{{ macro n }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: "macro" tag must have a "set" expression]`)
    expect(error.details).toMatchInlineSnapshot(`
      ""macro" tag must have a "set" expression

      1: {{ macro n }}
         ^^^^^^^^^^^^^
      "
    `)
  }
  try {
    await compile('{{ endmacro }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: unexpected "endmacro"]`)
    expect(error.details).toMatchInlineSnapshot(`
      "unexpected "endmacro"

      1: {{ endmacro }}
         ^^^^^^^^^^^^^^
      "
    `)
  }
  try {
    await compile('{{ macro 1 }}{{ endmacro }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: "macro" tag must have a "set" expression]`)
    expect(error.details).toMatchInlineSnapshot(`
      ""macro" tag must have a "set" expression

      1: {{ macro 1 }}
         ^^^^^^^^^^^^^
      "
    `)
  }
  try {
    await compile('{{ caller }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: "caller" tag must inside a "macro" tag]`)
    expect(error.details).toMatchInlineSnapshot(`
      ""caller" tag must inside a "macro" tag

      1: {{ caller }}
         ^^^^^^^^^^^^
      "
    `)
  }
})

it('macro', async () => {
  expect(await compile('{{ macro m = () }}MACRO{{ endmacro }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";c.m=()=>async(_c)=>{const c_0={...c,};};return s;})();"`,
  )
  expect(await compile('{{ macro m = () }}1{{ caller }}2{{ endmacro }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";c.m=()=>async(_c)=>{const c_0={...c,};await _c?.();};return s;})();"`,
  )
  expect(await compile('{{ macro m = (x, y) }}{{= x }}{{= y }}{{ endmacro }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";c.m=(x,y)=>async(_c)=>{const c_0={...c,x,y};s+=e(c_0.x);s+=e(c_0.y);};return s;})();"`,
  )
  expect(await compile('{{ macro m = (x="=", y=1, z=x) }}{{= x }}{{= y }}{{= z }}{{ endmacro }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";c.m=(x="=",y=1,z=c.x)=>async(_c)=>{const c_0={...c,x,y,z};s+=e(c_0.x);s+=e(c_0.y);s+=e(c_0.z);};return s;})();"`,
  )
})
