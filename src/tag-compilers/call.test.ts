import { expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('invalid', async () => {
  try {
    await compile('{{ call n }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: expected tokens "endcall", but got nothing]`)
    expect(error.details).toMatchInlineSnapshot(`
      "expected tokens "endcall", but got nothing

      1: 
      "
    `)
  }
  try {
    await compile('{{ endcall }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: unexpected "endcall"]`)
    expect(error.details).toMatchInlineSnapshot(`
      "unexpected "endcall"

      1: {{ endcall }}
         ^^^^^^^^^^^^^
      "
    `)
  }
  try {
    await compile('{{ call }}3{{ endcall }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: "call" tag must have a valid name]`)
    expect(error.details).toMatchInlineSnapshot(`
      ""call" tag must have a valid name

      1: {{ call }}
         ^^^^^^^^^^
      "
    `)
  }
  try {
    await compile('{{ call 3 }}{{ endcall }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: "call" tag must have a valid name]`)
    expect(error.details).toMatchInlineSnapshot(`
      ""call" tag must have a valid name

      1: {{ call 3 }}
         ^^^^^^^^^^^^
      "
    `)
  }
})

it('basic', async () => {
  expect(await compile('{{ call m() }}3{{ endcall }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";await c.m()(async()=>{});return s;})();"`,
  )
  expect(await compile('{{ call m(1, "2") }}3{{ endcall }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";await c.m(1,"2")(async()=>{});return s;})();"`,
  )
})

it('macro and call', async () => {
  expect(
    await compile(
      '{{ macro m = (x, y) }}{{= x }}{{ caller }}{{= y }}{{ endmacro }}{{ call m(\'f\', 1) }}3{{ endcall }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";c.m=(x,y)=>async(_c)=>{const c_0={...c,x,y};s+=e(c_0.x);await _c?.();s+=e(c_0.y);};await c.m("f",1)(async()=>{});return s;})();"`,
  )
  expect(
    await compile(
      '{{ macro m = (x=\'f\', y=1) }}{{= x }}{{ caller }}{{= y }}{{ endmacro }}{{ call m() }}3{{ endcall }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";c.m=(x="f",y=1)=>async(_c)=>{const c_0={...c,x,y};s+=e(c_0.x);await _c?.();s+=e(c_0.y);};await c.m()(async()=>{});return s;})();"`,
  )
})
