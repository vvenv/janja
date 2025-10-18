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

it('basic', async () => {
  expect(
    await compile('{{ if x }}{{= x }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x){s+=e(c.x);}return s;})();"`,
  )
})

it('not', async () => {
  expect(
    await compile('{{ if not x }}{{= x }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(!c.x){s+=e(c.x);}return s;})();"`,
  )
})

it('and', async () => {
  expect(
    await compile('{{ if x and y }}{{= z }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if((c.x&&c.y)){s+=e(c.z);}return s;})();"`,
  )
  expect(
    await compile('{{ if not x and y }}{{= z }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if((!c.x&&c.y)){s+=e(c.z);}return s;})();"`,
  )
})

it('in', async () => {
  expect(
    await compile('{{ if x in names }}{{= x }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if((c.x in c.names)){s+=e(c.x);}return s;})();"`,
  )
  expect(
    await compile('{{ if x y in names }}{{= x }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if((c.y in c.names)){s+=e(c.x);}return s;})();"`,
  )
})

it('eq', async () => {
  expect(
    await compile('{{ if x eq other }}{{= x }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if((c.x===c.other)){s+=e(c.x);}return s;})();"`,
  )
})

it('ne', async () => {
  expect(
    await compile('{{ if x ne y }}{{= x }} ne {{= y }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if((c.x!==c.y)){s+=e(c.x);s+=" ne ";s+=e(c.y);}return s;})();"`,
  )
})

it('else', async () => {
  expect(
    await compile('{{ if x }}{{= x }}{{ else }}{{= "*" }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x){s+=e(c.x);}else{s+=e("*");}return s;})();"`,
  )
})

it('elif', async () => {
  expect(
    await compile(
      '{{ if x eq "foo" }}>>>{{ elif x eq "bar" }}---{{ elif x eq "baz" }}...{{ else }}{{= x }}{{ endif }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if((c.x==="foo")){s+=">>>";}else if((c.x==="bar")){s+="---";}else if((c.x==="baz")){s+="...";}else{s+=e(c.x);}return s;})();"`,
  )
})

it('nested', async () => {
  expect((await compile(
    '{{ if x }}{{ if x }}x{{ elif y }}y{{ else }}z{{ endif }}{{ elif y }}{{ if x }}x{{ elif y }}y{{ else }}z{{ endif }}{{ else }}{{ if x }}x{{ elif y }}y{{ else }}z{{ endif }}{{ endif }}',
  ))).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x){if(c.x){s+="x";}else if(c.y){s+="y";}else{s+="z";}}else if(c.y){if(c.x){s+="x";}else if(c.y){s+="y";}else{s+="z";}}else{if(c.x){s+="x";}else if(c.y){s+="y";}else{s+="z";}}return s;})();"`,
  )
})

it('filter', async () => {
  expect(
    await compile('{{ if x | length }}{{= x }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if((await f.length.call(c,c.x))){s+=e(c.x);}return s;})();"`,
  )
  expect(
    await compile('{{ if x | length | odd }}{{= x }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if((await f.odd.call(c,(await f.length.call(c,c.x))))){s+=e(c.x);}return s;})();"`,
  )
  expect(
    await compile('{{ if names | join("") eq "foobar" }}yes{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(((await f.join.call(c,c.names,""))==="foobar")){s+="yes";}return s;})();"`,
  )
})

it('whitespace', async () => {
  expect(
    await compile(
      ' hello {{ if x }} {{= x }} {{ else }} a {{ endif }} ',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" hello ";if(c.x){s+=" ";s+=e(c.x);s+=" ";}else{s+=" a ";}s+=" ";return s;})();"`,
  )
  expect(
    await compile(
      ' hello {{- if x -}} {{-= x -}} {{- else -}} a {{- endif -}} ',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" hello";if(c.x){s+=e(c.x);}else{s+="a";}return s;})();"`,
  )
  expect(
    await compile(
      ' hello {{- if x }} {{-= x }} {{- else }} a {{- endif }} ',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" hello";if(c.x){s+=e(c.x);}else{s+=" a";}s+=" ";return s;})();"`,
  )
  expect(
    await compile(
      ' hello {{ if x -}} {{= x -}} {{ else -}} a {{ endif -}} ',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" hello ";if(c.x){s+=e(c.x);}else{s+="a ";}return s;})();"`,
  )
})
