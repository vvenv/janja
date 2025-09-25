import { expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('basic', async () => {
  expect(
    await compile(
      `{{ #block title }}1{{ /block }}{{ #block title }}2{{ /block }}{{ #block title }}{{ super }}3{{ /block }}`,
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";const _b_1_0_0=async(_s)=>{s+="1";};const _b_1_0_v=async(_s)=>{s+="2";};const _b_1_0_1u=async(_s)=>{await _s?.();s+="3";};await(async()=>await _b_1_0_1u(async()=>await _b_1_0_v(async()=>await _b_1_0_0())))();return s;})();"`,
  )
})

it('invalid', async () => {
  expect(
    await compile(`{{ #block }}{{ /block }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="{{ #block }}{{ /block }}";return s;})();"`,
  )

  expect(
    await compile(`{{ #block }}{{ /block }}`, {
      debug: true,
    }),
  ).toMatchInlineSnapshot(`
    " JianJia  "end_block" must follow "block".

    1: {{ #block }}{{ /block }}
                   ^^^^^^^^^^^^
    "
  `)

  expect(
    await compile(`{{ #if x }}{{ #block title }}{{ /block }}{{ /if }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x){s+="{{ #block title }}{{ /block }}";}return s;})();"`,
  )

  expect(
    await compile(`{{ #if x }}{{ #block title }}{{ /block }}{{ /if }}`, {
      debug: true,
    }),
  ).toMatchInlineSnapshot(`
    " JianJia  "block" must follow "root".

    1: {{ #if x }}{{ #block title }}{{ /block }}{{ /if }}
                  ^^^^^^^^^^^^^^^^^^
    "
  `)

  expect(
    await compile(`{{ #if x }}{{ super }}{{ /if }}`),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x){s+="{{ super }}";}return s;})();"`,
  )

  expect(
    await compile(`{{ #if x }}{{ super }}{{ /if }}`, { debug: true }),
  ).toMatchInlineSnapshot(
    `
    " JianJia  "super" must follow "block".

    1: {{ #if x }}{{ super }}{{ /if }}
                  ^^^^^^^^^^^
    "
  `,
  )
})

it('whitespace control', async () => {
  expect(
    await compile(' {{ #block name }} x {{ /block }} '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" ";const _b_1_0_1=async(_s)=>{s+=" x ";};await(async()=>await _b_1_0_1())();s+=" ";return s;})();"`,
  )

  expect(
    await compile(' {{ #block name -}} x {{- /block }} '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" ";const _b_1_0_1=async(_s)=>{s+="x";};await(async()=>await _b_1_0_1())();s+=" ";return s;})();"`,
  )

  expect(
    await compile(' {{- #block name -}} x {{- /block -}} '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";const _b_1_0_1=async(_s)=>{s+="x";};await(async()=>await _b_1_0_1())();return s;})();"`,
  )

  expect(
    await compile(' {{- #block name -}} x {{ super }} y {{- /block -}} '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";const _b_1_0_1=async(_s)=>{s+="x ";await _s?.();s+=" y";};await(async()=>await _b_1_0_1())();return s;})();"`,
  )

  expect(
    await compile(' {{- #block name -}} x {{- super -}} y {{- /block -}} '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";const _b_1_0_1=async(_s)=>{s+="x";await _s?.();s+="y";};await(async()=>await _b_1_0_1())();return s;})();"`,
  )

  expect(
    await compile(' {{- #block name }} x {{- super -}} y {{ /block -}} '),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";const _b_1_0_1=async(_s)=>{s+=" x";await _s?.();s+="y ";};await(async()=>await _b_1_0_1())();return s;})();"`,
  )
})
