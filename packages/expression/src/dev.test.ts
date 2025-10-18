import { expect, it } from 'vitest'
import { Compiler } from './compiler'
import { Parser } from './parser'
import { Tokenizer } from './tokenizer'

function tokenize(template: string) {
  return new Tokenizer().tokenize(template)
}

function parse(template: string) {
  return new Parser().parse(template)
}

function compile(template: string) {
  return new Compiler().compile(new Parser().parse(template), 'c', 'f')
}

it('not', () => {
  expect(compile(' x + 2 ')).toMatchInlineSnapshot(
    `"(c.x+2)"`,
  )
  expect(parse(' x + 2 ')).toMatchInlineSnapshot(
    `
    {
      "end": 3,
      "left": {
        "end": 2,
        "raw": "x",
        "start": 1,
        "type": "ID",
        "value": "x",
      },
      "raw": "+",
      "right": {
        "end": 6,
        "raw": "2",
        "start": 5,
        "type": "NUM",
        "value": 2,
      },
      "start": 3,
      "type": "ADD",
      "value": "+",
    }
  `,
  )
  expect(tokenize(' x + 2 ')).toMatchInlineSnapshot(
    `
    [
      {
        "end": 2,
        "raw": "x",
        "start": 1,
        "type": "ID",
        "value": "x",
      },
      {
        "end": 3,
        "raw": "+",
        "start": 3,
        "type": "ADD",
        "value": "+",
      },
      {
        "end": 6,
        "raw": "2",
        "start": 5,
        "type": "NUM",
        "value": 2,
      },
    ]
  `,
  )
})
