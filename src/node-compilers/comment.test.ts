import { expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('comment', async () => {
  expect(
    await compile('{{# foo }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+="<!-- foo -->";return s;})();"`,
  )
  expect(
    await compile('{{# foo\nbar }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";s+="<!-- foo\\nbar -->";return s;})();"`,
  )
})

it('w stripComments', async () => {
  expect(
    await compile('{{# foo }}', { stripComments: true }),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";return s;})();"`,
  )
  expect(
    await compile('{{# foo\nbar }}', { stripComments: true }),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";return s;})();"`,
  )
})
