import { expect, it } from 'vitest'
import { compile } from '../../test/__helper'

it('error', async () => {
  try {
    await compile('{{ set }}')
    expect(true).toBe(false)
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "set" requires expression]`,
    )
    expect(error.details).toMatchInlineSnapshot(`
      ""set" requires expression

      1｜ {{ set }}
       ｜ ^       ^
      "
    `)
  }
  try {
    await compile('{{ set x = [1] }}')
    expect(true).toBe(false)
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: Unexpect "["]`,
    )
    expect(error.details).toMatchInlineSnapshot(`
      "Unexpect "["

      1｜ {{ set x = [1] }}
       ｜            ^
      "
    `)
  }
  try {
    await compile('{{ set x = {a:1} }}')
    expect(true).toBe(false)
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: Unexpect "{"]`,
    )
    expect(error.details).toMatchInlineSnapshot(`
      "Unexpect "{"

      1｜ {{ set x = {a:1} }}
       ｜            ^
      "
    `)
  }
  try {
    await compile('{{ endset }}')
    expect(true).toBe(false)
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: Unknown "endset" directive]`,
    )
    expect(error.details).toMatchInlineSnapshot(`
      "Unknown "endset" directive

      1｜ {{ endset }}
       ｜ ^          ^
      "
    `)
  }
  try {
    await compile('{{ set 1 = "a" }}')
    expect(true).toBe(false)
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[TypeError: Cannot read properties of undefined (reading 'map')]`)
    expect(error.details).toMatchInlineSnapshot(`undefined`)
  }
  try {
    await compile('{{ set x = y = 1 }}')
    expect(true).toBe(false)
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[AssertionError: expected true to be false // Object.is equality]`)
    expect(error.details).toMatchInlineSnapshot(`undefined`)
  }
})

it('literal', async () => {
  expect(
    await compile('{{ set x = "" }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";Object.assign(c,{x:""});return s;})();"`,
  )
  expect(
    await compile('{{ set x = "a" }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";Object.assign(c,{x:"a"});return s;})();"`,
  )
  expect(
    await compile('{{ set x = 12 }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";Object.assign(c,{x:12});return s;})();"`,
  )
  expect(
    await compile('{{ set x = 12.34 }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";Object.assign(c,{x:12.34});return s;})();"`,
  )
  expect(
    await compile('{{ set x = true }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";Object.assign(c,{x:true});return s;})();"`,
  )
  expect(
    await compile('{{ set x = false }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";Object.assign(c,{x:false});return s;})();"`,
  )
})

it('id', async () => {
  expect(
    await compile('{{ set x = y }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";Object.assign(c,{x:c.y});return s;})();"`,
  )
  expect(
    await compile('{{ set x = y | f }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";Object.assign(c,{x:(await f.f.call(c,c.y))});return s;})();"`,
  )
  expect(
    await compile('{{ set x = y | f(a) }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";Object.assign(c,{x:(await f.f.call(c,c.y,c.a))});return s;})();"`,
  )
  expect(
    await compile('{{ set x = y.z }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";Object.assign(c,{x:c.y.z});return s;})();"`,
  )
  expect(
    await compile('{{ set x = y.z | f }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";Object.assign(c,{x:(await f.f.call(c,c.y.z))});return s;})();"`,
  )
  expect(
    await compile('{{ set x = y.z | f(a) }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";Object.assign(c,{x:(await f.f.call(c,c.y.z,c.a))});return s;})();"`,
  )
})

it('expression', async () => {
  expect(
    await compile('{{ set x = y and z }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";Object.assign(c,{x:c.y&&c.z});return s;})();"`,
  )
})

it('destructuring', async () => {
  expect(
    await compile('{{ set (x, y) = z }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";Object.assign(c,f.pick.call(c,c.z,["x","y"]));return s;})();"`,
  )
  expect(
    await compile('{{ set (x, y) = z | f }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";Object.assign(c,f.pick.call(c,(await f.f.call(c,c.z)),["x","y"]));return s;})();"`,
  )
  expect(
    await compile('{{ set (x, y) = z | f(a) }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";Object.assign(c,f.pick.call(c,(await f.f.call(c,c.z,c.a)),["x","y"]));return s;})();"`,
  )
})

it('override', async () => {
  expect(
    await compile('{{ set x = \'y\' }}{{ set x = "y" }}'),
  ).toMatchInlineSnapshot(
    `"return(async()=>{let s="";Object.assign(c,{x:"y"});Object.assign(c,{x:"y"});return s;})();"`,
  )
})
