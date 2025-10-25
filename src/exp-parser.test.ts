import { expect, it } from 'vitest'
import { ExpParser } from './exp-parser'

function parse(template: string) {
  return new ExpParser().parse(template)
}

it('invalid', () => {
  expect(() => parse('not')).toThrowErrorMatchingInlineSnapshot(
    `[ParseError: unexpected end of expression]`,
  )
  expect(() => parse('and')).toThrowErrorMatchingInlineSnapshot(
    `[ParseError: no left operand for "AND"]`,
  )
  expect(() => parse('a and')).toThrowErrorMatchingInlineSnapshot(
    `[ParseError: no right operand for "AND"]`,
  )
  expect(() => parse('(')).toThrowErrorMatchingInlineSnapshot(
    `[ParseError: unexpected end of expression]`,
  )
  expect(() => parse('(a')).toThrowErrorMatchingInlineSnapshot(
    `[ParseError: expected "RP" after "LP"]`,
  )
  expect(() => parse('a(')).toThrowErrorMatchingInlineSnapshot(
    `[ParseError: expected "RP" after "LP"]`,
  )
  expect(() => parse('a.')).toThrowErrorMatchingInlineSnapshot(
    `[ParseError: expected "ID" after "DOT"]`,
  )
  expect(() => parse('a.1')).toThrowErrorMatchingInlineSnapshot(
    `[ParseError: expected "ID" after "DOT"]`,
  )
  expect(() => parse('|')).toThrowErrorMatchingInlineSnapshot(
    `[ParseError: no left operand for "PIPE"]`,
  )
  expect(() => parse('a |')).toThrowErrorMatchingInlineSnapshot(
    `[ParseError: expected "ID" after "PIPE"]`,
  )
  expect(() => parse('a | 1')).toThrowErrorMatchingInlineSnapshot(
    `[ParseError: expected "ID" after "PIPE"]`,
  )
  expect(() => parse('a | f(')).toThrowErrorMatchingInlineSnapshot(
    `[ParseError: expected "RP" after "LP"]`,
  )
  expect(() => parse('x if')).toThrowErrorMatchingInlineSnapshot(
    `[ParseError: expected test expression]`,
  )
  expect(() => parse('x if y else')).toThrowErrorMatchingInlineSnapshot(
    `[ParseError: expected alternative expression]`,
  )
  expect(() => parse('x if y else ,')).toThrowErrorMatchingInlineSnapshot(
    `[ParseError: expected alternative expression]`,
  )
  expect(() => parse('x if else')).toThrowErrorMatchingInlineSnapshot(
    `[ParseError: expected test expression]`,
  )
  expect(() => parse('x if if')).toThrowErrorMatchingInlineSnapshot(
    `[ParseError: expected test expression]`,
  )
  expect(() => parse('x if ,')).toThrowErrorMatchingInlineSnapshot(
    `[ParseError: expected test expression]`,
  )
})

it('empty', () => {
  expect(parse('')).toMatchInlineSnapshot(
    `null`,
  )
})

it('string', () => {
  expect(parse('\'foo\'')).toMatchInlineSnapshot(
    `
    {
      "end": 5,
      "raw": "'foo'",
      "start": 0,
      "type": "STR",
      "value": "foo",
    }
  `,
  )
  expect(parse('"bar"')).toMatchInlineSnapshot(
    `
    {
      "end": 5,
      "raw": ""bar"",
      "start": 0,
      "type": "STR",
      "value": "bar",
    }
  `,
  )
})

it('number', () => {
  expect(parse('123')).toMatchInlineSnapshot(
    `
    {
      "end": 3,
      "raw": "123",
      "start": 0,
      "type": "NUM",
      "value": 123,
    }
  `,
  )
  expect(parse('12.34')).toMatchInlineSnapshot(
    `
    {
      "end": 5,
      "raw": "12.34",
      "start": 0,
      "type": "NUM",
      "value": 12.34,
    }
  `,
  )
})

it('boolean', () => {
  expect(parse('true')).toMatchInlineSnapshot(
    `
    {
      "end": 4,
      "raw": "true",
      "start": 0,
      "type": "BOOL",
      "value": true,
    }
  `,
  )
  expect(parse('false')).toMatchInlineSnapshot(
    `
    {
      "end": 5,
      "raw": "false",
      "start": 0,
      "type": "BOOL",
      "value": false,
    }
  `,
  )
})

it('id', () => {
  expect(parse('a')).toMatchInlineSnapshot(
    `
    {
      "end": 1,
      "raw": "a",
      "start": 0,
      "type": "ID",
      "value": "a",
    }
  `,
  )
  expect(parse('abc')).toMatchInlineSnapshot(
    `
    {
      "end": 3,
      "raw": "abc",
      "start": 0,
      "type": "ID",
      "value": "abc",
    }
  `,
  )
})

it('dot', () => {
  expect(parse('.')).toMatchInlineSnapshot(
    `null`,
  )
  expect(parse('a.b.c')).toMatchInlineSnapshot(
    `
    {
      "end": 1,
      "path": [
        {
          "end": 3,
          "raw": "b",
          "start": 2,
          "type": "ID",
          "value": "b",
        },
        {
          "end": 5,
          "raw": "c",
          "start": 4,
          "type": "ID",
          "value": "c",
        },
      ],
      "raw": "a",
      "start": 0,
      "type": "ID",
      "value": "a",
    }
  `,
  )
  expect(parse('a.b.c(x, y, z)')).toMatchInlineSnapshot(
    `
    {
      "args": [
        {
          "end": 7,
          "raw": "x",
          "start": 6,
          "type": "ID",
          "value": "x",
        },
        {
          "end": 10,
          "raw": "y",
          "start": 9,
          "type": "ID",
          "value": "y",
        },
        {
          "end": 13,
          "raw": "z",
          "start": 12,
          "type": "ID",
          "value": "z",
        },
      ],
      "end": 1,
      "path": [
        {
          "end": 3,
          "raw": "b",
          "start": 2,
          "type": "ID",
          "value": "b",
        },
        {
          "end": 5,
          "raw": "c",
          "start": 4,
          "type": "ID",
          "value": "c",
        },
      ],
      "raw": "a",
      "start": 0,
      "type": "ID",
      "value": "a",
    }
  `,
  )
})

it('not', () => {
  expect(parse('not a')).toMatchInlineSnapshot(
    `
    {
      "argument": {
        "end": 5,
        "raw": "a",
        "start": 4,
        "type": "ID",
        "value": "a",
      },
      "end": 3,
      "raw": "not",
      "start": 0,
      "type": "NOT",
      "value": "not",
    }
  `,
  )
  expect(parse('not not a')).toMatchInlineSnapshot(
    `
    {
      "argument": {
        "argument": {
          "end": 9,
          "raw": "a",
          "start": 8,
          "type": "ID",
          "value": "a",
        },
        "end": 7,
        "raw": "not",
        "start": 4,
        "type": "NOT",
        "value": "not",
      },
      "end": 3,
      "raw": "not",
      "start": 0,
      "type": "NOT",
      "value": "not",
    }
  `,
  )
  expect(parse('not x | f(a, "b")')).toMatchInlineSnapshot(
    `
    {
      "argument": {
        "end": 6,
        "left": {
          "end": 5,
          "raw": "x",
          "start": 4,
          "type": "ID",
          "value": "x",
        },
        "raw": "|",
        "right": {
          "args": [
            {
              "end": 11,
              "raw": "a",
              "start": 10,
              "type": "ID",
              "value": "a",
            },
            {
              "end": 16,
              "raw": ""b"",
              "start": 13,
              "type": "STR",
              "value": "b",
            },
          ],
          "end": 9,
          "raw": "f",
          "start": 8,
          "type": "ID",
          "value": "f",
        },
        "start": 6,
        "type": "PIPE",
        "value": "|",
      },
      "end": 3,
      "raw": "not",
      "start": 0,
      "type": "NOT",
      "value": "not",
    }
  `,
  )
})

it('and', () => {
  expect(parse('a and b')).toMatchInlineSnapshot(
    `
    {
      "end": 5,
      "left": {
        "end": 1,
        "raw": "a",
        "start": 0,
        "type": "ID",
        "value": "a",
      },
      "raw": "and",
      "right": {
        "end": 7,
        "raw": "b",
        "start": 6,
        "type": "ID",
        "value": "b",
      },
      "start": 2,
      "type": "AND",
      "value": "and",
    }
  `,
  )
})

it('or', () => {
  expect(parse('a or b')).toMatchInlineSnapshot(
    `
    {
      "end": 4,
      "left": {
        "end": 1,
        "raw": "a",
        "start": 0,
        "type": "ID",
        "value": "a",
      },
      "raw": "or",
      "right": {
        "end": 6,
        "raw": "b",
        "start": 5,
        "type": "ID",
        "value": "b",
      },
      "start": 2,
      "type": "OR",
      "value": "or",
    }
  `,
  )
})

it('eq', () => {
  expect(parse('a eq b')).toMatchInlineSnapshot(
    `
    {
      "end": 4,
      "left": {
        "end": 1,
        "raw": "a",
        "start": 0,
        "type": "ID",
        "value": "a",
      },
      "raw": "eq",
      "right": {
        "end": 6,
        "raw": "b",
        "start": 5,
        "type": "ID",
        "value": "b",
      },
      "start": 2,
      "type": "EQ",
      "value": "eq",
    }
  `,
  )
})

it('ne', () => {
  expect(parse('a ne b')).toMatchInlineSnapshot(
    `
    {
      "end": 4,
      "left": {
        "end": 1,
        "raw": "a",
        "start": 0,
        "type": "ID",
        "value": "a",
      },
      "raw": "ne",
      "right": {
        "end": 6,
        "raw": "b",
        "start": 5,
        "type": "ID",
        "value": "b",
      },
      "start": 2,
      "type": "NE",
      "value": "ne",
    }
  `,
  )
})

it('add', () => {
  expect(parse('a + b')).toMatchInlineSnapshot(
    `
    {
      "end": 2,
      "left": {
        "end": 1,
        "raw": "a",
        "start": 0,
        "type": "ID",
        "value": "a",
      },
      "raw": "+",
      "right": {
        "end": 5,
        "raw": "b",
        "start": 4,
        "type": "ID",
        "value": "b",
      },
      "start": 2,
      "type": "ADD",
      "value": "+",
    }
  `,
  )
})

it('sub', () => {
  expect(parse('a - b')).toMatchInlineSnapshot(
    `
    {
      "end": 5,
      "raw": "b",
      "start": 4,
      "type": "ID",
      "value": "b",
    }
  `,
  )
})

it('mul', () => {
  expect(parse('a * b')).toMatchInlineSnapshot(
    `
    {
      "end": 2,
      "left": {
        "end": 1,
        "raw": "a",
        "start": 0,
        "type": "ID",
        "value": "a",
      },
      "raw": "*",
      "right": {
        "end": 5,
        "raw": "b",
        "start": 4,
        "type": "ID",
        "value": "b",
      },
      "start": 2,
      "type": "MUL",
      "value": "*",
    }
  `,
  )
})

it('div', () => {
  expect(parse('a / b')).toMatchInlineSnapshot(
    `
    {
      "end": 2,
      "left": {
        "end": 1,
        "raw": "a",
        "start": 0,
        "type": "ID",
        "value": "a",
      },
      "raw": "/",
      "right": {
        "end": 5,
        "raw": "b",
        "start": 4,
        "type": "ID",
        "value": "b",
      },
      "start": 2,
      "type": "DIV",
      "value": "/",
    }
  `,
  )
})

it('mod', () => {
  expect(parse('a % b')).toMatchInlineSnapshot(
    `
    {
      "end": 2,
      "left": {
        "end": 1,
        "raw": "a",
        "start": 0,
        "type": "ID",
        "value": "a",
      },
      "raw": "%",
      "right": {
        "end": 5,
        "raw": "b",
        "start": 4,
        "type": "ID",
        "value": "b",
      },
      "start": 2,
      "type": "MOD",
      "value": "%",
    }
  `,
  )
})

it('=', () => {
  expect(parse('a = b')).toMatchInlineSnapshot(
    `
    {
      "end": 2,
      "left": {
        "end": 1,
        "raw": "a",
        "start": 0,
        "type": "ID",
        "value": "a",
      },
      "raw": "=",
      "right": {
        "end": 5,
        "raw": "b",
        "start": 4,
        "type": "ID",
        "value": "b",
      },
      "start": 2,
      "type": "SET",
      "value": "=",
    }
  `,
  )
})

it('in', () => {
  expect(parse('a in b')).toMatchInlineSnapshot(
    `
    {
      "end": 4,
      "left": {
        "end": 1,
        "raw": "a",
        "start": 0,
        "type": "ID",
        "value": "a",
      },
      "raw": "in",
      "right": {
        "end": 6,
        "raw": "b",
        "start": 5,
        "type": "ID",
        "value": "b",
      },
      "start": 2,
      "type": "IN",
      "value": "in",
    }
  `,
  )
})

it('ni', () => {
  expect(parse('a ni b')).toMatchInlineSnapshot(
    `
    {
      "end": 4,
      "left": {
        "end": 1,
        "raw": "a",
        "start": 0,
        "type": "ID",
        "value": "a",
      },
      "raw": "ni",
      "right": {
        "end": 6,
        "raw": "b",
        "start": 5,
        "type": "ID",
        "value": "b",
      },
      "start": 2,
      "type": "NI",
      "value": "ni",
    }
  `,
  )
})

it('of', () => {
  expect(parse('a of b')).toMatchInlineSnapshot(
    `
    {
      "end": 4,
      "left": {
        "end": 1,
        "raw": "a",
        "start": 0,
        "type": "ID",
        "value": "a",
      },
      "raw": "of",
      "right": {
        "end": 6,
        "raw": "b",
        "start": 5,
        "type": "ID",
        "value": "b",
      },
      "start": 2,
      "type": "OF",
      "value": "of",
    }
  `,
  )
})

it('sequence', () => {
  expect(parse('(a,"b",1)')).toMatchInlineSnapshot(
    `
    {
      "elements": [
        {
          "end": 2,
          "raw": "a",
          "start": 1,
          "type": "ID",
          "value": "a",
        },
        {
          "end": 6,
          "raw": ""b"",
          "start": 3,
          "type": "STR",
          "value": "b",
        },
        {
          "end": 8,
          "raw": "1",
          "start": 7,
          "type": "NUM",
          "value": 1,
        },
      ],
      "end": 8,
      "raw": "(",
      "start": 0,
      "type": "SEQ",
      "value": "(",
    }
  `,
  )
  expect(parse('(a|b,"b" + 2,1 and 2)')).toMatchInlineSnapshot(
    `
    {
      "elements": [
        {
          "end": 2,
          "left": {
            "end": 2,
            "raw": "a",
            "start": 1,
            "type": "ID",
            "value": "a",
          },
          "raw": "|",
          "right": {
            "end": 4,
            "raw": "b",
            "start": 3,
            "type": "ID",
            "value": "b",
          },
          "start": 2,
          "type": "PIPE",
          "value": "|",
        },
        {
          "end": 9,
          "left": {
            "end": 8,
            "raw": ""b"",
            "start": 5,
            "type": "STR",
            "value": "b",
          },
          "raw": "+",
          "right": {
            "end": 12,
            "raw": "2",
            "start": 11,
            "type": "NUM",
            "value": 2,
          },
          "start": 9,
          "type": "ADD",
          "value": "+",
        },
        {
          "end": 18,
          "left": {
            "end": 14,
            "raw": "1",
            "start": 13,
            "type": "NUM",
            "value": 1,
          },
          "raw": "and",
          "right": {
            "end": 20,
            "raw": "2",
            "start": 19,
            "type": "NUM",
            "value": 2,
          },
          "start": 15,
          "type": "AND",
          "value": "and",
        },
      ],
      "end": 20,
      "raw": "(",
      "start": 0,
      "type": "SEQ",
      "value": "(",
    }
  `,
  )
  expect(parse(`x|f(a,"b",1)`)).toMatchInlineSnapshot(
    `
    {
      "end": 1,
      "left": {
        "end": 1,
        "raw": "x",
        "start": 0,
        "type": "ID",
        "value": "x",
      },
      "raw": "|",
      "right": {
        "args": [
          {
            "end": 5,
            "raw": "a",
            "start": 4,
            "type": "ID",
            "value": "a",
          },
          {
            "end": 9,
            "raw": ""b"",
            "start": 6,
            "type": "STR",
            "value": "b",
          },
          {
            "end": 11,
            "raw": "1",
            "start": 10,
            "type": "NUM",
            "value": 1,
          },
        ],
        "end": 3,
        "raw": "f",
        "start": 2,
        "type": "ID",
        "value": "f",
      },
      "start": 1,
      "type": "PIPE",
      "value": "|",
    }
  `,
  )
})

it('pipe', () => {
  expect(parse('x | f')).toMatchInlineSnapshot(
    `
    {
      "end": 2,
      "left": {
        "end": 1,
        "raw": "x",
        "start": 0,
        "type": "ID",
        "value": "x",
      },
      "raw": "|",
      "right": {
        "end": 5,
        "raw": "f",
        "start": 4,
        "type": "ID",
        "value": "f",
      },
      "start": 2,
      "type": "PIPE",
      "value": "|",
    }
  `,
  )
  expect(parse('x | f | f2')).toMatchInlineSnapshot(
    `
    {
      "end": 6,
      "left": {
        "end": 2,
        "left": {
          "end": 1,
          "raw": "x",
          "start": 0,
          "type": "ID",
          "value": "x",
        },
        "raw": "|",
        "right": {
          "end": 5,
          "raw": "f",
          "start": 4,
          "type": "ID",
          "value": "f",
        },
        "start": 2,
        "type": "PIPE",
        "value": "|",
      },
      "raw": "|",
      "right": {
        "end": 10,
        "raw": "f2",
        "start": 8,
        "type": "ID",
        "value": "f2",
      },
      "start": 6,
      "type": "PIPE",
      "value": "|",
    }
  `,
  )
  expect(parse('x | f(a, "b")')).toMatchInlineSnapshot(
    `
    {
      "end": 2,
      "left": {
        "end": 1,
        "raw": "x",
        "start": 0,
        "type": "ID",
        "value": "x",
      },
      "raw": "|",
      "right": {
        "args": [
          {
            "end": 7,
            "raw": "a",
            "start": 6,
            "type": "ID",
            "value": "a",
          },
          {
            "end": 12,
            "raw": ""b"",
            "start": 9,
            "type": "STR",
            "value": "b",
          },
        ],
        "end": 5,
        "raw": "f",
        "start": 4,
        "type": "ID",
        "value": "f",
      },
      "start": 2,
      "type": "PIPE",
      "value": "|",
    }
  `,
  )
  expect(parse('x | f(a, "b") | f2 (c, 1)')).toMatchInlineSnapshot(
    `
    {
      "end": 14,
      "left": {
        "end": 2,
        "left": {
          "end": 1,
          "raw": "x",
          "start": 0,
          "type": "ID",
          "value": "x",
        },
        "raw": "|",
        "right": {
          "args": [
            {
              "end": 7,
              "raw": "a",
              "start": 6,
              "type": "ID",
              "value": "a",
            },
            {
              "end": 12,
              "raw": ""b"",
              "start": 9,
              "type": "STR",
              "value": "b",
            },
          ],
          "end": 5,
          "raw": "f",
          "start": 4,
          "type": "ID",
          "value": "f",
        },
        "start": 2,
        "type": "PIPE",
        "value": "|",
      },
      "raw": "|",
      "right": {
        "args": [
          {
            "end": 21,
            "raw": "c",
            "start": 20,
            "type": "ID",
            "value": "c",
          },
          {
            "end": 24,
            "raw": "1",
            "start": 23,
            "type": "NUM",
            "value": 1,
          },
        ],
        "end": 18,
        "raw": "f2",
        "start": 16,
        "type": "ID",
        "value": "f2",
      },
      "start": 14,
      "type": "PIPE",
      "value": "|",
    }
  `,
  )
})

it('conditional', () => {
  expect(parse('"a" if x')).toMatchInlineSnapshot(
    `
    {
      "consequent": {
        "end": 3,
        "raw": ""a"",
        "start": 0,
        "type": "STR",
        "value": "a",
      },
      "end": 6,
      "raw": "if",
      "start": 4,
      "test": {
        "end": 8,
        "raw": "x",
        "start": 7,
        "type": "ID",
        "value": "x",
      },
      "type": "IF",
      "value": "if",
    }
  `,
  )
  expect(parse('"a" if x else "b"')).toMatchInlineSnapshot(
    `
    {
      "alternative": {
        "end": 17,
        "raw": ""b"",
        "start": 14,
        "type": "STR",
        "value": "b",
      },
      "consequent": {
        "end": 3,
        "raw": ""a"",
        "start": 0,
        "type": "STR",
        "value": "a",
      },
      "end": 6,
      "raw": "if",
      "start": 4,
      "test": {
        "end": 8,
        "raw": "x",
        "start": 7,
        "type": "ID",
        "value": "x",
      },
      "type": "IF",
      "value": "if",
    }
  `,
  )
  expect(parse('"a" | f if x and y else "b" | f(a, "b")')).toMatchInlineSnapshot(
    `
    {
      "alternative": {
        "end": 28,
        "left": {
          "end": 27,
          "raw": ""b"",
          "start": 24,
          "type": "STR",
          "value": "b",
        },
        "raw": "|",
        "right": {
          "args": [
            {
              "end": 33,
              "raw": "a",
              "start": 32,
              "type": "ID",
              "value": "a",
            },
            {
              "end": 38,
              "raw": ""b"",
              "start": 35,
              "type": "STR",
              "value": "b",
            },
          ],
          "end": 31,
          "raw": "f",
          "start": 30,
          "type": "ID",
          "value": "f",
        },
        "start": 28,
        "type": "PIPE",
        "value": "|",
      },
      "consequent": {
        "end": 4,
        "left": {
          "end": 3,
          "raw": ""a"",
          "start": 0,
          "type": "STR",
          "value": "a",
        },
        "raw": "|",
        "right": {
          "end": 7,
          "raw": "f",
          "start": 6,
          "type": "ID",
          "value": "f",
        },
        "start": 4,
        "type": "PIPE",
        "value": "|",
      },
      "end": 10,
      "raw": "if",
      "start": 8,
      "test": {
        "end": 16,
        "left": {
          "end": 12,
          "raw": "x",
          "start": 11,
          "type": "ID",
          "value": "x",
        },
        "raw": "and",
        "right": {
          "end": 18,
          "raw": "y",
          "start": 17,
          "type": "ID",
          "value": "y",
        },
        "start": 13,
        "type": "AND",
        "value": "and",
      },
      "type": "IF",
      "value": "if",
    }
  `,
  )
})

it('complex', () => {
  expect(parse('user | get("age") gt 18 and user | get("name") eq "John"')).toMatchInlineSnapshot(
    `
    {
      "end": 27,
      "left": {
        "end": 20,
        "left": {
          "end": 5,
          "left": {
            "end": 4,
            "raw": "user",
            "start": 0,
            "type": "ID",
            "value": "user",
          },
          "raw": "|",
          "right": {
            "args": [
              {
                "end": 16,
                "raw": ""age"",
                "start": 11,
                "type": "STR",
                "value": "age",
              },
            ],
            "end": 10,
            "raw": "get",
            "start": 7,
            "type": "ID",
            "value": "get",
          },
          "start": 5,
          "type": "PIPE",
          "value": "|",
        },
        "raw": "gt",
        "right": {
          "end": 23,
          "raw": "18",
          "start": 21,
          "type": "NUM",
          "value": 18,
        },
        "start": 18,
        "type": "GT",
        "value": "gt",
      },
      "raw": "and",
      "right": {
        "end": 49,
        "left": {
          "end": 33,
          "left": {
            "end": 32,
            "raw": "user",
            "start": 28,
            "type": "ID",
            "value": "user",
          },
          "raw": "|",
          "right": {
            "args": [
              {
                "end": 45,
                "raw": ""name"",
                "start": 39,
                "type": "STR",
                "value": "name",
              },
            ],
            "end": 38,
            "raw": "get",
            "start": 35,
            "type": "ID",
            "value": "get",
          },
          "start": 33,
          "type": "PIPE",
          "value": "|",
        },
        "raw": "eq",
        "right": {
          "end": 56,
          "raw": ""John"",
          "start": 50,
          "type": "STR",
          "value": "John",
        },
        "start": 47,
        "type": "EQ",
        "value": "eq",
      },
      "start": 24,
      "type": "AND",
      "value": "and",
    }
  `,
  )
})

it('whitespace', () => {
  expect(parse(`  x
    +\ty  `)).toMatchInlineSnapshot(
    `
      {
        "end": 8,
        "left": {
          "end": 3,
          "raw": "x",
          "start": 2,
          "type": "ID",
          "value": "x",
        },
        "raw": "+",
        "right": {
          "end": 11,
          "raw": "y",
          "start": 10,
          "type": "ID",
          "value": "y",
        },
        "start": 8,
        "type": "ADD",
        "value": "+",
      }
    `,
  )
})

it('precedences', () => {
  expect(parse('a + b * c')).toMatchInlineSnapshot(
    `
    {
      "end": 2,
      "left": {
        "end": 1,
        "raw": "a",
        "start": 0,
        "type": "ID",
        "value": "a",
      },
      "raw": "+",
      "right": {
        "end": 6,
        "left": {
          "end": 5,
          "raw": "b",
          "start": 4,
          "type": "ID",
          "value": "b",
        },
        "raw": "*",
        "right": {
          "end": 9,
          "raw": "c",
          "start": 8,
          "type": "ID",
          "value": "c",
        },
        "start": 6,
        "type": "MUL",
        "value": "*",
      },
      "start": 2,
      "type": "ADD",
      "value": "+",
    }
  `,
  )
  expect(parse('a / b - c')).toMatchInlineSnapshot(
    `
    {
      "end": 2,
      "left": {
        "end": 1,
        "raw": "a",
        "start": 0,
        "type": "ID",
        "value": "a",
      },
      "raw": "/",
      "right": {
        "end": 9,
        "raw": "c",
        "start": 8,
        "type": "ID",
        "value": "c",
      },
      "start": 2,
      "type": "DIV",
      "value": "/",
    }
  `,
  )
})

it('real world', () => {
  expect(parse('f(x|a, y + b, z and c)')).toMatchInlineSnapshot(
    `
    {
      "args": [
        {
          "end": 3,
          "left": {
            "end": 3,
            "raw": "x",
            "start": 2,
            "type": "ID",
            "value": "x",
          },
          "raw": "|",
          "right": {
            "end": 5,
            "raw": "a",
            "start": 4,
            "type": "ID",
            "value": "a",
          },
          "start": 3,
          "type": "PIPE",
          "value": "|",
        },
        {
          "end": 9,
          "left": {
            "end": 8,
            "raw": "y",
            "start": 7,
            "type": "ID",
            "value": "y",
          },
          "raw": "+",
          "right": {
            "end": 12,
            "raw": "b",
            "start": 11,
            "type": "ID",
            "value": "b",
          },
          "start": 9,
          "type": "ADD",
          "value": "+",
        },
        {
          "end": 19,
          "left": {
            "end": 15,
            "raw": "z",
            "start": 14,
            "type": "ID",
            "value": "z",
          },
          "raw": "and",
          "right": {
            "end": 21,
            "raw": "c",
            "start": 20,
            "type": "ID",
            "value": "c",
          },
          "start": 16,
          "type": "AND",
          "value": "and",
        },
      ],
      "end": 1,
      "raw": "f",
      "start": 0,
      "type": "ID",
      "value": "f",
    }
  `,
  )
  expect(parse('(x, y, z) = a | b')).toMatchInlineSnapshot(
    `
    {
      "end": 10,
      "left": {
        "elements": [
          {
            "end": 2,
            "raw": "x",
            "start": 1,
            "type": "ID",
            "value": "x",
          },
          {
            "end": 5,
            "raw": "y",
            "start": 4,
            "type": "ID",
            "value": "y",
          },
          {
            "end": 8,
            "raw": "z",
            "start": 7,
            "type": "ID",
            "value": "z",
          },
        ],
        "end": 8,
        "raw": "(",
        "start": 0,
        "type": "SEQ",
        "value": "(",
      },
      "raw": "=",
      "right": {
        "end": 14,
        "left": {
          "end": 13,
          "raw": "a",
          "start": 12,
          "type": "ID",
          "value": "a",
        },
        "raw": "|",
        "right": {
          "end": 17,
          "raw": "b",
          "start": 16,
          "type": "ID",
          "value": "b",
        },
        "start": 14,
        "type": "PIPE",
        "value": "|",
      },
      "start": 10,
      "type": "SET",
      "value": "=",
    }
  `,
  )
  expect(parse('(x, y) of items | f(a, "b")')).toMatchInlineSnapshot(
    `
    {
      "end": 9,
      "left": {
        "elements": [
          {
            "end": 2,
            "raw": "x",
            "start": 1,
            "type": "ID",
            "value": "x",
          },
          {
            "end": 5,
            "raw": "y",
            "start": 4,
            "type": "ID",
            "value": "y",
          },
        ],
        "end": 5,
        "raw": "(",
        "start": 0,
        "type": "SEQ",
        "value": "(",
      },
      "raw": "of",
      "right": {
        "end": 16,
        "left": {
          "end": 15,
          "raw": "items",
          "start": 10,
          "type": "ID",
          "value": "items",
        },
        "raw": "|",
        "right": {
          "args": [
            {
              "end": 21,
              "raw": "a",
              "start": 20,
              "type": "ID",
              "value": "a",
            },
            {
              "end": 26,
              "raw": ""b"",
              "start": 23,
              "type": "STR",
              "value": "b",
            },
          ],
          "end": 19,
          "raw": "f",
          "start": 18,
          "type": "ID",
          "value": "f",
        },
        "start": 16,
        "type": "PIPE",
        "value": "|",
      },
      "start": 7,
      "type": "OF",
      "value": "of",
    }
  `,
  )
})
