import { describe, expect, it } from 'vitest'
import { compile } from '../../test/__helper'

describe('array', async () => {
  it('basic', async () => {
    expect(
      await compile(
        `{{= names }}{{ #for name in names }}{{= name }} in {{= names }}{{ /for }}{{= names }}`,
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+=e(c.names);const o_1_1=c.names;const a_1_1=Array.isArray(o_1_1);const k_1_1=Object.keys(o_1_1);const l_1_1=k_1_1.length;for(let i_1_1=0;i_1_1<l_1_1;i_1_1++){const _item=o_1_1[k_1_1[i_1_1]];const c_1_1={...c,name:_item,loop:{index:i_1_1,first:i_1_1===0,last:i_1_1===l_1_1,length:l_1_1}};s+=e(c_1_1.name);s+=" in ";s+=e(c_1_1.names);}s+=e(c.names);return s;})();"`,
    )
  })

  it('destructuring', async () => {
    expect(
      await compile(
        `{{ #for x, y, z in a }}{{= x }},{{= y }},{{= z }}{{ /for }}`,
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_1_0=c.a;const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,x:a_1_0?h.getIn(_item,0,"x"):k_1_0[i_1_0],y:a_1_0?h.getIn(_item,1,"y"):_item,z:a_1_0?h.getIn(_item,2,"z"):_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};s+=e(c_1_0.x);s+=",";s+=e(c_1_0.y);s+=",";s+=e(c_1_0.z);}return s;})();"`,
    )
  })

  it('constructing', async () => {
    expect(
      await compile(`{{ #for x in [a, b, c] }}{{= x }}{{ /for }}`),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_1_0=[c.a, c.b, c.c];const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,x:_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};s+=e(c_1_0.x);}return s;})();"`,
    )
  })

  it('duo', async () => {
    expect(
      await compile(
        `{{ #for name in names }}{{= name }} in {{= names }}{{ /for }}{{ #for name in names }}{{= name }} in {{= names }}{{ /for }}`,
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_1_0=c.names;const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,name:_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};s+=e(c_1_0.name);s+=" in ";s+=e(c_1_0.names);}const o_1_1=c.names;const a_1_1=Array.isArray(o_1_1);const k_1_1=Object.keys(o_1_1);const l_1_1=k_1_1.length;for(let i_1_1=0;i_1_1<l_1_1;i_1_1++){const _item=o_1_1[k_1_1[i_1_1]];const c_1_1={...c,name:_item,loop:{index:i_1_1,first:i_1_1===0,last:i_1_1===l_1_1,length:l_1_1}};s+=e(c_1_1.name);s+=" in ";s+=e(c_1_1.names);}return s;})();"`,
    )
  })

  it('nesting', async () => {
    expect(
      await compile(
        `{{ #for _as in ass }}{{ #for a in _as }}{{= a }} in {{= _as }} in {{= ass }}{{ /for }}{{ /for }}`,
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_1_0=c.ass;const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,_as:_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};const o_2_0=c_1_0._as;const a_2_0=Array.isArray(o_2_0);const k_2_0=Object.keys(o_2_0);const l_2_0=k_2_0.length;for(let i_2_0=0;i_2_0<l_2_0;i_2_0++){const _item=o_2_0[k_2_0[i_2_0]];const c_1_0_2_0={...c_1_0,a:_item,loop:{index:i_2_0,first:i_2_0===0,last:i_2_0===l_2_0,length:l_2_0}};s+=e(c_1_0_2_0.a);s+=" in ";s+=e(c_1_0_2_0._as);s+=" in ";s+=e(c_1_0_2_0.ass);}}return s;})();"`,
    )
  })

  it('loop.index', async () => {
    expect(
      await compile(
        `{{ #for name in names }}{{= loop.index+1 }} {{= name }} in {{= names }}{{ /for }}`,
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_1_0=c.names;const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,name:_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};s+=e(c_1_0.loop.index+1);s+=" ";s+=e(c_1_0.name);s+=" in ";s+=e(c_1_0.names);}return s;})();"`,
    )
  })

  it('else', async () => {
    expect(
      await compile(
        `{{ #for name in names }}{{= name }}{{ else }}empty{{ /for }}`,
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_1_0=c.names;const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;if(l_1_0){for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,name:_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};s+=e(c_1_0.name);}}else{s+="empty";}return s;})();"`,
    )
  })

  it('filter', async () => {
    expect(
      await compile(
        `{{ #for name in names | split }}{{= name }} in {{= names }}{{ /for }}`,
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_1_0=await f.split.call(c,c.names,c);const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,name:_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};s+=e(c_1_0.name);s+=" in ";s+=e(c_1_0.names);}return s;})();"`,
    )
  })

  it('filter w/ args', async () => {
    expect(
      await compile(
        `{{ #for char in name | split: "" }}{{= char }} in {{= name }}{{ /for }}`,
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_1_0=await f.split.call(c,c.name,"");const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,char:_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};s+=e(c_1_0.char);s+=" in ";s+=e(c_1_0.name);}return s;})();"`,
    )
  })
})

describe('object', async () => {
  it('basic', async () => {
    expect(
      await compile(
        `{{= names }}{{ #for name in names }}{{= name }} in {{= names }}{{ /for }}{{= names }}`,
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+=e(c.names);const o_1_1=c.names;const a_1_1=Array.isArray(o_1_1);const k_1_1=Object.keys(o_1_1);const l_1_1=k_1_1.length;for(let i_1_1=0;i_1_1<l_1_1;i_1_1++){const _item=o_1_1[k_1_1[i_1_1]];const c_1_1={...c,name:_item,loop:{index:i_1_1,first:i_1_1===0,last:i_1_1===l_1_1,length:l_1_1}};s+=e(c_1_1.name);s+=" in ";s+=e(c_1_1.names);}s+=e(c.names);return s;})();"`,
    )
  })

  it('destructuring', async () => {
    expect(
      await compile(`{{ #for k, v in a }}{{= k }}:{{= v }}{{ /for }}`),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_1_0=c.a;const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,k:a_1_0?h.getIn(_item,0,"k"):k_1_0[i_1_0],v:a_1_0?h.getIn(_item,1,"v"):_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};s+=e(c_1_0.k);s+=":";s+=e(c_1_0.v);}return s;})();"`,
    )
  })

  it('duo', async () => {
    expect(
      await compile(
        `{{ #for name in names }}{{= name }} in {{= names }}{{ /for }}{{ #for name in names }}{{= name }} in {{= names }}{{ /for }}`,
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_1_0=c.names;const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,name:_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};s+=e(c_1_0.name);s+=" in ";s+=e(c_1_0.names);}const o_1_1=c.names;const a_1_1=Array.isArray(o_1_1);const k_1_1=Object.keys(o_1_1);const l_1_1=k_1_1.length;for(let i_1_1=0;i_1_1<l_1_1;i_1_1++){const _item=o_1_1[k_1_1[i_1_1]];const c_1_1={...c,name:_item,loop:{index:i_1_1,first:i_1_1===0,last:i_1_1===l_1_1,length:l_1_1}};s+=e(c_1_1.name);s+=" in ";s+=e(c_1_1.names);}return s;})();"`,
    )
  })

  it('nesting', async () => {
    expect(
      await compile(
        `{{ #for _as in ass }}{{ #for a in _as }}{{= a }} in {{= _as }} in {{= ass }}{{ /for }}{{ /for }}`,
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_1_0=c.ass;const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,_as:_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};const o_2_0=c_1_0._as;const a_2_0=Array.isArray(o_2_0);const k_2_0=Object.keys(o_2_0);const l_2_0=k_2_0.length;for(let i_2_0=0;i_2_0<l_2_0;i_2_0++){const _item=o_2_0[k_2_0[i_2_0]];const c_1_0_2_0={...c_1_0,a:_item,loop:{index:i_2_0,first:i_2_0===0,last:i_2_0===l_2_0,length:l_2_0}};s+=e(c_1_0_2_0.a);s+=" in ";s+=e(c_1_0_2_0._as);s+=" in ";s+=e(c_1_0_2_0.ass);}}return s;})();"`,
    )
  })

  it('loop.index', async () => {
    expect(
      await compile(
        `{{ #for name in names }}{{= loop.index+1 }} {{= name }} in {{= names }}{{ /for }}`,
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_1_0=c.names;const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,name:_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};s+=e(c_1_0.loop.index+1);s+=" ";s+=e(c_1_0.name);s+=" in ";s+=e(c_1_0.names);}return s;})();"`,
    )
  })

  it('else', async () => {
    expect(
      await compile(
        `{{ #for name in names }}{{= name }}{{ else }}empty{{ /for }}`,
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_1_0=c.names;const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;if(l_1_0){for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,name:_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};s+=e(c_1_0.name);}}else{s+="empty";}return s;})();"`,
    )
  })

  it('filter', async () => {
    expect(
      await compile(
        `{{ #for name in names | split }}{{= name }} in {{= names }}{{ /for }}`,
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_1_0=await f.split.call(c,c.names,c);const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,name:_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};s+=e(c_1_0.name);s+=" in ";s+=e(c_1_0.names);}return s;})();"`,
    )
  })

  it('filter w/ args', async () => {
    expect(
      await compile(
        `{{ #for char in name | split: "" }}{{= char }} in {{= name }}{{ /for }}`,
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";const o_1_0=await f.split.call(c,c.name,"");const a_1_0=Array.isArray(o_1_0);const k_1_0=Object.keys(o_1_0);const l_1_0=k_1_0.length;for(let i_1_0=0;i_1_0<l_1_0;i_1_0++){const _item=o_1_0[k_1_0[i_1_0]];const c_1_0={...c,char:_item,loop:{index:i_1_0,first:i_1_0===0,last:i_1_0===l_1_0,length:l_1_0}};s+=e(c_1_0.char);s+=" in ";s+=e(c_1_0.name);}return s;})();"`,
    )
  })
})

it('invalid', async () => {
  expect(await compile('{{ #if x }}{{ /for }}')).toMatchInlineSnapshot(`""`)

  expect(
    await compile('{{ #if x }}{{ /for }}', { debug: true }),
  ).toMatchInlineSnapshot(`
    " JianJia  "end_for" must follow "for", not "if".

    1: {{ #if x }}{{ /for }}
       ^^^^^^^^^^^
                  ^^^^^^^^^^
    "
  `)
})
