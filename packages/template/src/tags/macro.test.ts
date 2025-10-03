import { expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('basic', async () => {
  expect(await compile('{{ macro m }}MACRO{{ endmacro }}')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="MACRO";return s;})();"`,
  )
  expect(
    await compile('{{ macro m: x, y }}{{= x }}{{= y }}{{ endmacro }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=e(c.x);s+=e(c.y);return s;})();"`,
  )
})

it('default args', async () => {
  expect(
    await compile('{{ macro m: x="=", y=1 }}{{= x }}{{= y }}{{ endmacro }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=e(c.x);s+=e(c.y);return s;})();"`,
  )
})

it('caller', async () => {
  expect(
    await compile('{{ macro n: x, y }}{{= x }}{{ caller }}{{= y }}{{ endmacro }}'),
  ).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=e(c.x);s+=e(c.y);return s;})();"`,
  )
})

it('invalid', async () => {
  expect(await compile('{{ macro }}', { debug: true })).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
  )
  expect(await compile('{{ macro n }}', { debug: true })).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
  )
  expect(await compile('{{ endmacro }}', { debug: true })).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
  )
  expect(await compile('{{ macro 1 }}{{ endmacro }}', { debug: true })).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
  )
  expect(await compile('{{ caller }}', { debug: true })).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";return s;})();"`,
  )
})
