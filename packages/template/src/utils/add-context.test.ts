import { describe, expect, it } from 'vitest'
import { addContext as ac } from './add-context'

it('basic', () => {
  expect(ac('x', 'c')).toBe('c.x')
  expect(ac('x.y', 'c')).toBe('c.x.y')
  expect(ac('x[y]', 'c')).toBe('c.x[c.y]')
  expect(ac('x["y"]', 'c')).toBe('c.x["y"]')
  expect(ac('x++', 'c')).toBe('c.x++')
  expect(ac('++x', 'c')).toBe('++c.x')
  expect(ac('x+"y"', 'c')).toBe('c.x+"y"')
  expect(ac('"x"+"y"', 'c')).toBe('"x"+"y"')
  expect(ac('"x"+y', 'c')).toBe('"x"+c.y')
  expect(ac('{"x":1}', 'c')).toBe('{"x":1}')
  expect(ac('[1]', 'c')).toBe('[1]')
  expect(ac('[x]', 'c')).toBe('[c.x]')
  expect(ac('[x,1,"y",`2`]', 'c')).toBe('[c.x,1,"y",`2`]')
  expect(ac('[[1]]', 'c')).toBe('[[1]]')
  expect(ac('[[x]]', 'c')).toBe('[[c.x]]')
  expect(ac('[[x,1],["y",`2`]]', 'c')).toBe('[[c.x,1],["y",`2`]]')
})

it('not', () => {
  expect(ac('not x', 'c')).toBe('!c.x')
  expect(ac('not x.y', 'c')).toBe('!c.x.y')
  expect(ac('not x[y]', 'c')).toBe('!c.x[c.y]')
  expect(ac('not x["y"]', 'c')).toBe('!c.x["y"]')
  expect(ac('not x++', 'c')).toBe('!c.x++')
  expect(ac('not ++x', 'c')).toBe('!++c.x')
  expect(ac('not x+"y"', 'c')).toBe('!c.x+"y"')
  expect(ac('not "x"+"y"', 'c')).toBe('!"x"+"y"')
  expect(ac('not "x"+y', 'c')).toBe('!"x"+c.y')
  expect(ac('not {"x":1}', 'c')).toBe('!{"x":1}')
  expect(ac('not [1]', 'c')).toBe('![1]')
  expect(ac('not [x]', 'c')).toBe('![c.x]')
  expect(ac('not [x,1,"y",`2`]', 'c')).toBe('![c.x,1,"y",`2`]')
  expect(ac('not [[1]]', 'c')).toBe('![[1]]')
  expect(ac('not [[x]]', 'c')).toBe('![[c.x]]')
  expect(ac('not [[x,1],["y",`2`]]', 'c')).toBe('![[c.x,1],["y",`2`]]')
})

it('arithmetic', () => {
  [
    '+',
    '-',
    '*',
    '/',
    '%',
    '&&',
    '||',
    '==',
    '!=',
    '===',
    '!==',
    '>',
    '>=',
    '<',
    '<=',
  ].forEach((op) => {
    expect(ac(`1 ${op} 2`, 'c')).toBe(`1 ${op} 2`)
    expect(ac(`1${op}2`, 'c')).toBe(`1${op}2`)
    expect(ac(`x ${op} y`, 'c')).toBe(`c.x ${op} c.y`)
    expect(ac(`x${op}y`, 'c')).toBe(`c.x${op}c.y`)
    expect(ac(`x${op}"y"`, 'c')).toBe(`c.x${op}"y"`)
    expect(ac(`x${op}1`, 'c')).toBe(`c.x${op}1`)
    expect(ac(`1${op}y`, 'c')).toBe(`1${op}c.y`)
  })
})

it('ternary conditional', () => {
  expect(ac('x ? x : "x"', 'c')).toBe('c.x ? c.x : "x"')
  expect(ac('x?x:"x"', 'c')).toBe('c.x?c.x:"x"')
  expect(ac('x?1:true', 'c')).toBe('c.x?1:true')
})

describe('not supported', () => {
  it('object', () => {
    expect(ac('{ x }', 'c')).not.toBe('{ x: c.x }')
    expect(ac('{ x: 1 }', 'c')).not.toBe('{ x: 1 }')
    expect(ac('{ x, "y": `2` }', 'c')).not.toBe('{ x: c.x, "y": `2` }')
  })
})
