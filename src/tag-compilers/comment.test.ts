import { describe, expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('invalid', async () => {
  try {
    await compile('{{ comment }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: expected tokens "endcomment", but got nothing]`,
    )
    expect(error.details).toMatchInlineSnapshot(`
      "expected tokens "endcomment", but got nothing

      1: 
      "
    `)
  }
  try {
    await compile('{{ endcomment }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: unexpected endcomment]`,
    )
    expect(error.details).toMatchInlineSnapshot(`
      "unexpected endcomment

      1: {{ endcomment }}
         ^^^^^^^^^^^^^^^^
      "
    `)
  }
})

it('inline', async () => {
  expect(await compile('{{# foo }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="<!-- foo -->";return s;})();"`,
  )
  expect(await compile('{{# foo\nbar }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="<!-- foo\\nbar -->";return s;})();"`,
  )
})

it('block', async () => {
  expect(await compile('{{ comment }}{{ endcomment }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="<!--";s+="-->";return s;})();"`,
  )
  expect(await compile('{{ comment }}foo{{ endcomment }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="<!--";s+="-->";return s;})();"`,
  )
  expect(
    await compile('{{ comment }}foo\nbar{{ endcomment }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="<!--";s+="-->";return s;})();"`,
  )
})

it('escape', async () => {
  expect(
    await compile('{{ comment }}foo\n{{= name }}\nbar{{ endcomment }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="<!--";s+=e(c.name);s+="-->";return s;})();"`,
  )
  expect(
    await compile('{{ comment }}foo\n\\{\\{= name \\}\\}\nbar{{ endcomment }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="<!--";s+="-->";return s;})();"`,
  )
})

describe('w stripComments', async () => {
  it('inline', async () => {
    expect(await compile('{{# foo }}', { stripComments: true })).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";return s;})();"`,
    )
    expect(await compile('{{# foo\nbar }}', { stripComments: true })).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";return s;})();"`,
    )
  })

  it('block', async () => {
    expect(await compile('{{ comment }}{{ endcomment }}', { stripComments: true })).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="<!--";s+="-->";return s;})();"`,
    )
    expect(await compile('{{ comment }}foo{{ endcomment }}', { stripComments: true })).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="<!--";s+="-->";return s;})();"`,
    )
    expect(
      await compile('{{ comment }}foo\nbar{{ endcomment }}', { stripComments: true }),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="<!--";s+="-->";return s;})();"`,
    )
  })

  it('escape', async () => {
    expect(
      await compile('{{ comment }}foo\n{{= name }}\nbar{{ endcomment }}', { stripComments: true }),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="<!--";s+=e(c.name);s+="-->";return s;})();"`,
    )
    expect(
      await compile('{{ comment }}foo\n\\{\\{= name \\}\\}\nbar{{ endcomment }}', { stripComments: true }),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="<!--";s+="-->";return s;})();"`,
    )
  })
})
