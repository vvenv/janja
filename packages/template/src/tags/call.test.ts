import { expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('basic', async () => {
  expect(await compile('{{ call m }}3{{ endcall }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";await c.m(async()=>{s+="3";});return s;})();"`,
  )
  expect(await compile('{{ call m: 1, "2" }}3{{ endcall }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";await c.m(1,"2",async()=>{s+="3";});return s;})();"`,
  )
  expect(await compile('{{ call m: x=1, y="2" }}3{{ endcall }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";await c.m({x:1,y:"2"},async()=>{s+="3";});return s;})();"`,
  )
})

it('macro and call', async () => {
  expect(
    await compile(
      '{{ macro m: x, y }}{{= x }}{{ caller }}{{= y }}{{ endmacro }}{{ call m: \'f\', 1 }}3{{ endcall }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=e(c.x);s+=e(c.y);await c.m('f',1,async()=>{s+="3";});return s;})();"`,
  )
  expect(
    await compile(
      '{{ macro m: x=\'f\', y=1 }}{{= x }}{{ caller }}{{= y }}{{ endmacro }}{{ call m }}3{{ endcall }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=e(c.x);s+=e(c.y);await c.m(async()=>{s+="3";});return s;})();"`,
  )
})

it('invalid', async () => {
  expect(await compile('{{ call n }}', { debug: true })).toMatchInlineSnapshot(
    `"expected tokens endcall, but got nothing"`,
  )
  expect(await compile('{{ endcall }}', { debug: true })).toMatchInlineSnapshot(
    `
    " JianJia  unexpected endcall

    {{ endcall }}

    0:13"
  `,
  )
  expect(await compile('{{ call }}3{{ endcall }}', { debug: true })).toMatchInlineSnapshot(
    `
    " JianJia  call tag must have a value

    {{ call }}

    0:10"
  `,
  )
  expect(await compile('{{ call 3 }}{{ endcall }}', { debug: true })).toMatchInlineSnapshot(
    `
    " JianJia  call tag must have a valid name

    {{ call 3 }}

    0:12"
  `,
  )
})
