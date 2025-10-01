/* eslint-disable style/no-tabs */
import { describe, expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('basic', async () => {
  expect(await compile('{{= x }}')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=e(c.x);return s;})();"',
  )
})

it('nesting', async () => {
  expect(await compile('{{= x }}{{= x.y }}{{= x.y.z }}')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=e(c.x);s+=e(c.x.y);s+=e(c.x.y.z);return s;})();"',
  )
})

it('arithmetic', async () => {
  expect(
    await compile(
      '{{= x+2 }}{{= x-2 }}{{= x*2 }}{{= x/2 }}{{= x**2 }}{{= x%2 }}',
    ),
  ).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=e(c.x+2);s+=e(c.x-2);s+=e(c.x*2);s+=e(c.x/2);s+=e(c.x**2);s+=e(c.x%2);return s;})();"',
  )
  expect(
    await compile(
      '{{= 2+x }}{{= 2-x }}{{= 2*x }}{{= 2/x }}{{= 2**x }}{{= 2%x }}',
    ),
  ).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=e(2+c.x);s+=e(2-c.x);s+=e(2*c.x);s+=e(2/c.x);s+=e(2**c.x);s+=e(2%c.x);return s;})();"',
  )
  expect(await compile('{{= x++ }}{{= ++x }}')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=e(c.x++);s+=e(++c.x);return s;})();"',
  )
  expect(await compile('{{= x-- }}{{= --x }}')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=e(c.x--);s+=e(--c.x);return s;})();"',
  )
})

it('ternary conditional', async () => {
  expect(await compile('{{= x ? x : "x" }}')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=e(c.x ? c.x : "x");return s;})();"',
  )
})

it('array/object member', async () => {
  expect(
    await compile('{{= x[2] }}{{= y["foo"] }}{{= z.bar }}'),
  ).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=e(c.x[2]);s+=e(c.y["foo"]);s+=e(c.z.bar);return s;})();"',
  )
  expect(await compile('{{= [1,2,3][4][5] }}')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=e([1,2,3][4][5]);return s;})();"',
  )
  expect(await compile('{{= ["1","2","3"]["4"]["5"] }}')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=e(["1","2","3"]["4"]["5"]);return s;})();"',
  )
  expect(
    await compile('{{= config.locales[page.locale]["lang"] }}'),
  ).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=e(c.config.locales[c.page.locale]["lang"]);return s;})();"',
  )
  expect(
    await compile('{{= config.locales[page.locale][lang] }}'),
  )
    .toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+=e(c.config.locales[c.page.locale][c.lang]);return s;})();"`,
    )
})

it('escape', async () => {
  expect(await compile('{{= "\\{\\{= escape \\}\\}" }}')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=e("{{= escape }}");return s;})();"',
  )
  expect(await compile('{{= "{\\{= escape }\\}" }}')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=e("{{= escape }}");return s;})();"',
  )
  expect(await compile('{{= "\\{{= escape \\}}" }}')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=e("{{= escape }}");return s;})();"',
  )
})

describe('literal', () => {
  it('string', async () => {
    expect(await compile('{{= "*" }}')).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+=e("*");return s;})();"',
    )
    expect(await compile('{{= "**" }}')).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+=e("**");return s;})();"',
    )
    expect(await compile('{{= "***" }}')).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+=e("***");return s;})();"',
    )
    expect(await compile('{{= "\\"*" }}')).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+=e("\\"*");return s;})();"',
    )
  })

  it('number', async () => {
    expect(await compile('{{= 255 }}')).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+=e(255);return s;})();"`,
    )
    expect(await compile('{{= 255.0 }}')).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+=e(255.0);return s;})();"`,
    )
    expect(await compile('{{= 0xff }}')).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+=e(0xff);return s;})();"`,
    )
    expect(await compile('{{= 0b11111111 }}')).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+=e(0b11111111);return s;})();"`,
    )
    expect(await compile('{{= 0.255e3 }}')).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+=e(0.255e3);return s;})();"`,
    )
  })

  it('boolean', async () => {
    expect(await compile('{{= true }}')).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+=e(true);return s;})();"',
    )
    expect(await compile('{{= false }}')).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+=e(false);return s;})();"',
    )
  })

  it('array', async () => {
    expect(await compile('{{= [1, "1"] }}')).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+=e([1, "1"]);return s;})();"',
    )
  })
})

describe('w/ filters', async () => {
  it('basic', async () => {
    expect(await compile('{{= x | upper }}')).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+=e(await f.upper.call(c,c.x,c));return s;})();"',
    )
    expect(await compile('{{= "x" | upper }}')).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+=e(await f.upper.call(c,"x",c));return s;})();"',
    )
    expect(await compile('{{= \'x\' | upper }}')).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+=e(await f.upper.call(c,\'x\',c));return s;})();"',
    )
    expect(await compile('{{= `x` | upper }}')).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+=e(await f.upper.call(c,`x`,c));return s;})();"',
    )
  })

  it('multiple', async () => {
    expect(await compile('{{= x | upper | lower }}')).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+=e(await f.lower.call(c,await f.upper.call(c,c.x,c),c));return s;})();"',
    )
  })

  it('duo', async () => {
    expect(
      await compile('{{= x | upper }} and {{= x | upper }}'),
    ).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+=e(await f.upper.call(c,c.x,c));s+=" and ";s+=e(await f.upper.call(c,c.x,c));return s;})();"',
    )
  })

  it('safe', async () => {
    expect(await compile('{{= x | safe }}')).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+=e(await f.safe.call(c,c.x,c));return s;})();"',
    )
  })

  it('w/ args', async () => {
    expect(await compile('{{= name | split: "" }}')).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+=e(await f.split.call(c,c.name,""));return s;})();"',
    )
    expect(
      await compile('{{= "hello, {name}" | t: name="JianJia" }}'),
    ).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";s+=e(await f.t.call(c,"hello, {name}",{name:"JianJia"}));return s;})();"',
    )
  })
})

it('whitespace control', async () => {
  expect(await compile(' {{= x }} ')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=" ";s+=e(c.x);s+=" ";return s;})();"',
  )
  expect(await compile(' {{=- x -}} ')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=" {{=- x -}} ";return s;})();"',
  )
  expect(await compile(' {{=- x }} ')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=" {{=- x }} ";return s;})();"',
  )
  expect(await compile(' {{= x -}} ')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=" ";s+=e(c.x);return s;})();"',
  )
  expect(await compile(' 	{{= x }}	 ')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=" 	";s+=e(c.x);s+="	 ";return s;})();"',
  )
  expect(await compile(' 	{{=- x -}}	 ')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=" 	{{=- x -}}	 ";return s;})();"',
  )
  expect(await compile(' 	{{=- x }}	 ')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=" 	{{=- x }}	 ";return s;})();"',
  )
  expect(await compile(' 	{{= x -}}	 ')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=" 	";s+=e(c.x);return s;})();"',
  )
  expect(await compile(' \t\r\n{{= x }}\r\n\t ')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=" 	\\n\\n";s+=e(c.x);s+="\\n\\n	 ";return s;})();"',
  )
  expect(await compile(' \t\r\n{{-= x -}}\r\n\t ')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=e(c.x);return s;})();"`,
  )
  expect(await compile(' \t\r\n{{-= x }}\r\n\t ')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=e(c.x);s+="\\n\\n	 ";return s;})();"`,
  )
  expect(await compile(' \t\r\n{{= x -}}\r\n\t ')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=" 	\\n\\n";s+=e(c.x);return s;})();"',
  )
})

it('inline if/else', async () => {
  expect(await compile('{{= "x" if level else "y" }}')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=e(c.level ? "x" : "y");return s;})();"',
  )
  expect(await compile('{{= "x" if level }}')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=e(c.level ? "x" : "");return s;})();"',
  )
  expect(
    await compile('{{= "x" | f if level else y | f: a }}'),
  ).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=e(c.level ? await f.f.call(c,"x",c) : await f.f.call(c,c.y,c.a));return s;})();"',
  )
  expect(await compile('{{= "md:block" if page.toc }}')).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=e(c.page.toc ? "md:block" : "");return s;})();"',
  )
  expect(
    await compile('{{= "negative" if accounts.length lt 0 else "positive" }}'),
  ).toMatchInlineSnapshot(
    '""use strict";return(async()=>{let s="";s+=e(c.accounts.length<0 ? "negative" : "positive");return s;})();"',
  )
})

it('invalid', async () => {
  expect(await compile('{{= window }}', { debug: true })).toMatchInlineSnapshot(
    `
    " JianJia  invalid expression: window

    {{= window }}

    0:13"
  `,
  )
})

describe('not supported', () => {
  it('object', async () => {
    expect(await compile('{{= { x: 1 } }}', { debug: true })).toMatchInlineSnapshot(
      `"Unexpected token '.'"`,
    )
  })
})
