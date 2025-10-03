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
    `""use strict";return(async()=>{let s="";const o_0=c.a;const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,x:_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};if(c_0.x){s+=e(c_0.x);}}return s;})();"`,
  )
})

it('if -> for', async () => {
  expect(
    await compile('{{ if a }}{{ for x in a }}{{= x }}{{ endfor }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.a){const o_1=c.a;const a_1=Array.isArray(o_1);const k_1=Object.keys(o_1);const l_1=k_1.length;for(let i_1=0;i_1<l_1;i_1++){const _item=o_1[k_1[i_1]];const c_1={...c,x:_item,loop:{index:i_1,first:i_1===0,last:i_1===l_1,length:l_1}};s+=e(c_1.x);}}return s;})();"`,
  )
})

it('if -> for -> if', async () => {
  expect(
    await compile(
      '{{ if x }}{{ for x in a }}{{ if x }}{{= x }}{{ endif }}{{ endfor }}{{ endif }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x){const o_1=c.a;const a_1=Array.isArray(o_1);const k_1=Object.keys(o_1);const l_1=k_1.length;for(let i_1=0;i_1<l_1;i_1++){const _item=o_1[k_1[i_1]];const c_1={...c,x:_item,loop:{index:i_1,first:i_1===0,last:i_1===l_1,length:l_1}};if(c_1.x){s+=e(c_1.x);}}}return s;})();"`,
  )
})

it('for -> if/else ', async () => {
  expect(
    await compile(
      '{{ for x in a }}{{ if x }}{{= x }}{{ else }}***{{ endif }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";const o_0=c.a;const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,x:_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};if(c_0.x){s+=e(c_0.x);}else{s+="***";}}return s;})();"`,
  )
})

it('for -> if/else - literal', async () => {
  expect(
    await compile(
      '{{ for x in a }}{{ if x }}{{= x }}{{ else }}{{= "***" }}{{ endif }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";const o_0=c.a;const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,x:_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};if(c_0.x){s+=e(c_0.x);}else{s+=e("***");}}return s;})();"`,
  )
})
