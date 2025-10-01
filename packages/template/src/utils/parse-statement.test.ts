import { expect, it } from 'vitest'
import { operators, parseStatement as pe } from './parse-statement'

it('basic', () => {
  Object.entries(operators).forEach(([alias, op]) => {
    expect(pe(`x ${alias} y`)).toEqual([
      { type: 'expression', value: 'x' },
      { type: 'operator', value: op },
      { type: 'expression', value: 'y' },
    ])
    expect(pe(`!x ${alias} !y`)).toEqual([
      { type: 'expression', value: '!x' },
      { type: 'operator', value: op },
      { type: 'expression', value: '!y' },
    ])
  })
})

it('object', () => {
  expect(pe(`{ x }`)).toEqual([{ type: 'expression', value: '{ x }' }])
  expect(pe(`{ x: 1 }`)).toEqual([{ type: 'expression', value: '{ x: 1 }' }])
  expect(pe(`{ x: 1, 'y': "2" }`)).toEqual([{ type: 'expression', value: '{ x: 1, \'y\': "2" }' }])
})

it('w/ filters', () => {
  const filters = [{ name: 'f', args: undefined }]

  Object.entries(operators).forEach(([alias, op]) => {
    expect(pe(`x | f ${alias} y | f`)).toEqual([
      { type: 'expression', value: 'x', filters },
      { type: 'operator', value: op },
      { type: 'expression', value: 'y', filters },
    ])
    expect(pe(`!x | f ${alias} !y | f`)).toEqual([
      { type: 'expression', value: '!x', filters },
      { type: 'operator', value: op },
      { type: 'expression', value: '!y', filters },
    ])
  })
})

it('w/ filters w/ args', () => {
  const filters = [{ name: 'f', args: 'a=1' }]

  Object.entries(operators).forEach(([alias, op]) => {
    expect(pe(`x | f: a=1 ${alias} y | f: a=1`)).toEqual([
      { type: 'expression', value: 'x', filters },
      { type: 'operator', value: op },
      { type: 'expression', value: 'y', filters },
    ])
    expect(pe(`!x | f: a=1 ${alias} !y | f: a=1`)).toEqual([
      { type: 'expression', value: '!x', filters },
      { type: 'operator', value: op },
      { type: 'expression', value: '!y', filters },
    ])
  })
})

it('not', () => {
  expect(pe('not x and not y')).toMatchInlineSnapshot(`
    [
      {
        "type": "expression",
        "value": "not x",
      },
      {
        "type": "operator",
        "value": "&&",
      },
      {
        "type": "expression",
        "value": "not y",
      },
    ]
  `)
  expect(pe('not x | f: a and not y | f: b="x"')).toMatchInlineSnapshot(`
    [
      {
        "filters": [
          {
            "args": "a",
            "name": "f",
          },
        ],
        "type": "expression",
        "value": "not x",
      },
      {
        "type": "operator",
        "value": "&&",
      },
      {
        "filters": [
          {
            "args": "b="x"",
            "name": "f",
          },
        ],
        "type": "expression",
        "value": "not y",
      },
    ]
  `)
})

it('inline if/else', () => {
  expect(pe('"x" if level else "y"')).toMatchInlineSnapshot(`
    [
      {
        "type": "expression",
        "value": ""x" if level else "y"",
      },
    ]
  `)
})
