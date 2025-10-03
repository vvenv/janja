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
    `"expected tokens endif, but got nothing"`,
  )
  expect(await compile('{{ endif }}', { debug: true })).toMatchInlineSnapshot(
    `
    " JianJia  unexpected endif

    {{ endif }}

    0:11"
  `,
  )
})

describe('block', () => {
  it('basic', async () => {
    expect(
      await compile(
        '{{ block title }}1{{ endblock }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="1";return s;})();"`,
    )
    expect(
      await compile(
        '{{ block title }}{{ super }}{{ endblock }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";return s;})();"`,
    )
    expect(
      await compile(
        '{{ block title }}{{ super }}{{ endblock }}{{ block title }}{{ super }}{{ endblock }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";return s;})();"`,
    )
    expect(
      await compile(
        '{{ block title }}1{{ endblock }}{{ block title }}2{{ endblock }}{{ block title }}{{ super }}3{{ endblock }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="2";s+="3";return s;})();"`,
    )
    expect(
      await compile(
        '{{ block title }}1{{ endblock }}{{ block title }}2{{ super }}{{ endblock }}{{ block title }}{{ super }}3{{ endblock }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="2";s+="1";s+="3";return s;})();"`,
    )
    expect(
      await compile(
        ' {{- block title }} 1 {{- endblock }} {{ block title -}} 2 {{ super -}} {{ endblock -}} {{- block title -}} {{- super -}} 3 {{- endblock -}} ',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="2";s+=" 1";s+=" ";s+="3";s+=" ";s+=" ";return s;})();"`,
    )
  })

  it('whitespace control', async () => {
    expect(
      await compile(' {{ block name }} x {{ endblock }} '),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+=" ";s+=" x ";s+=" ";return s;})();"`,
    )
    expect(
      await compile(' {{ block name -}} x {{- endblock }} '),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+=" ";s+="x";s+=" ";return s;})();"`,
    )
    expect(
      await compile(' {{- block name -}} x {{- endblock -}} '),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="x";return s;})();"`,
    )
    expect(
      await compile(' {{- block name -}} x {{ super }} y {{- endblock -}} '),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="x ";s+=" y";return s;})();"`,
    )
    expect(
      await compile(' {{- block name -}} x {{- super -}} y {{- endblock -}} '),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+="x";s+="y";return s;})();"`,
    )
    expect(
      await compile(' {{- block name }} x {{- super -}} y {{ endblock -}} '),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+=" x";s+="y ";return s;})();"`,
    )
  })

  it('invalid', async () => {
    expect(
      await compile('{{ block }}{{ endblock }}', { debug: true }),
    ).toMatchInlineSnapshot(
      `"block tag must have a value"`,
    )
    expect(
      await compile('{{ block }}{{ endblock }}', {
        debug: true,
      }),
    ).toMatchInlineSnapshot(`"block tag must have a value"`)
    expect(
      await compile('{{ if x }}{{ block title }}{{ endblock }}{{ endif }}', { debug: true }),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";if(c.x){}return s;})();"`,
    )
    expect(
      await compile('{{ if x }}{{ block title }}{{ endblock }}{{ endif }}', {
        debug: true,
      }),
    ).toMatchInlineSnapshot(`""use strict";return(async()=>{let s="";if(c.x){}return s;})();"`)
    expect(
      await compile('{{ if x }}{{ super }}{{ endif }}', { debug: true }),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";if(c.x){}return s;})();"`,
    )
    expect(
      await compile('{{ if x }}{{ super }}{{ endif }}', { debug: true }),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";if(c.x){}return s;})();"`,
    )
  })
})
