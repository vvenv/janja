import { describe, expect, it } from 'vitest'
import { compile } from '../test/__helper'

describe('stripComments', async () => {
  it('on', async () => {
    expect(await compile('{{! this is a comment }}')).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+="<!--this is a comment-->";return s;})();"',
    )
  })

  it('off', async () => {
    expect(
      await compile('{{! this is a comment }}', {
        stripComments: false,
      }),
    ).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+="<!--this is a comment-->";return s;})();"',
    )
  })
})

describe('strictMode', async () => {
  it('on', async () => {
    expect(await compile('')).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";return s;})();"',
    )
  })

  it('off', async () => {
    expect(
      await compile('', {
        strictMode: false,
      }),
    ).toMatchInlineSnapshot('"return(async()=>{let s="";return s;})();"')
  })
})

it('empty', async () => {
  expect(await compile('')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";return s;})();"',
  )
})

it('html tags', async () => {
  expect(await compile('<foo>foo</foo>')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+="<foo>foo</foo>";return s;})();"',
  )
})

it('quotes', async () => {
  expect(await compile('"\'foo\'"')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+="\\"\'foo\'\\"";return s;})();"',
  )
})

it('line break feed', async () => {
  expect(await compile('\nfoo\n')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+="\\nfoo\\n";return s;})();"',
  )
})

it('translate', async () => {
  expect(
    await compile('{{ "hello, {name}" | t name="IJK" }}'),
  ).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";return s;})();"',
  )
})

it('invalid', async () => {
  expect(await compile('{{ /if }}', { debug: true })).toMatchInlineSnapshot(
    `
    " JianJia  Unexpected /if

    {{ /if }}

    0:9"
  `,
  )
})

it('if/elif/else', async () => {
  expect((await compile(
    '{{ #if x }}x{{ elif y }}y{{ else }}z{{ /if }}',
  ))).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";if(c.x){s+="x";}else if(c.y){s+="y";}else{s+="z";}return s;})();"',
  )
})

it('if/elif/else nested', async () => {
  expect((await compile(
    '{{ #if x }}{{ #if x }}x{{ elif y }}y{{ else }}z{{ /if }}{{ elif y }}{{ #if x }}x{{ elif y }}y{{ else }}z{{ /if }}{{ else }}{{ #if x }}x{{ elif y }}y{{ else }}z{{ /if }}{{ /if }}',
  ))).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";if(c.x){if(c.x){s+="x";}else if(c.y){s+="y";}else{s+="z";}}else if(c.y){if(c.x){s+="x";}else if(c.y){s+="y";}else{s+="z";}}else{if(c.x){s+="x";}else if(c.y){s+="y";}else{s+="z";}}return s;})();"',
  )
})
