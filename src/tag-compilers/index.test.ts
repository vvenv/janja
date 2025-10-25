import { expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('empty tag', async () => {
  expect(await compile('{{ }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
  )
})

it('for -> if', async () => {
  expect(
    await compile('{{ for x of a }}{{ if x }}{{= x }}{{ endif }}{{ endfor }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{for(const x of c.a){const c_0={...c,x,};if(c_0.x){s+=e(c_0.x);}}}return s;})();"`,
  )
})

it('if -> for', async () => {
  expect(
    await compile('{{ if a }}{{ for x of a }}{{= x }}{{ endfor }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.a){{for(const x of c.a){const c_0={...c,x,};s+=e(c_0.x);}}}return s;})();"`,
  )
})

it('if -> for -> if', async () => {
  expect(
    await compile(
      '{{ if x }}{{ for x of a }}{{ if x }}{{= x }}{{ endif }}{{ endfor }}{{ endif }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";if(c.x){{for(const x of c.a){const c_0={...c,x,};if(c_0.x){s+=e(c_0.x);}}}}return s;})();"`,
  )
})

it('for -> if/else ', async () => {
  expect(
    await compile(
      '{{ for x of a }}{{ if x }}{{= x }}{{ else }}***{{ endif }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{for(const x of c.a){const c_0={...c,x,};if(c_0.x){s+=e(c_0.x);}else{}}}return s;})();"`,
  )
})

it('for -> if/else - literal', async () => {
  expect(
    await compile(
      '{{ for x of a }}{{ if x }}{{= x }}{{ else }}{{= "***" }}{{ endif }}{{ endfor }}',
    ),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";{for(const x of c.a){const c_0={...c,x,};if(c_0.x){s+=e(c_0.x);}else{s+=e("***");}}}return s;})();"`,
  )
})
