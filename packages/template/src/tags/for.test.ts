import { describe, expect, it } from 'vitest'
import { compile } from '../../test/__helper'

describe('array', async () => {
  it('basic', async () => {
    expect(
      await compile(
        '{{= names }}{{ #for name in names }}{{= name }} in {{= names }}{{ /for }}{{= names }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+=e(c.names);const o_1=c.names;const a_1=Array.isArray(o_1);const k_1=Object.keys(o_1);const l_1=k_1.length;for(let i_1=0;i_1<l_1;i_1++){const _item=o_1[k_1[i_1]];const c_1={...c,name:_item,loop:{index:i_1,first:i_1===0,last:i_1===l_1,length:l_1}};s+=e(c_1.name);s+=" in ";s+=e(c_1.names);}s+=e(c.names);return s;})();"`,
    )
  })

  it('break', async () => {
    expect(
      await compile('{{ #for name in names }}{{ break }}{{ /for }}'),
    ).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";const o_0=c.names;const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,name:_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};break;}return s;})();"',
    )
    expect(
      await compile(
        '{{ #for name in names }}{{ #if name }}{{ break }}{{ /if }}{{ /for }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_0=c.names;const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,name:_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};if(c_0.name){break;}}return s;})();"`,
    )
  })

  it('continue', async () => {
    expect(
      await compile('{{ #for name in names }}{{ continue }}{{ /for }}'),
    ).toMatchInlineSnapshot(
      '""use strict";return(async()=>{let s="";const o_0=c.names;const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,name:_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};continue;}return s;})();"',
    )
    expect(
      await compile(
        '{{ #for name in names }}{{ #if name }}{{ continue }}{{ /if }}{{ /for }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_0=c.names;const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,name:_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};if(c_0.name){continue;}}return s;})();"`,
    )
  })

  it('destructuring', async () => {
    expect(
      await compile(
        '{{ #for x, y, z in a }}{{= x }},{{= y }},{{= z }}{{ /for }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_0=c.a;const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,x:a_0?h.getIn(_item,0,"x"):k_0[i_0],y:a_0?h.getIn(_item,1,"y"):_item,z:a_0?h.getIn(_item,2,"z"):_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};s+=e(c_0.x);s+=",";s+=e(c_0.y);s+=",";s+=e(c_0.z);}return s;})();"`,
    )
    expect(
      await compile(
        '{{ #for a, b in nested }}{{= a }}{{= b }}{{ /for }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_0=c.nested;const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,a:a_0?h.getIn(_item,0,"a"):k_0[i_0],b:a_0?h.getIn(_item,1,"b"):_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};s+=e(c_0.a);s+=e(c_0.b);}return s;})();"`,
    )
  })

  it('constructing', async () => {
    expect(
      await compile('{{ #for x in [a, b, c] }}{{= x }}{{ /for }}'),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_0=[c.a, c.b, c.c];const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,x:_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};s+=e(c_0.x);}return s;})();"`,
    )
  })

  it('duo', async () => {
    expect(
      await compile(
        '{{ #for name in names }}{{= name }} in {{= names }}{{ /for }}{{ #for name in names }}{{= name }} in {{= names }}{{ /for }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_0=c.names;const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,name:_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};s+=e(c_0.name);s+=" in ";s+=e(c_0.names);}const o_5=c.names;const a_5=Array.isArray(o_5);const k_5=Object.keys(o_5);const l_5=k_5.length;for(let i_5=0;i_5<l_5;i_5++){const _item=o_5[k_5[i_5]];const c_5={...c,name:_item,loop:{index:i_5,first:i_5===0,last:i_5===l_5,length:l_5}};s+=e(c_5.name);s+=" in ";s+=e(c_5.names);}return s;})();"`,
    )
  })

  it('nesting', async () => {
    expect(
      await compile(
        '{{ #for _as in ass }}{{ #for a in _as }}{{= a }} in {{= _as }} in {{= ass }}{{ /for }}{{ /for }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_0=c.ass;const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,_as:_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};const o_1=c_0._as;const a_1=Array.isArray(o_1);const k_1=Object.keys(o_1);const l_1=k_1.length;for(let i_1=0;i_1<l_1;i_1++){const _item=o_1[k_1[i_1]];const c_0_1={...c_0,a:_item,loop:{index:i_1,first:i_1===0,last:i_1===l_1,length:l_1}};s+=e(c_0_1.a);s+=" in ";s+=e(c_0_1._as);s+=" in ";s+=e(c_0_1.ass);}}return s;})();"`,
    )
  })

  it('loop.index', async () => {
    expect(
      await compile(
        '{{ #for name in names }}{{= loop.index+1 }} {{= name }} in {{= names }}{{ /for }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_0=c.names;const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,name:_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};s+=e(c_0.loop.index+1);s+=" ";s+=e(c_0.name);s+=" in ";s+=e(c_0.names);}return s;})();"`,
    )
  })

  it('filter', async () => {
    expect(
      await compile(
        '{{ #for name in names | split }}{{= name }} in {{= names }}{{ /for }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_0=await f.split.call(c,c.names,c);const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,name:_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};s+=e(c_0.name);s+=" in ";s+=e(c_0.names);}return s;})();"`,
    )
  })

  it('filter w/ args', async () => {
    expect(
      await compile(
        '{{ #for char in name | split: "" }}{{= char }} in {{= name }}{{ /for }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_0=await f.split.call(c,c.name,"");const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,char:_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};s+=e(c_0.char);s+=" in ";s+=e(c_0.name);}return s;})();"`,
    )
  })
})

describe('object', async () => {
  it('basic', async () => {
    expect(
      await compile(
        '{{= names }}{{ #for name in names }}{{= name }} in {{= names }}{{ /for }}{{= names }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+=e(c.names);const o_1=c.names;const a_1=Array.isArray(o_1);const k_1=Object.keys(o_1);const l_1=k_1.length;for(let i_1=0;i_1<l_1;i_1++){const _item=o_1[k_1[i_1]];const c_1={...c,name:_item,loop:{index:i_1,first:i_1===0,last:i_1===l_1,length:l_1}};s+=e(c_1.name);s+=" in ";s+=e(c_1.names);}s+=e(c.names);return s;})();"`,
    )
  })

  it('destructuring', async () => {
    expect(
      await compile('{{ #for k, v in a }}{{= k }}:{{= v }}{{ /for }}'),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_0=c.a;const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,k:a_0?h.getIn(_item,0,"k"):k_0[i_0],v:a_0?h.getIn(_item,1,"v"):_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};s+=e(c_0.k);s+=":";s+=e(c_0.v);}return s;})();"`,
    )
  })

  it('duo', async () => {
    expect(
      await compile(
        '{{ #for name in names }}{{= name }} in {{= names }}{{ /for }}{{ #for name in names }}{{= name }} in {{= names }}{{ /for }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_0=c.names;const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,name:_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};s+=e(c_0.name);s+=" in ";s+=e(c_0.names);}const o_5=c.names;const a_5=Array.isArray(o_5);const k_5=Object.keys(o_5);const l_5=k_5.length;for(let i_5=0;i_5<l_5;i_5++){const _item=o_5[k_5[i_5]];const c_5={...c,name:_item,loop:{index:i_5,first:i_5===0,last:i_5===l_5,length:l_5}};s+=e(c_5.name);s+=" in ";s+=e(c_5.names);}return s;})();"`,
    )
  })

  it('nesting', async () => {
    expect(
      await compile(
        '{{ #for _as in ass }}{{ #for a in _as }}{{= a }} in {{= _as }} in {{= ass }}{{ /for }}{{ /for }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_0=c.ass;const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,_as:_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};const o_1=c_0._as;const a_1=Array.isArray(o_1);const k_1=Object.keys(o_1);const l_1=k_1.length;for(let i_1=0;i_1<l_1;i_1++){const _item=o_1[k_1[i_1]];const c_0_1={...c_0,a:_item,loop:{index:i_1,first:i_1===0,last:i_1===l_1,length:l_1}};s+=e(c_0_1.a);s+=" in ";s+=e(c_0_1._as);s+=" in ";s+=e(c_0_1.ass);}}return s;})();"`,
    )
  })

  it('loop.index', async () => {
    expect(
      await compile(
        '{{ #for name in names }}{{= loop.index+1 }} {{= name }} in {{= names }}{{ /for }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_0=c.names;const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,name:_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};s+=e(c_0.loop.index+1);s+=" ";s+=e(c_0.name);s+=" in ";s+=e(c_0.names);}return s;})();"`,
    )
  })

  it('filter', async () => {
    expect(
      await compile(
        '{{ #for name in names | split }}{{= name }} in {{= names }}{{ /for }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_0=await f.split.call(c,c.names,c);const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,name:_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};s+=e(c_0.name);s+=" in ";s+=e(c_0.names);}return s;})();"`,
    )
  })

  it('filter w/ args', async () => {
    expect(
      await compile(
        '{{ #for char in name | split: "" }}{{= char }} in {{= name }}{{ /for }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_0=await f.split.call(c,c.name,"");const a_0=Array.isArray(o_0);const k_0=Object.keys(o_0);const l_0=k_0.length;for(let i_0=0;i_0<l_0;i_0++){const _item=o_0[k_0[i_0]];const c_0={...c,char:_item,loop:{index:i_0,first:i_0===0,last:i_0===l_0,length:l_0}};s+=e(c_0.char);s+=" in ";s+=e(c_0.name);}return s;})();"`,
    )
  })
})

it('invalid', async () => {
  expect(await compile('{{ #if x }}{{ /for }}', { debug: true })).toMatchInlineSnapshot(`
    " JianJia  Unexpected /for

    {{ /for }}

    11:21"
  `)
  expect(
    await compile('{{ #if x }}{{ break }}{{ /if }}', { debug: true }),
  ).toMatchInlineSnapshot(
    `
    " JianJia  break tag must be inside a for loop

    {{ break }}

    11:22"
  `,
  )
  expect(await compile('{{ break }}', { debug: true })).toMatchInlineSnapshot(
    `
    " JianJia  break tag must be inside a for loop

    {{ break }}

    0:11"
  `,
  )
  expect(await compile('{{ continue }}', { debug: true })).toMatchInlineSnapshot(
    `
    " JianJia  continue tag must be inside a for loop

    {{ continue }}

    0:14"
  `,
  )
})
