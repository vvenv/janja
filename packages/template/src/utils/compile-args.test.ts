import { expect, it } from 'vitest'
import { compileArgs } from './compile-args'

it('basic', () => {
  expect(compileArgs('', 'c')).toEqual([])
  expect(compileArgs('a', 'c')).toEqual(['c.a'])
})

it('multiple', () => {
  expect(compileArgs('a, b', 'c')).toEqual(['c.a', 'c.b'])
  expect(compileArgs('a, a', 'c')).toEqual(['c.a', 'c.a'])
})

it('named', () => {
  expect(compileArgs('a=b', 'c')).toEqual(['{a:c.b}'])
  expect(compileArgs('a="b"', 'c')).toEqual(['{a:"b"}'])
  expect(compileArgs('a=a', 'c')).toEqual(['{a:c.a}'])
  expect(compileArgs('a=a, b=`b`', 'c')).toEqual(['{a:c.a,b:`b`}'])
  expect(compileArgs('a=true, b=1', 'c')).toEqual(['{a:true,b:1}'])
})

it('literal', () => {
  expect(compileArgs('\'\'', 'c')).toEqual(['\'\''])
  expect(compileArgs('""', 'c')).toEqual(['""'])
  expect(compileArgs('``', 'c')).toEqual(['``'])
  expect(compileArgs('","', 'c')).toEqual(['","'])
  expect(compileArgs('true', 'c')).toEqual(['true'])
  expect(compileArgs('1', 'c')).toEqual(['1'])
  expect(compileArgs('"a"', 'c')).toEqual(['"a"'])
  expect(compileArgs('"a", "b"', 'c')).toEqual(['"a"', '"b"'])
  expect(compileArgs('"a", "a"', 'c')).toEqual(['"a"', '"a"'])
})

it('mixture', () => {
  expect(compileArgs('\'a\', "a", `a`, a', 'c')).toEqual([
    '\'a\'',
    '"a"',
    '`a`',
    'c.a',
  ])
  expect(compileArgs('\',\', ",", `,`, a', 'c')).toEqual([
    '\',\'',
    '","',
    '`,`',
    'c.a',
  ])
})
