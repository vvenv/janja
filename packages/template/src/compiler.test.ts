import { describe, expect, it } from 'vitest'
import { compile } from '../test/__helper'

describe('stripComments', async () => {
  it('on', async () => {
    expect(await compile(`{{! this is a comment }}`)).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="<!--";s+="this is a comment";s+="-->";return s;})();"`,
    )
  })

  it('off', async () => {
    expect(
      await compile(`{{! this is a comment }}`, {
        stripComments: false,
      }),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="<!--";s+="this is a comment";s+="-->";return s;})();"`,
    )
  })
})

describe('strictMode', async () => {
  it('on', async () => {
    expect(await compile(``)).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";return s;})();"`,
    )
  })

  it('off', async () => {
    expect(
      await compile(``, {
        strictMode: false,
      }),
    ).toMatchInlineSnapshot(`"return(async()=>{let s="";return s;})();"`)
  })
})

it('empty', async () => {
  expect(await compile(``)).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
  )
})

it('html tags', async () => {
  expect(await compile(`<foo>foo</foo>`)).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="<foo>foo</foo>";return s;})();"`,
  )
})

it('quotes', async () => {
  expect(await compile(`"'foo'"`)).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="\\"'foo'\\"";return s;})();"`,
  )
})

it('line break feed', async () => {
  expect(await compile(`\nfoo\n`)).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="\\nfoo\\n";return s;})();"`,
  )
})

it('translate', async () => {
  expect(
    await compile(`{{ "hello, {name}" | t name="IJK" }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="{{ \\"hello, {name}\\" | t name=\\"IJK\\" }}";return s;})();"`,
  )
})

it('invalid', async () => {
  expect(await compile(`{{ /if }}`, { debug: true })).toMatchInlineSnapshot(
    `
    " JianJia  "end_if" must follow "if".

    1: {{ /if }}
       ^^^^^^^^^
    "
  `,
  )
})
