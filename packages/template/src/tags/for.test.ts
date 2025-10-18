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
    expect(error).toMatchInlineSnapshot(`[CompileError: unexpected endfor]`)
    expect(error.details).toMatchInlineSnapshot(`
      "unexpected endfor

      1: {{ endfor }}
         ^^^^^^^^^^^^
      "
    `)
  }
  try {
    await compile('{{ break }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: "break" tag must be inside a "for" loop]`)
    expect(error.details).toMatchInlineSnapshot(`
      ""break" tag must be inside a "for" loop

      1: {{ break }}
         ^^^^^^^^^^^
      "
    `)
  }
  try {
    await compile('{{ continue }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: "continue" tag must be inside a "for" loop]`)
    expect(error.details).toMatchInlineSnapshot(`
      ""continue" tag must be inside a "for" loop

      1: {{ continue }}
         ^^^^^^^^^^^^^^
      "
    `)
  }
})

it('basic', async () => {
  expect(
    await compile(
      '{{ for name of names }}{{= name }} of {{= names }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{for(const name of c.names){const c_0={...c,name,};s+=e(c_0.name);s+=" of ";s+=e(c_0.names);}}return s;})();"`,
  )
})

it('destruction', async () => {
  expect(
    await compile(
      '{{ for (x, y) of names }}{{= x }}, {{= y }}, {{= names }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{for(const {x,y} of c.names){const c_0={...c,x,y};s+=e(c_0.x);s+=", ";s+=e(c_0.y);s+=", ";s+=e(c_0.names);}}return s;})();"`,
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

it('duo', async () => {
  expect(
    await compile(
      '{{ for name of names }}{{= name }} of {{= names }}{{ endfor }}{{ for name of names }}{{= name }} of {{= names }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{for(const name of c.names){const c_0={...c,name,};s+=e(c_0.name);s+=" of ";s+=e(c_0.names);}}{for(const name of c.names){const c_1={...c,name,};s+=e(c_1.name);s+=" of ";s+=e(c_1.names);}}return s;})();"`,
  )
})

it('nesting', async () => {
  expect(
    await compile(
      '{{ for _as of ass }}{{ for a of _as }}{{= a }} of {{= _as }} of {{= ass }}{{ endfor }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{for(const _as of c.ass){const c_0={...c,_as,};{for(const a of c_0._as){const c_0_1={...c_0,a,};s+=e(c_0_1.a);s+=" of ";s+=e(c_0_1._as);s+=" of ";s+=e(c_0_1.ass);}}}}return s;})();"`,
  )
})

it('filter', async () => {
  expect(
    await compile(
      '{{ for name of names | split }}{{= name }} of {{= names }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{for(const name of (await f.split.call(c,c.names))){const c_0={...c,name,};s+=e(c_0.name);s+=" of ";s+=e(c_0.names);}}return s;})();"`,
  )
  expect(
    await compile(
      '{{ for char of name | split("") }}{{= char }} of {{= name }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{for(const char of (await f.split.call(c,c.name,""))){const c_0={...c,char,};s+=e(c_0.char);s+=" of ";s+=e(c_0.name);}}return s;})();"`,
  )
})
