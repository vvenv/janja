import { expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('empty tag', async () => {
  expect(await compile('{{ }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="{{ }}";return s;})();"`,
  )
})

it('for -> if', async () => {
  expect(
    await compile('{{ for x in a }}{{ if x }}{{= x }}{{ endif }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";const o_c_0=c.a;const a_c_0=Array.isArray(o_c_0);const k_c_0=Object.keys(o_c_0);const l_c_0=k_c_0.length;for(let i_c_0=0;i_c_0<l_c_0;i_c_0++){const _item=o_c_0[k_c_0[i_c_0]];const c_0={...c,x:_item,loop:{index:i_c_0,first:i_c_0===0,last:i_c_0===l_c_0,length:l_c_0}};if(c_0.x){s+=e(c_0.x);}}return s;})();"`,
  )
})

it('if -> for', async () => {
  expect(
    await compile('{{ if a }}{{ for x in a }}{{= x }}{{ endfor }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.a){const o_c_0=c.a;const a_c_0=Array.isArray(o_c_0);const k_c_0=Object.keys(o_c_0);const l_c_0=k_c_0.length;for(let i_c_0=0;i_c_0<l_c_0;i_c_0++){const _item=o_c_0[k_c_0[i_c_0]];const c_0={...c,x:_item,loop:{index:i_c_0,first:i_c_0===0,last:i_c_0===l_c_0,length:l_c_0}};s+=e(c_0.x);}}return s;})();"`,
  )
})

it('if -> for -> if', async () => {
  expect(
    await compile(
      '{{ if x }}{{ for x in a }}{{ if x }}{{= x }}{{ endif }}{{ endfor }}{{ endif }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x){const o_c_0=c.a;const a_c_0=Array.isArray(o_c_0);const k_c_0=Object.keys(o_c_0);const l_c_0=k_c_0.length;for(let i_c_0=0;i_c_0<l_c_0;i_c_0++){const _item=o_c_0[k_c_0[i_c_0]];const c_0={...c,x:_item,loop:{index:i_c_0,first:i_c_0===0,last:i_c_0===l_c_0,length:l_c_0}};if(c_0.x){s+=e(c_0.x);}}}return s;})();"`,
  )
})

it('for -> if/else ', async () => {
  expect(
    await compile(
      '{{ for x in a }}{{ if x }}{{= x }}{{ else }}***{{ endif }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";const o_c_0=c.a;const a_c_0=Array.isArray(o_c_0);const k_c_0=Object.keys(o_c_0);const l_c_0=k_c_0.length;for(let i_c_0=0;i_c_0<l_c_0;i_c_0++){const _item=o_c_0[k_c_0[i_c_0]];const c_0={...c,x:_item,loop:{index:i_c_0,first:i_c_0===0,last:i_c_0===l_c_0,length:l_c_0}};if(c_0.x){s+=e(c_0.x);}else{s+="***";}}return s;})();"`,
  )
})

it('for -> if/else - literal', async () => {
  expect(
    await compile(
      '{{ for x in a }}{{ if x }}{{= x }}{{ else }}{{= "***" }}{{ endif }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";const o_c_0=c.a;const a_c_0=Array.isArray(o_c_0);const k_c_0=Object.keys(o_c_0);const l_c_0=k_c_0.length;for(let i_c_0=0;i_c_0<l_c_0;i_c_0++){const _item=o_c_0[k_c_0[i_c_0]];const c_0={...c,x:_item,loop:{index:i_c_0,first:i_c_0===0,last:i_c_0===l_c_0,length:l_c_0}};if(c_0.x){s+=e(c_0.x);}else{s+=e("***");}}return s;})();"`,
  )
})
