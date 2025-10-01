import { expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('basic', async () => {
  expect(await compile('{{ #call m }}3{{ /call }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";await c.m(async()=>{s+="3";});return s;})();"`,
  )
  expect(await compile('{{ #call m: 1, "2" }}3{{ /call }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";await c.m(1,"2",async()=>{s+="3";});return s;})();"`,
  )
  expect(await compile('{{ #call m: x=1, y="2" }}3{{ /call }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";await c.m({x:1,y:"2"},async()=>{s+="3";});return s;})();"`,
  )
})

it('macro and call', async () => {
  expect(
    await compile(
      '{{ #macro m: x, y }}{{= x }}{{ caller }}{{= y }}{{ /macro }}{{ #call m: \'f\', 1 }}3{{ /call }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";c.m=async(_c,x,y)=>{[x,y,_c]=[_c,x,y];const c_0={...c,x,y,};s+=e(c_0.x);await _c?.();s+=e(c_0.y);};await c_0.m('f',1,async()=>{s+="3";});return s;})();"`,
  )
  expect(
    await compile(
      '{{ #macro m: x=\'f\', y=1 }}{{= x }}{{ caller }}{{= y }}{{ /macro }}{{ #call m }}3{{ /call }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";c.m=async(_c,x='f',y=1)=>{[x,y,_c]=[_c,x,y];const c_0={...c,x,y,};s+=e(c_0.x);await _c?.();s+=e(c_0.y);};await c_0.m(async()=>{s+="3";});return s;})();"`,
  )
})

it('invalid', async () => {
  expect(await compile('{{ #call n }}', { debug: true })).toMatchInlineSnapshot(
    `"expected tokens end_call, endcall, /call, but got nothing"`,
  )
  expect(await compile('{{ /call }}', { debug: true })).toMatchInlineSnapshot(
    `
    " JianJia  Unexpected /call

    {{ /call }}

    0:11"
  `,
  )
  expect(await compile('{{ #call }}3{{ /call }}', { debug: true })).toMatchInlineSnapshot(
    `
    " JianJia  call tag must have a value

    {{ #call }}

    0:11"
  `,
  )
  expect(await compile('{{ #call 3 }}{{ /call }}', { debug: true })).toMatchInlineSnapshot(
    `
    " JianJia  call tag must have a valid name

    {{ #call 3 }}

    0:13"
  `,
  )
})
