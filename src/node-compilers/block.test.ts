import { expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('error', async () => {
  try {
    await compile('{{ block }}{{ endblock }}')
    expect(true).toBe(false)
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "block" requires expression]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `
      ""block" requires expression

      1｜ {{ block }}{{ endblock }}
       ｜ ^         ^
      "
    `,
    )
  }
  try {
    await compile('{{ if x }}{{ super }}{{ endif }}')
    expect(true).toBe(false)
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "super" should be used inside a block]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `
      ""super" should be used inside a block

      1｜ {{ if x }}{{ super }}{{ endif }}
       ｜           ^         ^
      "
    `,
    )
  }
})

it('block', async () => {
  expect(
    await compile(
      '{{ block title }}1{{ endblock }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+="1";return s;})();"`,
  )
  expect(
    await compile(
      '{{ block title }}1{{ super }}2{{ endblock }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+="1";s+="2";return s;})();"`,
  )
  expect(
    await compile(
      '{{ block title }}1{{ super }}2{{ endblock }}{{ block title }}3{{ super }}4{{ endblock }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+="3";s+="1";s+="2";s+="4";return s;})();"`,
  )
  expect(
    await compile(
      '{{ block title }}1{{ endblock }}{{ block title }}2{{ endblock }}{{ block title }}{{ super }}3{{ endblock }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+="2";s+="3";return s;})();"`,
  )
  expect(
    await compile(
      '{{ block title }}1{{ endblock }}{{ block title }}2{{ super }}{{ endblock }}{{ block title }}{{ super }}3{{ endblock }}',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+="2";s+="1";s+="3";return s;})();"`,
  )
  expect(
    await compile(
      ' {{- block title }} 1 {{- endblock }} {{ block title -}} 2 {{ super -}} {{ endblock -}} {{- block title -}} {{- super -}} 3 {{- endblock -}} ',
    ),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+=" 2 ";s+=" 1 ";s+="3 ";s+=" ";return s;})();"`,
  )
  expect(
    await compile('{{ block title }}1{{ endblock }}{{ if x }}{{ block title }}2{{ endblock }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+="2";if(c.x){}return s;})();"`,
  )
})
