import { expect, it } from 'vitest'
import { compile } from '../test/__helper'

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
    await compile('{{ if x }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: expected tokens endif, but got nothing]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `
      "expected tokens endif, but got nothing

      1: 
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

it('escape tag', async () => {
  expect(await compile('{{= "{{= escape }}" }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=e("{{= escape ");return s;})();"`,
  )
  expect(await compile('{{= "\\{\\{= escape \\}\\}" }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=e("{{= escape }}");return s;})();"`,
  )
})

it('empty', async () => {
  expect(await compile('')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
  )
})

it('html tags', async () => {
  expect(await compile('<foo>foo</foo>')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
  )
})

it('quotes', async () => {
  expect(await compile('"\'foo\'"')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
  )
})

it('line break feed', async () => {
  expect(await compile('\nfoo\n')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
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
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";return s;})();"`,
  )
})
