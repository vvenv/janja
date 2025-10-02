import { describe, expect, it } from 'vitest'
import { compile } from '../test/__helper'

it('empty', async () => {
  expect(await compile('')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
  )
})

it('html tags', async () => {
  expect(await compile('<foo>foo</foo>')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="<foo>foo</foo>";return s;})();"`,
  )
})

it('quotes', async () => {
  expect(await compile('"\'foo\'"')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="\\"'foo'\\"";return s;})();"`,
  )
})

it('line break feed', async () => {
  expect(await compile('\nfoo\n')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="\\nfoo\\n";return s;})();"`,
  )
})

it('translate', async () => {
  expect(
    await compile('{{ "hello, {name}" | t name="JianJia" }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
  )
})

it('stripComments off', async () => {
  expect(
    await compile('{{! this is a comment }}', {
      stripComments: false,
    }),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="<!--this is a comment-->";return s;})();"`,
  )
})

it('strictMode off', async () => {
  expect(
    await compile('', {
      strictMode: false,
    }),
  ).toMatchInlineSnapshot(`"return(async()=>{let s="";return s;})();"`)
})

it('invalid', async () => {
  expect(await compile('{{ if }}', { debug: true })).toMatchInlineSnapshot(
    `
    " JianJia  if tag must have a value

    {{ if }}

    0:8"
  `,
  )
  expect(await compile('{{ if x }}', { debug: true })).toMatchInlineSnapshot(
    `"expected tokens end_if, endif, /if, but got nothing"`,
  )
  expect(await compile('{{ /if }}', { debug: true })).toMatchInlineSnapshot(
    `
    " JianJia  Unexpected /if

    {{ /if }}

    0:9"
  `,
  )
})

describe('block', () => {
  it('basic', async () => {
    expect(
      await compile(
        '{{ #block title }}1{{ /block }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="1";return s;})();"`,
    )
    expect(
      await compile(
        '{{ #block title }}{{ super }}{{ /block }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";return s;})();"`,
    )
    expect(
      await compile(
        '{{ #block title }}{{ super }}{{ /block }}{{ #block title }}{{ super }}{{ /block }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";return s;})();"`,
    )
    expect(
      await compile(
        '{{ #block title }}1{{ /block }}{{ #block title }}2{{ /block }}{{ #block title }}{{ super }}3{{ /block }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="2";s+="3";return s;})();"`,
    )
    expect(
      await compile(
        '{{ #block title }}1{{ /block }}{{ #block title }}2{{ super }}{{ /block }}{{ #block title }}{{ super }}3{{ /block }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="2";s+="1";s+="3";return s;})();"`,
    )
    expect(
      await compile(
        ' {{- #block title }} 1 {{- /block }} {{ #block title -}} 2 {{ super -}} {{ /block -}} {{- #block title -}} {{- super -}} 3 {{- /block -}} ',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="2";s+=" 1";s+=" ";s+="3";s+=" ";s+=" ";return s;})();"`,
    )
  })

  it('whitespace control', async () => {
    expect(
      await compile(' {{ #block name }} x {{ /block }} '),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+=" ";s+=" x ";s+=" ";return s;})();"`,
    )
    expect(
      await compile(' {{ #block name -}} x {{- /block }} '),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+=" ";s+="x";s+=" ";return s;})();"`,
    )
    expect(
      await compile(' {{- #block name -}} x {{- /block -}} '),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="x";return s;})();"`,
    )
    expect(
      await compile(' {{- #block name -}} x {{ super }} y {{- /block -}} '),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="x ";s+=" y";return s;})();"`,
    )
    expect(
      await compile(' {{- #block name -}} x {{- super -}} y {{- /block -}} '),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="x";s+="y";return s;})();"`,
    )
    expect(
      await compile(' {{- #block name }} x {{- super -}} y {{ /block -}} '),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+=" x";s+="y ";return s;})();"`,
    )
  })

  it('invalid', async () => {
    expect(
      await compile('{{ #block }}{{ /block }}', { debug: true }),
    ).toMatchInlineSnapshot(
      `"block tag must have a value"`,
    )
    expect(
      await compile('{{ #block }}{{ /block }}', {
        debug: true,
      }),
    ).toMatchInlineSnapshot(`"block tag must have a value"`)
    expect(
      await compile('{{ #if x }}{{ #block title }}{{ /block }}{{ /if }}', { debug: true }),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";if(c.x){}return s;})();"`,
    )
    expect(
      await compile('{{ #if x }}{{ #block title }}{{ /block }}{{ /if }}', {
        debug: true,
      }),
    ).toMatchInlineSnapshot(`""use strict";return(async()=>{let s="";if(c.x){}return s;})();"`)
    expect(
      await compile('{{ #if x }}{{ super }}{{ /if }}', { debug: true }),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";if(c.x){}return s;})();"`,
    )
    expect(
      await compile('{{ #if x }}{{ super }}{{ /if }}', { debug: true }),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";if(c.x){}return s;})();"`,
    )
  })
})
