import { expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('invalid', async () => {
  try {
    await compile('{{ if }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: \`if\` tag must have expression]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `
      "\`if\` tag must have expression

      1: {{ if }}
         ^^^^^^^^
      "
    `,
    )
  }
  try {
    await compile('{{ elif }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "elif" tag must have expression]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `
      ""elif" tag must have expression

      1: {{ elif }}
         ^^^^^^^^^^
      "
    `,
    )
  }
  try {
    await compile('{{ elif x }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "elif" tag must follow "if" tag]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `
      ""elif" tag must follow "if" tag

      1: {{ elif x }}
         ^^^^^^^^^^^^
      "
    `,
    )
  }
  try {
    await compile('{{ else }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "else" tag must follow "if" tag]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `
      ""else" tag must follow "if" tag

      1: {{ else }}
         ^^^^^^^^^^
      "
    `,
    )
  }
  try {
    await compile('{{ endif }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: unexpected "endif"]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `
      "unexpected "endif"

      1: {{ endif }}
         ^^^^^^^^^^^
      "
    `,
    )
  }
})

it('id', async () => {
  expect(
    await compile('{{ if x }}id{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x){}return s;})();"`,
  )
  expect(
    await compile('{{ if x | f }}id{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if((await f.f.call(c,c.x))){}return s;})();"`,
  )
  expect(
    await compile('{{ if x | f(a) }}id{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if((await f.f.call(c,c.x,c.a))){}return s;})();"`,
  )
  expect(
    await compile('{{ if x.y.z }}id{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x.y.z){}return s;})();"`,
  )
  expect(
    await compile('{{ if x.y.z | f }}id{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if((await f.f.call(c,c.x.y.z))){}return s;})();"`,
  )
  expect(
    await compile('{{ if x.y.z | f(a) }}id{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if((await f.f.call(c,c.x.y.z,c.a))){}return s;})();"`,
  )
})

it('not', async () => {
  expect(
    await compile('{{ if not x }}{{= x }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(!c.x){s+=e(c.x);}return s;})();"`,
  )
  expect(
    await compile('{{ if not x | f }}not{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(!(await f.f.call(c,c.x))){}return s;})();"`,
  )
  expect(
    await compile('{{ if not x | f(a) }}not{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(!(await f.f.call(c,c.x,c.a))){}return s;})();"`,
  )
  expect(
    await compile('{{ if not x.y.z }}not{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(!c.x.y.z){}return s;})();"`,
  )
  expect(
    await compile('{{ if not x.y.z | f }}not{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(!(await f.f.call(c,c.x.y.z))){}return s;})();"`,
  )
  expect(
    await compile('{{ if not x.y.z | f(a) }}not{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(!(await f.f.call(c,c.x.y.z,c.a))){}return s;})();"`,
  )
})

it('and', async () => {
  expect(
    await compile('{{ if x and y }}and{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if((c.x&&c.y)){}return s;})();"`,
  )
  expect(
    await compile('{{ if x | f and y | f }}and{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(((await f.f.call(c,c.x))&&(await f.f.call(c,c.y)))){}return s;})();"`,
  )
  expect(
    await compile('{{ if x | f(a) and y | f(a) }}and{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(((await f.f.call(c,c.x,c.a))&&(await f.f.call(c,c.y,c.a)))){}return s;})();"`,
  )
  expect(
    await compile('{{ if not x and y }}and{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if((!c.x&&c.y)){}return s;})();"`,
  )
  expect(
    await compile('{{ if not x and not y }}and{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if((!c.x&&!c.y)){}return s;})();"`,
  )
})

it('in', async () => {
  expect(
    await compile('{{ if x in names }}in{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if((c.x in c.names)){}return s;})();"`,
  )
  expect(
    await compile('{{ if "x" in names }}in{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(("x" in c.names)){}return s;})();"`,
  )
})

it('eq', async () => {
  expect(
    await compile('{{ if x eq y }}eq{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if((c.x===c.y)){}return s;})();"`,
  )
})

it('ne', async () => {
  expect(
    await compile('{{ if x ne y }}ne{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if((c.x!==c.y)){}return s;})();"`,
  )
})

it('else', async () => {
  expect(
    await compile('{{ if x }}yes{{ else }}no{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x){}else{}return s;})();"`,
  )
})

it('elif', async () => {
  expect(
    await compile(
      '{{ if x eq "foo" }}1{{ elif x eq "bar" }}2{{ elif x eq "baz" }}3{{ else }}4{{ endif }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if((c.x==="foo")){}else if((c.x==="bar")){}else if((c.x==="baz")){}else{}return s;})();"`,
  )
})

it('nested', async () => {
  expect((await compile(
    '{{ if x }}{{ if x }}x{{ elif y }}y{{ else }}z{{ endif }}{{ elif y }}{{ if x }}x{{ elif y }}y{{ else }}z{{ endif }}{{ else }}{{ if x }}x{{ elif y }}y{{ else }}z{{ endif }}{{ endif }}',
  ))).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x){if(c.x){}else if(c.y){}else{}}else if(c.y){if(c.x){}else if(c.y){}else{}}else{if(c.x){}else if(c.y){}else{}}return s;})();"`,
  )
})
