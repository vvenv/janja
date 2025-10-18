import { expect, it } from 'vitest'
import { symbols } from './symbols'
import { Tokenizer } from './tokenizer'

function tokenize(template: string) {
  return new Tokenizer().tokenize(template)
}

it('invalid', () => {
  expect(() => tokenize('{')).toThrowErrorMatchingInlineSnapshot(`[ParseError: unexpect "{"]`)
  expect(() => tokenize('}')).toThrowErrorMatchingInlineSnapshot(`[ParseError: unexpect "}"]`)
  expect(() => tokenize('[')).toThrowErrorMatchingInlineSnapshot(`[ParseError: unexpect "["]`)
  expect(() => tokenize(']')).toThrowErrorMatchingInlineSnapshot(`[ParseError: unexpect "]"]`)
  expect(() => tokenize('&')).toThrowErrorMatchingInlineSnapshot(`[ParseError: unexpect "&"]`)
  expect(() => tokenize('@')).toThrowErrorMatchingInlineSnapshot(`[ParseError: unexpect "@"]`)
  expect(() => tokenize('#')).toThrowErrorMatchingInlineSnapshot(`[ParseError: unexpect "#"]`)
  expect(() => tokenize('.')).toThrowErrorMatchingInlineSnapshot(`[ParseError: unexpect "."]`)
  expect(() => tokenize(':')).toThrowErrorMatchingInlineSnapshot(`[ParseError: unexpect ":"]`)
  expect(() => tokenize(';')).toThrowErrorMatchingInlineSnapshot(`[ParseError: unexpect ";"]`)
})

it('string', () => {
  expect(tokenize(`'foo' "bar" \`baz\` "\\"escape"`)).toMatchInlineSnapshot(
    `
    [
      {
        "end": 5,
        "raw": "'foo'",
        "start": 0,
        "type": "STR",
        "value": "foo",
      },
      {
        "end": 11,
        "raw": ""bar"",
        "start": 6,
        "type": "STR",
        "value": "bar",
      },
      {
        "end": 17,
        "raw": "\`baz\`",
        "start": 12,
        "type": "STR",
        "value": "baz",
      },
      {
        "end": 28,
        "raw": ""\\"escape"",
        "start": 18,
        "type": "STR",
        "value": "\\"escape",
      },
    ]
  `,
  )
})

it('number', () => {
  expect(tokenize('123 12.34 -1')).toMatchInlineSnapshot(
    `
    [
      {
        "end": 3,
        "raw": "123",
        "start": 0,
        "type": "NUM",
        "value": 123,
      },
      {
        "end": 9,
        "raw": "12.34",
        "start": 4,
        "type": "NUM",
        "value": 12.34,
      },
      {
        "end": 12,
        "raw": "-1",
        "start": 10,
        "type": "NUM",
        "value": -1,
      },
    ]
  `,
  )
})

it('bool', () => {
  expect(tokenize('true')).toMatchInlineSnapshot(
    `
    [
      {
        "end": 4,
        "raw": "true",
        "start": 0,
        "type": "BOOL",
        "value": true,
      },
    ]
  `,
  )
  expect(tokenize('false')).toMatchInlineSnapshot(
    `
    [
      {
        "end": 5,
        "raw": "false",
        "start": 0,
        "type": "BOOL",
        "value": false,
      },
    ]
  `,
  )
})

it('symbols', () => {
  expect(tokenize(Object.keys(symbols).join(' '))).toMatchInlineSnapshot(
    `
    [
      {
        "end": 3,
        "raw": "and",
        "start": 0,
        "type": "AND",
        "value": "and",
      },
      {
        "end": 6,
        "raw": "or",
        "start": 4,
        "type": "OR",
        "value": "or",
      },
      {
        "end": 10,
        "raw": "not",
        "start": 7,
        "type": "NOT",
        "value": "not",
      },
      {
        "end": 13,
        "raw": "eq",
        "start": 11,
        "type": "EQ",
        "value": "eq",
      },
      {
        "end": 16,
        "raw": "ne",
        "start": 14,
        "type": "NE",
        "value": "ne",
      },
      {
        "end": 19,
        "raw": "gt",
        "start": 17,
        "type": "GT",
        "value": "gt",
      },
      {
        "end": 22,
        "raw": "lt",
        "start": 20,
        "type": "LT",
        "value": "lt",
      },
      {
        "end": 25,
        "raw": "ge",
        "start": 23,
        "type": "GE",
        "value": "ge",
      },
      {
        "end": 28,
        "raw": "le",
        "start": 26,
        "type": "LE",
        "value": "le",
      },
      {
        "end": 31,
        "raw": "in",
        "start": 29,
        "type": "IN",
        "value": "in",
      },
      {
        "end": 34,
        "raw": "ni",
        "start": 32,
        "type": "NI",
        "value": "ni",
      },
      {
        "end": 37,
        "raw": "of",
        "start": 35,
        "type": "OF",
        "value": "of",
      },
      {
        "end": 38,
        "raw": "+",
        "start": 38,
        "type": "ADD",
        "value": "+",
      },
      {
        "end": 41,
        "raw": "-",
        "start": 40,
        "type": "NUM",
        "value": NaN,
      },
      {
        "end": 42,
        "raw": "*",
        "start": 42,
        "type": "MUL",
        "value": "*",
      },
      {
        "end": 44,
        "raw": "/",
        "start": 44,
        "type": "DIV",
        "value": "/",
      },
      {
        "end": 46,
        "raw": "%",
        "start": 46,
        "type": "MOD",
        "value": "%",
      },
      {
        "end": 50,
        "raw": "if",
        "start": 48,
        "type": "IF",
        "value": "if",
      },
      {
        "end": 55,
        "raw": "else",
        "start": 51,
        "type": "ELSE",
        "value": "else",
      },
      {
        "end": 60,
        "raw": "true",
        "start": 56,
        "type": "BOOL",
        "value": true,
      },
      {
        "end": 66,
        "raw": "false",
        "start": 61,
        "type": "BOOL",
        "value": false,
      },
      {
        "end": 67,
        "raw": "|",
        "start": 67,
        "type": "PIPE",
        "value": "|",
      },
      {
        "end": 69,
        "raw": "=",
        "start": 69,
        "type": "SET",
        "value": "=",
      },
      {
        "end": 71,
        "raw": "(",
        "start": 71,
        "type": "LP",
        "value": "(",
      },
      {
        "end": 73,
        "raw": ")",
        "start": 73,
        "type": "RP",
        "value": ")",
      },
      {
        "end": 75,
        "raw": ",",
        "start": 75,
        "type": "COMMA",
        "value": ",",
      },
    ]
  `,
  )
})

it('id', () => {
  expect(tokenize('a b c')).toMatchInlineSnapshot(
    `
    [
      {
        "end": 1,
        "raw": "a",
        "start": 0,
        "type": "ID",
        "value": "a",
      },
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
    ]
  `,
  )
})

it('pipe', () => {
  expect(tokenize('x | f')).toMatchInlineSnapshot(
    `
    [
      {
        "end": 1,
        "raw": "x",
        "start": 0,
        "type": "ID",
        "value": "x",
      },
      {
        "end": 2,
        "raw": "|",
        "start": 2,
        "type": "PIPE",
        "value": "|",
      },
      {
        "end": 5,
        "raw": "f",
        "start": 4,
        "type": "ID",
        "value": "f",
      },
    ]
  `,
  )
  expect(tokenize('x | f | f2')).toMatchInlineSnapshot(
    `
    [
      {
        "end": 1,
        "raw": "x",
        "start": 0,
        "type": "ID",
        "value": "x",
      },
      {
        "end": 2,
        "raw": "|",
        "start": 2,
        "type": "PIPE",
        "value": "|",
      },
      {
        "end": 5,
        "raw": "f",
        "start": 4,
        "type": "ID",
        "value": "f",
      },
      {
        "end": 6,
        "raw": "|",
        "start": 6,
        "type": "PIPE",
        "value": "|",
      },
      {
        "end": 10,
        "raw": "f2",
        "start": 8,
        "type": "ID",
        "value": "f2",
      },
    ]
  `,
  )
  expect(tokenize('x | f(a, "b") | f2(not c, 1) | f3')).toMatchInlineSnapshot(
    `
    [
      {
        "end": 1,
        "raw": "x",
        "start": 0,
        "type": "ID",
        "value": "x",
      },
      {
        "end": 2,
        "raw": "|",
        "start": 2,
        "type": "PIPE",
        "value": "|",
      },
      {
        "end": 5,
        "raw": "f",
        "start": 4,
        "type": "ID",
        "value": "f",
      },
      {
        "end": 5,
        "raw": "(",
        "start": 5,
        "type": "LP",
        "value": "(",
      },
      {
        "end": 7,
        "raw": "a",
        "start": 6,
        "type": "ID",
        "value": "a",
      },
      {
        "end": 7,
        "raw": ",",
        "start": 7,
        "type": "COMMA",
        "value": ",",
      },
      {
        "end": 12,
        "raw": ""b"",
        "start": 9,
        "type": "STR",
        "value": "b",
      },
      {
        "end": 12,
        "raw": ")",
        "start": 12,
        "type": "RP",
        "value": ")",
      },
      {
        "end": 14,
        "raw": "|",
        "start": 14,
        "type": "PIPE",
        "value": "|",
      },
      {
        "end": 18,
        "raw": "f2",
        "start": 16,
        "type": "ID",
        "value": "f2",
      },
      {
        "end": 18,
        "raw": "(",
        "start": 18,
        "type": "LP",
        "value": "(",
      },
      {
        "end": 22,
        "raw": "not",
        "start": 19,
        "type": "NOT",
        "value": "not",
      },
      {
        "end": 24,
        "raw": "c",
        "start": 23,
        "type": "ID",
        "value": "c",
      },
      {
        "end": 24,
        "raw": ",",
        "start": 24,
        "type": "COMMA",
        "value": ",",
      },
      {
        "end": 27,
        "raw": "1",
        "start": 26,
        "type": "NUM",
        "value": 1,
      },
      {
        "end": 27,
        "raw": ")",
        "start": 27,
        "type": "RP",
        "value": ")",
      },
      {
        "end": 29,
        "raw": "|",
        "start": 29,
        "type": "PIPE",
        "value": "|",
      },
      {
        "end": 33,
        "raw": "f3",
        "start": 31,
        "type": "ID",
        "value": "f3",
      },
    ]
  `,
  )
})

it('conditional', () => {
  expect(tokenize('"a" if x')).toMatchInlineSnapshot(
    `
    [
      {
        "end": 3,
        "raw": ""a"",
        "start": 0,
        "type": "STR",
        "value": "a",
      },
      {
        "end": 6,
        "raw": "if",
        "start": 4,
        "type": "IF",
        "value": "if",
      },
      {
        "end": 8,
        "raw": "x",
        "start": 7,
        "type": "ID",
        "value": "x",
      },
    ]
  `,
  )
  expect(tokenize('"a" if x else "y"')).toMatchInlineSnapshot(
    `
    [
      {
        "end": 3,
        "raw": ""a"",
        "start": 0,
        "type": "STR",
        "value": "a",
      },
      {
        "end": 6,
        "raw": "if",
        "start": 4,
        "type": "IF",
        "value": "if",
      },
      {
        "end": 8,
        "raw": "x",
        "start": 7,
        "type": "ID",
        "value": "x",
      },
      {
        "end": 13,
        "raw": "else",
        "start": 9,
        "type": "ELSE",
        "value": "else",
      },
      {
        "end": 17,
        "raw": ""y"",
        "start": 14,
        "type": "STR",
        "value": "y",
      },
    ]
  `,
  )
})

it('complex', () => {
  expect(tokenize('user | get("age") gt 18 and user | get("name") eq "John"')).toMatchInlineSnapshot(
    `
    [
      {
        "end": 4,
        "raw": "user",
        "start": 0,
        "type": "ID",
        "value": "user",
      },
      {
        "end": 5,
        "raw": "|",
        "start": 5,
        "type": "PIPE",
        "value": "|",
      },
      {
        "end": 10,
        "raw": "get",
        "start": 7,
        "type": "ID",
        "value": "get",
      },
      {
        "end": 10,
        "raw": "(",
        "start": 10,
        "type": "LP",
        "value": "(",
      },
      {
        "end": 16,
        "raw": ""age"",
        "start": 11,
        "type": "STR",
        "value": "age",
      },
      {
        "end": 16,
        "raw": ")",
        "start": 16,
        "type": "RP",
        "value": ")",
      },
      {
        "end": 20,
        "raw": "gt",
        "start": 18,
        "type": "GT",
        "value": "gt",
      },
      {
        "end": 23,
        "raw": "18",
        "start": 21,
        "type": "NUM",
        "value": 18,
      },
      {
        "end": 27,
        "raw": "and",
        "start": 24,
        "type": "AND",
        "value": "and",
      },
      {
        "end": 32,
        "raw": "user",
        "start": 28,
        "type": "ID",
        "value": "user",
      },
      {
        "end": 33,
        "raw": "|",
        "start": 33,
        "type": "PIPE",
        "value": "|",
      },
      {
        "end": 38,
        "raw": "get",
        "start": 35,
        "type": "ID",
        "value": "get",
      },
      {
        "end": 38,
        "raw": "(",
        "start": 38,
        "type": "LP",
        "value": "(",
      },
      {
        "end": 45,
        "raw": ""name"",
        "start": 39,
        "type": "STR",
        "value": "name",
      },
      {
        "end": 45,
        "raw": ")",
        "start": 45,
        "type": "RP",
        "value": ")",
      },
      {
        "end": 49,
        "raw": "eq",
        "start": 47,
        "type": "EQ",
        "value": "eq",
      },
      {
        "end": 56,
        "raw": ""John"",
        "start": 50,
        "type": "STR",
        "value": "John",
      },
    ]
  `,
  )
})

it('whitespace', () => {
  expect(tokenize(`  x
    add\ty  `)).toMatchInlineSnapshot(
    `
      [
        {
          "end": 3,
          "raw": "x",
          "start": 2,
          "type": "ID",
          "value": "x",
        },
        {
          "end": 11,
          "raw": "add",
          "start": 8,
          "type": "ID",
          "value": "add",
        },
        {
          "end": 13,
          "raw": "y",
          "start": 12,
          "type": "ID",
          "value": "y",
        },
      ]
    `,
  )
})
