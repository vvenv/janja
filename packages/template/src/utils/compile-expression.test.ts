import { describe, expect, it } from 'vitest'
import { compileExpression as ce } from './compile-expression'

it('basic', () => {
  expect(ce('x', 'c')).toBe('c.x')
  expect(ce('x.y', 'c')).toBe('c.x.y')
  expect(ce('x[y]', 'c')).toBe('c.x[c.y]')
  expect(ce('x["y"]', 'c')).toBe('c.x["y"]')
  expect(ce('x++', 'c')).toBe('c.x++')
  expect(ce('++x', 'c')).toBe('++c.x')
  expect(ce('{"x":1}', 'c')).toBe('{"x":1}')
  expect(ce('[1]', 'c')).toBe('[1]')
})

it('literal', () => {
  [
    'true',
    'false',
    'null',
    'undefined',
    '1',
    '1.1',
    '"*"',
    '"x"',
    '\'x\'',
    '`x`',
  ].forEach((value) => {
    expect(ce(value, 'c')).toBe(value)
  })
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
    expect(ce(`1 ${op} 2`, 'c')).toBe(`1 ${op} 2`)
    expect(ce(`1${op}2`, 'c')).toBe(`1${op}2`)
    expect(ce(`x ${op} y`, 'c')).toBe(`c.x ${op} c.y`)
    expect(ce(`x${op}y`, 'c')).toBe(`c.x${op}c.y`)
    expect(ce(`x${op}"y"`, 'c')).toBe(`c.x${op}"y"`)
    expect(ce(`x${op}1`, 'c')).toBe(`c.x${op}1`)
    expect(ce(`1${op}y`, 'c')).toBe(`1${op}c.y`)
  })
})

it('ternary conditional', () => {
  expect(ce('x ? x : "x"', 'c')).toBe('c.x ? c.x : "x"')
  expect(ce('x?x:"x"', 'c')).toBe('c.x?c.x:"x"')
})

it('w/ filters', () => {
  expect(
    ce('x', 'c', [
      { name: 'y', args: '1' },
      { name: 'z', args: '' },
    ]),
  ).toMatchInlineSnapshot('"await f.z.call(c,await f.y.call(c,c.x,1),c)"')
  expect(
    ce('x', 'c', [
      { name: 'y', args: '"1"' },
      { name: 'z', args: '' },
    ]),
  ).toMatchInlineSnapshot('"await f.z.call(c,await f.y.call(c,c.x,"1"),c)"')
})

it('not', () => {
  expect(
    ce('not x', 'c', [
      { name: 'y', args: '1' },
      { name: 'z', args: 'a="b"' },
    ]),
  ).toMatchInlineSnapshot('"await f.z.call(c,await f.y.call(c,!c.x,1),{a:"b"})"')
  expect(
    ce('x', 'c', [
      { name: 'y', args: '"1"' },
      { name: 'z', args: 'b="c", d=2' },
    ]),
  ).toMatchInlineSnapshot('"await f.z.call(c,await f.y.call(c,c.x,"1"),{b:"c",d:2})"')
})

describe('not supported', () => {
  it('object', () => {
    expect(ce('{ x }', 'c')).toBe('{ c.x }')
  })
})
