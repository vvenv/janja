import { describe, expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('basic', async () => {
  expect(await compile(`{{ continue }}`)).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="{{ continue }}";return s;})();"`,
  )

  expect(
    await compile(`{{ #for name in names }}{{ continue }}{{ /for }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";const o_1_0=c.names;const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,name:_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};continue;}return s;})();"`,
  )

  expect(
    await compile(
      `{{ #for name in names }}{{ #if name }}{{ continue }}{{ /if }}{{ /for }}`,
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";const o_1_0=c.names;const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,name:_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};if(c_1_0.name){continue;}}return s;})();"`,
  )
})

describe('validation', async () => {
  it('"continue" must be a descendant of "for"', async () => {
    expect(
      await compile(`{{ #if x }}{{ continue }}{{ /if }}`),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";if(c.x){s+="{{ continue }}";}return s;})();"`,
    )

    expect(
      await compile(`{{ #if x }}{{ continue }}{{ /if }}`, {
        debug: true,
      }),
    ).toMatchInlineSnapshot(`
      " JianJia  "continue" must be a descendant of "for".

      1: {{ #if x }}{{ continue }}{{ /if }}
                    ^^^^^^^^^^^^^^
      "
    `)
  })
})
