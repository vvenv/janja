/* eslint-disable style/no-tabs */
import { describe, expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('escape tag', async () => {
  expect(
    await compile(
      '{{= "{{= escape }}" }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e("{{= escape ");s+="\\" }}";return s;})();"`,
  )
  expect(
    await compile(
      '{{= "{\\{= escape }\\}" }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e("{{= escape }}");return s;})();"`,
  )
  expect(
    await compile(
      '{{= "\\{{= escape \\}}" }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e("{{= escape \\\\");s+="\\" }}";return s;})();"`,
  )
  expect(
    await compile(
      '{{= "\\{\\{= escape \\}\\}" }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e("{{= escape }}");return s;})();"`,
  )
})

it('basic', async () => {
  expect(
    await compile(
      '{{= x }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e(c.x);return s;})();"`,
  )
})

it('arithmetic', async () => {
  expect(
    await compile(
      '{{= x + 2 }}{{= x - 2 }}{{= x * 2 }}{{= x / 2 }}{{= x % 2 }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e(c.x+2);s+=e(2);s+=e(c.x*2);s+=e(c.x/2);s+=e(c.x%2);return s;})();"`,
  )
})

describe('literal', () => {
  it('string', async () => {
    expect(
      await compile(
        '{{= "*" }}',
      ),
    ).toMatchInlineSnapshot(
      `"return(async()=>{let s="";s+=e("*");return s;})();"`,
    )
    expect(
      await compile(
        '{{= "**" }}',
      ),
    ).toMatchInlineSnapshot(
      `"return(async()=>{let s="";s+=e("**");return s;})();"`,
    )
    expect(
      await compile(
        '{{= "***" }}',
      ),
    ).toMatchInlineSnapshot(
      `"return(async()=>{let s="";s+=e("***");return s;})();"`,
    )
    expect(
      await compile(
        '{{= "\\"*" }}',
      ),
    ).toMatchInlineSnapshot(
      `"return(async()=>{let s="";s+=e("\\\\\\"*");return s;})();"`,
    )
  })

  it('number', async () => {
    expect(
      await compile(
        '{{= 12 }}',
      ),
    ).toMatchInlineSnapshot(
      `"return(async()=>{let s="";s+=e(12);return s;})();"`,
    )
    expect(
      await compile(
        '{{= 12.34 }}',
      ),
    ).toMatchInlineSnapshot(
      `"return(async()=>{let s="";s+=e(12.34);return s;})();"`,
    )
  })
})

describe('w/ filters', async () => {
  it('basic', async () => {
    expect(
      await compile(
        '{{= x | upper }}',
      ),
    ).toMatchInlineSnapshot(
      `"return(async()=>{let s="";s+=e((await f.upper.call(c,c.x)));return s;})();"`,
    )
    expect(
      await compile(
        '{{= "x" | upper }}',
      ),
    ).toMatchInlineSnapshot(
      `"return(async()=>{let s="";s+=e((await f.upper.call(c,"x")));return s;})();"`,
    )
    expect(
      await compile(
        '{{= \'x\' | upper }}',
      ),
    ).toMatchInlineSnapshot(
      `"return(async()=>{let s="";s+=e((await f.upper.call(c,"x")));return s;})();"`,
    )
    expect(
      await compile(
        '{{= `x` | upper }}',
      ),
    ).toMatchInlineSnapshot(
      `"return(async()=>{let s="";s+=e((await f.upper.call(c,"x")));return s;})();"`,
    )
  })

  it('multiple', async () => {
    expect(
      await compile(
        '{{= x | upper | lower }}',
      ),
    ).toMatchInlineSnapshot(
      `"return(async()=>{let s="";s+=e((await f.lower.call(c,(await f.upper.call(c,c.x)))));return s;})();"`,
    )
  })

  it('duo', async () => {
    expect(
      await compile('{{= x | upper }} and {{= x | upper }}'),
    ).toMatchInlineSnapshot(
      `"return(async()=>{let s="";s+=e((await f.upper.call(c,c.x)));s+=" and ";s+=e((await f.upper.call(c,c.x)));return s;})();"`,
    )
  })

  it('safe', async () => {
    expect(
      await compile(
        '{{= x | safe }}',
      ),
    ).toMatchInlineSnapshot(
      `"return(async()=>{let s="";s+=e((await f.safe.call(c,c.x)));return s;})();"`,
    )
  })

  it('w/ args', async () => {
    expect(
      await compile(
        '{{= name | split("") }}',
      ),
    ).toMatchInlineSnapshot(
      `"return(async()=>{let s="";s+=e((await f.split.call(c,c.name,"")));return s;})();"`,
    )
    expect(
      await compile('{{= "hello, {name}" | t(name="Janja") }}'),
    ).toMatchInlineSnapshot(
      `"return(async()=>{let s="";s+=e((await f.t.call(c,"hello, {name}",c.name="Janja")));return s;})();"`,
    )
  })
})

it('whitespace control', async () => {
  expect(
    await compile(
      ' {{= x }} ',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=" ";s+=e(c.x);s+=" ";return s;})();"`,
  )
  expect(
    await compile(
      ' {{=- x -}} ',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e(c.x);return s;})();"`,
  )
  expect(
    await compile(
      ' {{=- x }} ',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e(c.x);s+=" ";return s;})();"`,
  )
  expect(
    await compile(
      ' {{= x -}} ',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=" ";s+=e(c.x);return s;})();"`,
  )
  expect(
    await compile(
      ' 	{{= x }}	 ',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=" 	";s+=e(c.x);s+="	 ";return s;})();"`,
  )
  expect(
    await compile(
      ' 	{{=- x -}}	 ',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e(c.x);return s;})();"`,
  )
  expect(
    await compile(
      ' 	{{=- x }}	 ',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e(c.x);s+="	 ";return s;})();"`,
  )
  expect(
    await compile(
      ' 	{{= x -}}	 ',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=" 	";s+=e(c.x);return s;})();"`,
  )
  expect(
    await compile(
      ' \t\r\n{{= x }}\r\n\t ',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=" 	\\n\\n";s+=e(c.x);s+="\\n\\n	 ";return s;})();"`,
  )
  expect(
    await compile(
      ' \t\r\n{{=- x -}}\r\n\t ',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e(c.x);return s;})();"`,
  )
  expect(
    await compile(
      ' \t\r\n{{=- x }}\r\n\t ',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e(c.x);s+="\\n\\n	 ";return s;})();"`,
  )
  expect(
    await compile(
      ' \t\r\n{{= x -}}\r\n\t ',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=" 	\\n\\n";s+=e(c.x);return s;})();"`,
  )
})

it('inline if/else', async () => {
  expect(
    await compile(
      '{{= "x" if level else "y" }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e((c.level?"x":"y"));return s;})();"`,
  )
  expect(
    await compile(
      '{{= "x" if level }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e((c.level?"x":""));return s;})();"`,
  )
  expect(
    await compile('{{= "x" | f if level else y | f(a) }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e((c.level?(await f.f.call(c,"x")):(await f.f.call(c,c.y,c.a))));return s;})();"`,
  )
  expect(
    await compile(
      '{{= "md:block" if page | get("toc") }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e(((await f.get.call(c,c.page,"toc"))?"md:block":""));return s;})();"`,
  )
  expect(
    await compile('{{= "negative" if accounts | length lt 0 else "positive" }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=e(((await f.length.call(c,c.accounts))<0?"negative":"positive"));return s;})();"`,
  )
})
