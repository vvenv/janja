import { expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('basic', async () => {
  expect(await compile('hello world')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="hello world";return s;})();"`,
  )
  expect(await compile(' hello world ')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" hello world ";return s;})();"`,
  )
  expect(await compile(' hello\nworld ')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" hello\\nworld ";return s;})();"`,
  )
})

it('whitespace control', async () => {
  expect(await compile(' {{ t -}} hello world {{- t }} ')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" ";s+="hello world";s+=" ";return s;})();"`,
  )
  expect(await compile(' {{- t }} hello world {{ t -}}  ')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+=" hello world ";return s;})();"`,
  )
  expect(await compile(' {{- t -}} hello world {{- t -}}  ')).toMatchInlineSnapshot(
    `""use strict";return(async()=>{let s="";s+="hello world";return s;})();"`,
  )
})
