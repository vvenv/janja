import { describe, expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('basic', async () => {
  expect(
    await compile(`{{ #if name }}{{= name }}{{ /if }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.name){s+=e(c.name);}return s;})();"`,
  )

  expect(
    await compile(`{{ #if name }}{{= name }}{{ /if }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.name){s+=e(c.name);}return s;})();"`,
  )
})

it('not', async () => {
  expect(
    await compile(`{{ #if not name }}{{= name }}{{ /if }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(!c.name){s+=e(c.name);}return s;})();"`,
  )

  expect(
    await compile(`{{ #if !name }}{{= name }}{{ /if }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(!c.name){s+=e(c.name);}return s;})();"`,
  )
})

it('and', async () => {
  expect(
    await compile(`{{ #if x and y }}{{= z }}{{ /if }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x&&c.y){s+=e(c.z);}return s;})();"`,
  )

  expect(await compile(`{{ #if !x&&y }}{{= z }}{{ /if }}`)).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(!c.x&&c.y){s+=e(c.z);}return s;})();"`,
  )
})

it('in', async () => {
  expect(
    await compile(`{{ #if name in names }}{{= name }}{{ /if }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.name in c.names){s+=e(c.name);}return s;})();"`,
  )

  expect(
    await compile(`{{ #if name in ["foo", "bar"] }}{{= name }}{{ /if }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.name in ["foo", "bar"]){s+=e(c.name);}return s;})();"`,
  )
})

it('equal', async () => {
  expect(
    await compile(`{{ #if name eq other }}{{= name }}{{ /if }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.name===c.other){s+=e(c.name);}return s;})();"`,
  )

  expect(
    await compile(`{{ #if name == other }}{{= name }}{{ /if }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.name===c.other){s+=e(c.name);}return s;})();"`,
  )

  expect(
    await compile(`{{ #if name === other }}{{= name }}{{ /if }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.name===c.other){s+=e(c.name);}return s;})();"`,
  )

  expect(
    await compile(`{{ #if name == "foo" }}{{= name }}{{ /if }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.name==="foo"){s+=e(c.name);}return s;})();"`,
  )
})

it('not equal', async () => {
  expect(
    await compile(`{{ #if name ne other }}{{= name }}{{ /if }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.name!==c.other){s+=e(c.name);}return s;})();"`,
  )

  expect(
    await compile(`{{ #if name != other }}{{= name }}{{ /if }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.name!==c.other){s+=e(c.name);}return s;})();"`,
  )

  expect(
    await compile(`{{ #if name !== other }}{{= name }}{{ /if }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.name!==c.other){s+=e(c.name);}return s;})();"`,
  )

  expect(
    await compile(`{{ #if name != "foo" }}{{= name }}{{ /if }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.name!=="foo"){s+=e(c.name);}return s;})();"`,
  )
})

it('else', async () => {
  expect(
    await compile(`{{ #if name }}{{= name }}{{ else }}{{= "*" }}{{ /if }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.name){s+=e(c.name);}else{s+=e("*");}return s;})();"`,
  )
})

it('elif', async () => {
  expect(
    await compile(
      `{{ #if name == "foo" }}>>>{{ elif name == "bar" }}---{{ elif name == "baz" }}...{{ else }}{{= name }}{{ /if }}`,
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.name==="foo"){s+=">>>";}else if(c.name==="bar"){s+="---";}else if(c.name==="baz"){s+="...";}else{s+=e(c.name);}return s;})();"`,
  )
})

describe('filter', async () => {
  it('basic', async () => {
    expect(
      await compile(`{{ #if name | length }}{{= name }}{{ /if }}`),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";if(await f.length.call(c,c.name)){s+=e(c.name);}return s;})();"`,
    )
  })

  it('multiple', async () => {
    expect(
      await compile(`{{ #if name | length | odd }}{{= name }}{{ /if }}`),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";if(await f.odd.call(c,await f.length.call(c,c.name))){s+=e(c.name);}return s;})();"`,
    )
  })

  it('w/ args', async () => {
    expect(
      await compile(`{{ #if names | join: "" == "foobar" }}yes{{ /if }}`),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";if(await f.join.call(c,c.names,"")==="foobar"){s+="yes";}return s;})();"`,
    )
  })
})

it('whitespace control', async () => {
  expect(
    await compile(
      ' hello {{ #if name }} {{= name }} {{ else }} world {{ /if }} ',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" hello ";if(c.name){s+=" ";s+=e(c.name);s+=" ";}else{s+=" world ";}s+=" ";return s;})();"`,
  )

  expect(
    await compile(
      ' hello {{- #if name -}} {{-= name -}} {{- else -}} world {{- /if -}} ',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" hello";if(c.name){s+=e(c.name);}else{s+="world";}return s;})();"`,
  )

  expect(
    await compile(
      ' hello {{- #if name }} {{-= name }} {{- else }} world {{- /if }} ',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" hello";if(c.name){s+=e(c.name);}else{s+=" world";}s+=" ";return s;})();"`,
  )

  expect(
    await compile(
      ' hello {{ #if name -}} {{= name -}} {{ else -}} world {{ /if -}} ',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" hello ";if(c.name){s+=e(c.name);}else{s+="world ";}return s;})();"`,
  )
})

it('invalid', async () => {
  expect(await compile('{{ #if }}{{ /if }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="{{ #if }}{{ /if }}";return s;})();"`,
  )

  expect(await compile('{{ #for x in y }}{{ /if }}')).toMatchInlineSnapshot(
    `""`,
  )

  expect(
    await compile('{{ #for x in y }}{{ /if }}', { debug: true }),
  ).toMatchInlineSnapshot(`
    " JianJia  "end_if" must follow "if", not "for".

    1: {{ #for x in y }}{{ /if }}
       ^^^^^^^^^^^^^^^^^
                        ^^^^^^^^^
    "
  `)

  expect(compile('{{ #for x in y }}{{ elif z }}')).toMatchInlineSnapshot(
    `Promise {}`,
  )

  expect(
    await compile('{{ #for x in y }}{{ elif z }}', { debug: true }),
  ).toMatchInlineSnapshot(`
    " JianJia  "elif" must follow "if", not "for".

    1: {{ #for x in y }}{{ elif z }}
       ^^^^^^^^^^^^^^^^^
                        ^^^^^^^^^^^^
    "
  `)
})
