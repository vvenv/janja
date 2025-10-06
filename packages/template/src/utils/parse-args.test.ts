import { expect, it } from 'vitest'
import { parseArgs } from './parse-args'

it('basic', () => {
  expect(parseArgs('a')).toEqual(['a'])
})

it('multiple', () => {
  expect(parseArgs('a, a')).toEqual(['a', 'a'])
  expect(parseArgs('a, b')).toEqual(['a', 'b'])
})

it('default args', () => {
  expect(parseArgs('a="foo"')).toEqual(['a="foo"'])
  expect(parseArgs('a="foo", b=`bar`, c=123')).toEqual([
    'a="foo"',
    'b=`bar`',
    'c=123',
  ])
  expect(parseArgs('a=", "')).toEqual(['a=", "'])
  expect(parseArgs('a=", ", b=`, `, c=123')).toEqual([
    'a=", "',
    'b=`, `',
    'c=123',
  ])
})
