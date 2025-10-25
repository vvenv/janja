import { expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('invalid', async () => {
  try {
    await compile('{{ for }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: "for" tag must have expression]`)
    expect(error.details).toMatchInlineSnapshot(`
      ""for" tag must have expression

      1: {{ for }}
         ^^^^^^^^^
      "
    `)
  }
  try {
    await compile('{{ for x }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: Cannot read properties of undefined (reading 'type')]`)
    expect(error.details).toMatchInlineSnapshot(`
      "Cannot read properties of undefined (reading 'type')

      1: {{ for x }}
         ^^^^^^^^^^^
      "
    `)
  }
  try {
    await compile('{{ endfor }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: unexpected "endfor"]`)
    expect(error.details).toMatchInlineSnapshot(`
      "unexpected "endfor"

      1: {{ endfor }}
         ^^^^^^^^^^^^
      "
    `)
  }
  try {
    await compile('{{ break }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: "break" tag must inside a "for" loop]`)
    expect(error.details).toMatchInlineSnapshot(`
      ""break" tag must inside a "for" loop

      1: {{ break }}
         ^^^^^^^^^^^
      "
    `)
  }
  try {
    await compile('{{ continue }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: "continue" tag must inside a "for" loop]`)
    expect(error.details).toMatchInlineSnapshot(`
      ""continue" tag must inside a "for" loop

      1: {{ continue }}
         ^^^^^^^^^^^^^^
      "
    `)
  }
})

it('basic', async () => {
  expect(
    await compile(
      '{{ for x of y }}{{= x }}{{= y }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{for(const x of c.y){const c_0={...c,x,};s+=e(c_0.x);s+=e(c_0.y);}}return s;})();"`,
  )
  expect(
    await compile(
      '{{ for x of y | f }}{{= x }}{{= y }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{for(const x of (await f.f.call(c,c.y))){const c_0={...c,x,};s+=e(c_0.x);s+=e(c_0.y);}}return s;})();"`,
  )
  expect(
    await compile(
      '{{ for x of y | f(a) | g("b") }}{{= x }}{{= y }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{for(const x of (await f.g.call(c,(await f.f.call(c,c.y,c.a)),"b"))){const c_0={...c,x,};s+=e(c_0.x);s+=e(c_0.y);}}return s;})();"`,
  )
})

it('destructuring', async () => {
  expect(
    await compile(
      '{{ for (x, y) of z }}{{= x }}{{= y }}{{= z }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{for(const {x,y} of c.z){const c_0={...c,x,y};s+=e(c_0.x);s+=e(c_0.y);s+=e(c_0.z);}}return s;})();"`,
  )
  expect(
    await compile(
      '{{ for (x, y) of z | f(a) }}{{= x }}{{= y }}{{= z }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{for(const {x,y} of (await f.f.call(c,c.z,c.a))){const c_0={...c,x,y};s+=e(c_0.x);s+=e(c_0.y);s+=e(c_0.z);}}return s;})();"`,
  )
})

it('break', async () => {
  expect(
    await compile('{{ for name of names }}{{ break }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{for(const name of c.names){const c_0={...c,name,};break;}}return s;})();"`,
  )
  expect(
    await compile(
      '{{ for name of names }}{{ if name }}{{ break }}{{ endif }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{for(const name of c.names){const c_0={...c,name,};if(c_0.name){break;}}}return s;})();"`,
  )
})

it('continue', async () => {
  expect(
    await compile('{{ for name of names }}{{ continue }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{for(const name of c.names){const c_0={...c,name,};continue;}}return s;})();"`,
  )
  expect(
    await compile(
      '{{ for name of names }}{{ if name }}{{ continue }}{{ endif }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{for(const name of c.names){const c_0={...c,name,};if(c_0.name){continue;}}}return s;})();"`,
  )
})

it('nesting', async () => {
  expect(
    await compile(
      '{{ for x of y }}{{ for z of x }}{{= z }}{{= x }}{{= y }}{{ endfor }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{for(const x of c.y){const c_0={...c,x,};{for(const z of c_0.x){const c_0_1={...c_0,z,};s+=e(c_0_1.z);s+=e(c_0_1.x);s+=e(c_0_1.y);}}}}return s;})();"`,
  )
})
