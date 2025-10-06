import { describe, expect, it } from 'vitest'
import { compile } from '../../test/__helper'

describe('array', async () => {
  it('basic', async () => {
    expect(
      await compile(
        '{{= names }}{{ for name in names }}{{= name }} in {{= names }}{{ endfor }}{{= names }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+=e(c.names);{const o=c.names;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,name:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};s+=e(c_0.name);s+=" in ";s+=e(c_0.names);}}s+=e(c.names);return s;})();"`,
    )
  })

  it('break', async () => {
    expect(
      await compile('{{ for name in names }}{{ break }}{{ endfor }}'),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";{const o=c.names;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,name:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};break;}}return s;})();"`,
    )
    expect(
      await compile(
        '{{ for name in names }}{{ if name }}{{ break }}{{ endif }}{{ endfor }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";{const o=c.names;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,name:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};if(c_0.name){break;}}}return s;})();"`,
    )
  })

  it('continue', async () => {
    expect(
      await compile('{{ for name in names }}{{ continue }}{{ endfor }}'),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";{const o=c.names;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,name:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};continue;}}return s;})();"`,
    )
    expect(
      await compile(
        '{{ for name in names }}{{ if name }}{{ continue }}{{ endif }}{{ endfor }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";{const o=c.names;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,name:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};if(c_0.name){continue;}}}return s;})();"`,
    )
  })

  it('destructuring', async () => {
    expect(
      await compile(
        '{{ for x, y, z in a }}{{= x }},{{= y }},{{= z }}{{ endfor }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";{const o=c.a;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,x:a?h.getIn(t,0,"x"):k[i],y:a?h.getIn(t,1,"y"):t,z:a?h.getIn(t,2,"z"):t,loop:{index:i,first:i===0,last:i===l-1,length:l}};s+=e(c_0.x);s+=",";s+=e(c_0.y);s+=",";s+=e(c_0.z);}}return s;})();"`,
    )
    expect(
      await compile(
        '{{ for a, b in nested }}{{= a }}{{= b }}{{ endfor }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";{const o=c.nested;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,a:a?h.getIn(t,0,"a"):k[i],b:a?h.getIn(t,1,"b"):t,loop:{index:i,first:i===0,last:i===l-1,length:l}};s+=e(c_0.a);s+=e(c_0.b);}}return s;})();"`,
    )
  })

  it('constructing', async () => {
    expect(
      await compile('{{ for x in [a, b, c] }}{{= x }}{{ endfor }}'),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";{const o=[c.a, c.b, c.c];const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,x:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};s+=e(c_0.x);}}return s;})();"`,
    )
  })

  it('duo', async () => {
    expect(
      await compile(
        '{{ for name in names }}{{= name }} in {{= names }}{{ endfor }}{{ for name in names }}{{= name }} in {{= names }}{{ endfor }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";{const o=c.names;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,name:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};s+=e(c_0.name);s+=" in ";s+=e(c_0.names);}}{const o=c.names;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_1={...c,name:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};s+=e(c_1.name);s+=" in ";s+=e(c_1.names);}}return s;})();"`,
    )
  })

  it('nesting', async () => {
    expect(
      await compile(
        '{{ for _as in ass }}{{ for a in _as }}{{= a }} in {{= _as }} in {{= ass }}{{ endfor }}{{ endfor }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";{const o=c.ass;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,_as:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};{const o=c_0._as;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0_1={...c_0,a:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};s+=e(c_0_1.a);s+=" in ";s+=e(c_0_1._as);s+=" in ";s+=e(c_0_1.ass);}}}}return s;})();"`,
    )
  })

  it('loop.index', async () => {
    expect(
      await compile(
        '{{ for name in names }}{{= loop.index+1 }} {{= name }} in {{= names }}{{ endfor }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";{const o=c.names;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,name:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};s+=e(c_0.loop.index+1);s+=" ";s+=e(c_0.name);s+=" in ";s+=e(c_0.names);}}return s;})();"`,
    )
  })

  it('filter', async () => {
    expect(
      await compile(
        '{{ for name in names | split }}{{= name }} in {{= names }}{{ endfor }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";{const o=await f.split.call(c,c.names,c);const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,name:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};s+=e(c_0.name);s+=" in ";s+=e(c_0.names);}}return s;})();"`,
    )
  })

  it('filter w/ args', async () => {
    expect(
      await compile(
        '{{ for char in name | split: "" }}{{= char }} in {{= name }}{{ endfor }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";{const o=await f.split.call(c,c.name,"");const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,char:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};s+=e(c_0.char);s+=" in ";s+=e(c_0.name);}}return s;})();"`,
    )
  })
})

describe('object', async () => {
  it('basic', async () => {
    expect(
      await compile(
        '{{= names }}{{ for name in names }}{{= name }} in {{= names }}{{ endfor }}{{= names }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";s+=e(c.names);{const o=c.names;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,name:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};s+=e(c_0.name);s+=" in ";s+=e(c_0.names);}}s+=e(c.names);return s;})();"`,
    )
  })

  it('destructuring', async () => {
    expect(
      await compile('{{ for k, v in a }}{{= k }}:{{= v }}{{ endfor }}'),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";{const o=c.a;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,k:a?h.getIn(t,0,"k"):k[i],v:a?h.getIn(t,1,"v"):t,loop:{index:i,first:i===0,last:i===l-1,length:l}};s+=e(c_0.k);s+=":";s+=e(c_0.v);}}return s;})();"`,
    )
  })

  it('duo', async () => {
    expect(
      await compile(
        '{{ for name in names }}{{= name }} in {{= names }}{{ endfor }}{{ for name in names }}{{= name }} in {{= names }}{{ endfor }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";{const o=c.names;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,name:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};s+=e(c_0.name);s+=" in ";s+=e(c_0.names);}}{const o=c.names;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_1={...c,name:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};s+=e(c_1.name);s+=" in ";s+=e(c_1.names);}}return s;})();"`,
    )
  })

  it('nesting', async () => {
    expect(
      await compile(
        '{{ for _as in ass }}{{ for a in _as }}{{= a }} in {{= _as }} in {{= ass }}{{ endfor }}{{ endfor }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";{const o=c.ass;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,_as:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};{const o=c_0._as;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0_1={...c_0,a:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};s+=e(c_0_1.a);s+=" in ";s+=e(c_0_1._as);s+=" in ";s+=e(c_0_1.ass);}}}}return s;})();"`,
    )
  })

  it('loop.index', async () => {
    expect(
      await compile(
        '{{ for name in names }}{{= loop.index+1 }} {{= name }} in {{= names }}{{ endfor }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";{const o=c.names;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,name:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};s+=e(c_0.loop.index+1);s+=" ";s+=e(c_0.name);s+=" in ";s+=e(c_0.names);}}return s;})();"`,
    )
  })

  it('filter', async () => {
    expect(
      await compile(
        '{{ for name in names | split }}{{= name }} in {{= names }}{{ endfor }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";{const o=await f.split.call(c,c.names,c);const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,name:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};s+=e(c_0.name);s+=" in ";s+=e(c_0.names);}}return s;})();"`,
    )
  })

  it('filter w/ args', async () => {
    expect(
      await compile(
        '{{ for char in name | split: "" }}{{= char }} in {{= name }}{{ endfor }}',
      ),
    ).toMatchInlineSnapshot(
      `""use strict";return(async()=>{let s="";{const o=await f.split.call(c,c.name,"");const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,char:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};s+=e(c_0.char);s+=" in ";s+=e(c_0.name);}}return s;})();"`,
    )
  })
})

it('invalid', async () => {
  expect(await compile('{{ for }}', { debug: true })).toMatchInlineSnapshot(`
    " JianJia  for tag must have a value

    {{ for }}

    0:9"
  `)
  expect(await compile('{{ for x }}', { debug: true })).toMatchInlineSnapshot(
    `"expected tokens endfor, but got nothing"`,
  )
  expect(await compile('{{ endfor }}', { debug: true })).toMatchInlineSnapshot(`
    " JianJia  unexpected endfor

    {{ endfor }}

    0:12"
  `)
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
