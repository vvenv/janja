import { describe, expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('inline', async () => {
  expect(await compile('{{! foo }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="<!--foo-->";return s;})();"`,
  )
  expect(await compile('{{! foo\nbar }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="<!--foo\\nbar-->";return s;})();"`,
  )
})

it('block', async () => {
  expect(await compile('{{ #comment }}{{ /comment }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="<!--";s+="-->";return s;})();"`,
  )
  expect(await compile('{{ #comment }}foo{{ /comment }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="<!--";s+="foo";s+="-->";return s;})();"`,
  )
  expect(
    await compile('{{ #comment }}foo\nbar{{ /comment }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="<!--";s+="foo\\nbar";s+="-->";return s;})();"`,
  )
})

it('escape', async () => {
  expect(
    await compile('{{ #comment }}foo\n{{= name }}\nbar{{ /comment }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="<!--";s+="foo\\n";s+=e(c.name);s+="\\nbar";s+="-->";return s;})();"`,
  )
  expect(
    await compile('{{ #comment }}foo\n\\{\\{= name \\}\\}\nbar{{ /comment }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="<!--";s+="foo\\n{{= name }}\\nbar";s+="-->";return s;})();"`,
  )
})

describe('w stripComments', async () => {
  it('inline', async () => {
    expect(await compile('{{! foo }}', { stripComments: true })).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";return s;})();"`,
    )
    expect(await compile('{{! foo\nbar }}', { stripComments: true })).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";return s;})();"`,
    )
  })

  it('block', async () => {
    expect(await compile('{{ #comment }}{{ /comment }}', { stripComments: true })).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";return s;})();"`,
    )
    expect(await compile('{{ #comment }}foo{{ /comment }}', { stripComments: true })).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="foo";return s;})();"`,
    )
    expect(
      await compile('{{ #comment }}foo\nbar{{ /comment }}', { stripComments: true }),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="foo\\nbar";return s;})();"`,
    )
  })

  it('escape', async () => {
    expect(
      await compile('{{ #comment }}foo\n{{= name }}\nbar{{ /comment }}', { stripComments: true }),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="foo\\n";s+=e(c.name);s+="\\nbar";return s;})();"`,
    )
    expect(
      await compile('{{ #comment }}foo\n\\{\\{= name \\}\\}\nbar{{ /comment }}', { stripComments: true }),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="foo\\n{{= name }}\\nbar";return s;})();"`,
    )
  })
})

it('invalid', async () => {
  expect(await compile('{{ #comment }}', { debug: true }),
  ).toMatchInlineSnapshot(
    `"expected tokens end_comment, endcomment, /comment, but got nothing"`,
  )
  expect(await compile('{{ /comment }}', { debug: true }),
  ).toMatchInlineSnapshot(
    `
    " JianJia  unexpected /comment

    {{ /comment }}

    0:14"
  `,
  )
})
