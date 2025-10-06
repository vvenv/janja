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
    `""use strict";return(async()=>{let s="";{const o=c.a;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,x:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};if(c_0.x){s+=e(c_0.x);}}}return s;})();"`,
  )
})

it('if -> for', async () => {
  expect(
    await compile('{{ if a }}{{ for x in a }}{{= x }}{{ endfor }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.a){{const o=c.a;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,x:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};s+=e(c_0.x);}}}return s;})();"`,
  )
})

it('if -> for -> if', async () => {
  expect(
    await compile(
      '{{ if x }}{{ for x in a }}{{ if x }}{{= x }}{{ endif }}{{ endfor }}{{ endif }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x){{const o=c.a;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,x:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};if(c_0.x){s+=e(c_0.x);}}}}return s;})();"`,
  )
})

it('for -> if/else ', async () => {
  expect(
    await compile(
      '{{ for x in a }}{{ if x }}{{= x }}{{ else }}***{{ endif }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{const o=c.a;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,x:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};if(c_0.x){s+=e(c_0.x);}else{s+="***";}}}return s;})();"`,
  )
})

it('for -> if/else - literal', async () => {
  expect(
    await compile(
      '{{ for x in a }}{{ if x }}{{= x }}{{ else }}{{= "***" }}{{ endif }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{const o=c.a;const a=Array.isArray(o);const k=Object.keys(o);const l=k.length;for(let i=0;i<l;i++){const t=o[k[i]];const c_0={...c,x:t,loop:{index:i,first:i===0,last:i===l-1,length:l}};if(c_0.x){s+=e(c_0.x);}else{s+=e("***");}}}return s;})();"`,
  )
})
