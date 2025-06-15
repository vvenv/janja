import { describe, expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('basic', async () => {
  expect(await compile(`{{ break }}`)).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="{{ break }}";return s;})();"`,
  )

  expect(
    await compile(`{{ #for name in names }}{{ break }}{{ /for }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";const o_1_0=c.names;const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,name:_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};break;}return s;})();"`,
  )

  expect(
    await compile(
      `{{ #for name in names }}{{ #if name }}{{ break }}{{ /if }}{{ /for }}`,
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";const o_1_0=c.names;const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,name:_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};if(c_1_0.name){break;}}return s;})();"`,
  )
})

describe('validation', async () => {
  it('"break" must be a descendant of "for"', async () => {
    expect(
      await compile(`{{ #if x }}{{ break }}{{ /if }}`),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";if(c.x){s+="{{ break }}";}return s;})();"`,
    )

    expect(
      await compile(`{{ #if x }}{{ break }}{{ /if }}`, {
        debug: true,
      }),
    ).toMatchInlineSnapshot(`
      " JianJia  "break" must be a descendant of "for".

      1: {{ #if x }}{{ break }}{{ /if }}
                    ^^^^^^^^^^^
      "
    `)
  })
})
