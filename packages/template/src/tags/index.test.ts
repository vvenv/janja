import { expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('empty tag', async () => {
  expect(await compile('{{ }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="{{ }}";return s;})();"`,
  )
})

it('for -> if', async () => {
  expect(
    await compile(`{{ #for x in a }}{{ #if x }}{{= x }}{{ /if }}{{ /for }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";const o_1_0=c.a;const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,x:_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};if(c_1_0.x){s+=e(c_1_0.x);}}return s;})();"`,
  )
})

it('if -> for', async () => {
  expect(
    await compile(`{{ #if a }}{{ #for x in a }}{{= x }}{{ /for }}{{ /if }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.a){const o_2_0=c.a;const a_2_0=Array.isArray(o_2_0);const k_2_0=Object.keys(o_2_0);const l_2_0=k_2_0.length;for(let i_2_0=0;i_2_0<l_2_0;i_2_0++){const _item=o_2_0[k_2_0[i_2_0]];const c_2_0={...c,x:_item,loop:{index:i_2_0,first:i_2_0===0,last:i_2_0===l_2_0,length:l_2_0}};s+=e(c_2_0.x);}}return s;})();"`,
  )
})

it('if -> for -> if', async () => {
  expect(
    await compile(
      `{{ #if x }}{{ #for x in a }}{{ #if x }}{{= x }}{{ /if }}{{ /for }}{{ /if }}`,
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x){const o_2_0=c.a;const a_2_0=Array.isArray(o_2_0);const k_2_0=Object.keys(o_2_0);const l_2_0=k_2_0.length;for(let i_2_0=0;i_2_0<l_2_0;i_2_0++){const _item=o_2_0[k_2_0[i_2_0]];const c_2_0={...c,x:_item,loop:{index:i_2_0,first:i_2_0===0,last:i_2_0===l_2_0,length:l_2_0}};if(c_2_0.x){s+=e(c_2_0.x);}}}return s;})();"`,
  )
})

it('for -> if/else ', async () => {
  expect(
    await compile(
      `{{ #for x in a }}{{ #if x }}{{= x }}{{ else }}***{{ /if }}{{ /for }}`,
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";const o_1_0=c.a;const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,x:_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};if(c_1_0.x){s+=e(c_1_0.x);}else{s+="***";}}return s;})();"`,
  )
})

it('for -> if/else - literal', async () => {
  expect(
    await compile(
      `{{ #for x in a }}{{ #if x }}{{= x }}{{ else }}{{= "***" }}{{ /if }}{{ /for }}`,
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";const o_1_0=c.a;const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,x:_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};if(c_1_0.x){s+=e(c_1_0.x);}else{s+=e("***");}}return s;})();"`,
  )
})
