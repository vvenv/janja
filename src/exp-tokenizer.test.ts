import { expect, it } from 'vitest';
import { expTokenTypes } from './exp-token-types';
import { ExpTokenizer } from './exp-tokenizer';

function tokenize(template: string) {
  return new ExpTokenizer(template).tokenize(template, {
    start: { line: 1, column: 1 },
    end: { line: 1, column: template.length },
  });
}

it('error', () => {
  expect(() => tokenize('{')).toThrowErrorMatchingInlineSnapshot(
    `[CompileError: Unexpect "{"]`,
  );
  expect(() => tokenize('}')).toThrowErrorMatchingInlineSnapshot(
    `[CompileError: Unexpect "}"]`,
  );
  expect(() => tokenize('[')).toThrowErrorMatchingInlineSnapshot(
    `[CompileError: Unexpect "["]`,
  );
  expect(() => tokenize(']')).toThrowErrorMatchingInlineSnapshot(
    `[CompileError: Unexpect "]"]`,
  );
  expect(() => tokenize('&')).toThrowErrorMatchingInlineSnapshot(
    `[CompileError: Unexpect "&"]`,
  );
  expect(() => tokenize('@')).toThrowErrorMatchingInlineSnapshot(
    `[CompileError: Unexpect "@"]`,
  );
  expect(() => tokenize('#')).toThrowErrorMatchingInlineSnapshot(
    `[CompileError: Unexpect "#"]`,
  );
  expect(() => tokenize(':')).toThrowErrorMatchingInlineSnapshot(
    `[CompileError: Unexpect ":"]`,
  );
  expect(() => tokenize(';')).toThrowErrorMatchingInlineSnapshot(
    `[CompileError: Unexpect ";"]`,
  );
});

it('string', () => {
  expect(tokenize(`'foo' "bar" \`baz\` "\\"escape"`)).toMatchInlineSnapshot(
    `
    [
      {
        "loc": {
          "end": {
            "column": 4,
            "line": 1,
          },
          "start": {
            "column": 1,
            "line": 1,
          },
        },
        "raw": "'foo'",
        "type": "LIT",
        "value": "foo",
      },
      {
        "loc": {
          "end": {
            "column": 8,
            "line": 1,
          },
          "start": {
            "column": 5,
            "line": 1,
          },
        },
        "raw": ""bar"",
        "type": "LIT",
        "value": "bar",
      },
      {
        "loc": {
          "end": {
            "column": 12,
            "line": 1,
          },
          "start": {
            "column": 9,
            "line": 1,
          },
        },
        "raw": "\`baz\`",
        "type": "LIT",
        "value": "baz",
      },
      {
        "loc": {
          "end": {
            "column": 21,
            "line": 1,
          },
          "start": {
            "column": 13,
            "line": 1,
          },
        },
        "raw": ""\\"escape"",
        "type": "LIT",
        "value": "\\"escape",
      },
    ]
  `,
  );
});

it('number', () => {
  expect(tokenize('123 12.34 -1')).toMatchInlineSnapshot(
    `
    [
      {
        "loc": {
          "end": {
            "column": 4,
            "line": 1,
          },
          "start": {
            "column": 1,
            "line": 1,
          },
        },
        "raw": "123",
        "type": "LIT",
        "value": 123,
      },
      {
        "loc": {
          "end": {
            "column": 10,
            "line": 1,
          },
          "start": {
            "column": 5,
            "line": 1,
          },
        },
        "raw": "12.34",
        "type": "LIT",
        "value": 12.34,
      },
      {
        "loc": {
          "end": {
            "column": 13,
            "line": 1,
          },
          "start": {
            "column": 11,
            "line": 1,
          },
        },
        "raw": "-1",
        "type": "LIT",
        "value": -1,
      },
    ]
  `,
  );
});

it('bool', () => {
  expect(tokenize('true')).toMatchInlineSnapshot(
    `
    [
      {
        "loc": {
          "end": {
            "column": 5,
            "line": 1,
          },
          "start": {
            "column": 1,
            "line": 1,
          },
        },
        "raw": "true",
        "type": "LIT",
        "value": true,
      },
    ]
  `,
  );
  expect(tokenize('false')).toMatchInlineSnapshot(
    `
    [
      {
        "loc": {
          "end": {
            "column": 6,
            "line": 1,
          },
          "start": {
            "column": 1,
            "line": 1,
          },
        },
        "raw": "false",
        "type": "LIT",
        "value": false,
      },
    ]
  `,
  );
});

it('null and undefined', () => {
  expect(tokenize('null')).toMatchInlineSnapshot(
    `
    [
      {
        "loc": {
          "end": {
            "column": 5,
            "line": 1,
          },
          "start": {
            "column": 1,
            "line": 1,
          },
        },
        "raw": "null",
        "type": "LIT",
        "value": null,
      },
    ]
  `,
  );
  expect(tokenize('undefined')).toMatchInlineSnapshot(
    `
    [
      {
        "loc": {
          "end": {
            "column": 10,
            "line": 1,
          },
          "start": {
            "column": 1,
            "line": 1,
          },
        },
        "raw": "undefined",
        "type": "LIT",
        "value": undefined,
      },
    ]
  `,
  );
});

it('symbols', () => {
  expect(tokenize(Object.keys(expTokenTypes).join(' '))).toMatchInlineSnapshot(
    `
    [
      {
        "loc": {
          "end": {
            "column": 4,
            "line": 1,
          },
          "start": {
            "column": 1,
            "line": 1,
          },
        },
        "raw": "and",
        "type": "AND",
        "value": "and",
      },
      {
        "loc": {
          "end": {
            "column": 7,
            "line": 1,
          },
          "start": {
            "column": 5,
            "line": 1,
          },
        },
        "raw": "or",
        "type": "OR",
        "value": "or",
      },
      {
        "loc": {
          "end": {
            "column": 11,
            "line": 1,
          },
          "start": {
            "column": 8,
            "line": 1,
          },
        },
        "raw": "not",
        "type": "NOT",
        "value": "not",
      },
      {
        "loc": {
          "end": {
            "column": 14,
            "line": 1,
          },
          "start": {
            "column": 12,
            "line": 1,
          },
        },
        "raw": "is",
        "type": "IS",
        "value": "is",
      },
      {
        "loc": {
          "end": {
            "column": 17,
            "line": 1,
          },
          "start": {
            "column": 15,
            "line": 1,
          },
        },
        "raw": "eq",
        "type": "EQ",
        "value": "eq",
      },
      {
        "loc": {
          "end": {
            "column": 20,
            "line": 1,
          },
          "start": {
            "column": 18,
            "line": 1,
          },
        },
        "raw": "ne",
        "type": "NE",
        "value": "ne",
      },
      {
        "loc": {
          "end": {
            "column": 23,
            "line": 1,
          },
          "start": {
            "column": 21,
            "line": 1,
          },
        },
        "raw": "gt",
        "type": "GT",
        "value": "gt",
      },
      {
        "loc": {
          "end": {
            "column": 26,
            "line": 1,
          },
          "start": {
            "column": 24,
            "line": 1,
          },
        },
        "raw": "lt",
        "type": "LT",
        "value": "lt",
      },
      {
        "loc": {
          "end": {
            "column": 29,
            "line": 1,
          },
          "start": {
            "column": 27,
            "line": 1,
          },
        },
        "raw": "ge",
        "type": "GE",
        "value": "ge",
      },
      {
        "loc": {
          "end": {
            "column": 32,
            "line": 1,
          },
          "start": {
            "column": 30,
            "line": 1,
          },
        },
        "raw": "le",
        "type": "LE",
        "value": "le",
      },
      {
        "loc": {
          "end": {
            "column": 35,
            "line": 1,
          },
          "start": {
            "column": 33,
            "line": 1,
          },
        },
        "raw": "in",
        "type": "IN",
        "value": "in",
      },
      {
        "loc": {
          "end": {
            "column": 38,
            "line": 1,
          },
          "start": {
            "column": 36,
            "line": 1,
          },
        },
        "raw": "ni",
        "type": "NI",
        "value": "ni",
      },
      {
        "loc": {
          "end": {
            "column": 41,
            "line": 1,
          },
          "start": {
            "column": 39,
            "line": 1,
          },
        },
        "raw": "of",
        "type": "OF",
        "value": "of",
      },
      {
        "loc": {
          "end": {
            "column": 43,
            "line": 1,
          },
          "start": {
            "column": 42,
            "line": 1,
          },
        },
        "raw": "+",
        "type": "ADD",
        "value": "+",
      },
      {
        "loc": {
          "end": {
            "column": 45,
            "line": 1,
          },
          "start": {
            "column": 44,
            "line": 1,
          },
        },
        "raw": "-",
        "type": "LIT",
        "value": NaN,
      },
      {
        "loc": {
          "end": {
            "column": 47,
            "line": 1,
          },
          "start": {
            "column": 46,
            "line": 1,
          },
        },
        "raw": "*",
        "type": "MUL",
        "value": "*",
      },
      {
        "loc": {
          "end": {
            "column": 49,
            "line": 1,
          },
          "start": {
            "column": 48,
            "line": 1,
          },
        },
        "raw": "/",
        "type": "DIV",
        "value": "/",
      },
      {
        "loc": {
          "end": {
            "column": 51,
            "line": 1,
          },
          "start": {
            "column": 50,
            "line": 1,
          },
        },
        "raw": "%",
        "type": "MOD",
        "value": "%",
      },
      {
        "loc": {
          "end": {
            "column": 54,
            "line": 1,
          },
          "start": {
            "column": 52,
            "line": 1,
          },
        },
        "raw": "if",
        "type": "IF",
        "value": "if",
      },
      {
        "loc": {
          "end": {
            "column": 59,
            "line": 1,
          },
          "start": {
            "column": 55,
            "line": 1,
          },
        },
        "raw": "else",
        "type": "ELSE",
        "value": "else",
      },
      {
        "loc": {
          "end": {
            "column": 64,
            "line": 1,
          },
          "start": {
            "column": 60,
            "line": 1,
          },
        },
        "raw": "true",
        "type": "LIT",
        "value": true,
      },
      {
        "loc": {
          "end": {
            "column": 70,
            "line": 1,
          },
          "start": {
            "column": 65,
            "line": 1,
          },
        },
        "raw": "false",
        "type": "LIT",
        "value": false,
      },
      {
        "loc": {
          "end": {
            "column": 75,
            "line": 1,
          },
          "start": {
            "column": 71,
            "line": 1,
          },
        },
        "raw": "null",
        "type": "LIT",
        "value": null,
      },
      {
        "loc": {
          "end": {
            "column": 85,
            "line": 1,
          },
          "start": {
            "column": 76,
            "line": 1,
          },
        },
        "raw": "undefined",
        "type": "LIT",
        "value": undefined,
      },
      {
        "loc": {
          "end": {
            "column": 87,
            "line": 1,
          },
          "start": {
            "column": 86,
            "line": 1,
          },
        },
        "raw": "|",
        "type": "PIPE",
        "value": "|",
      },
      {
        "loc": {
          "end": {
            "column": 89,
            "line": 1,
          },
          "start": {
            "column": 88,
            "line": 1,
          },
        },
        "raw": "=",
        "type": "SET",
        "value": "=",
      },
      {
        "loc": {
          "end": {
            "column": 91,
            "line": 1,
          },
          "start": {
            "column": 90,
            "line": 1,
          },
        },
        "raw": "(",
        "type": "LP",
        "value": "(",
      },
      {
        "loc": {
          "end": {
            "column": 93,
            "line": 1,
          },
          "start": {
            "column": 92,
            "line": 1,
          },
        },
        "raw": ")",
        "type": "RP",
        "value": ")",
      },
      {
        "loc": {
          "end": {
            "column": 95,
            "line": 1,
          },
          "start": {
            "column": 94,
            "line": 1,
          },
        },
        "raw": ",",
        "type": "COMMA",
        "value": ",",
      },
      {
        "loc": {
          "end": {
            "column": 97,
            "line": 1,
          },
          "start": {
            "column": 96,
            "line": 1,
          },
        },
        "raw": ".",
        "type": "DOT",
        "value": ".",
      },
    ]
  `,
  );
});

it('id', () => {
  expect(tokenize('a b c')).toMatchInlineSnapshot(
    `
    [
      {
        "loc": {
          "end": {
            "column": 2,
            "line": 1,
          },
          "start": {
            "column": 1,
            "line": 1,
          },
        },
        "raw": "a",
        "type": "ID",
        "value": "a",
      },
      {
        "loc": {
          "end": {
            "column": 4,
            "line": 1,
          },
          "start": {
            "column": 3,
            "line": 1,
          },
        },
        "raw": "b",
        "type": "ID",
        "value": "b",
      },
      {
        "loc": {
          "end": {
            "column": 6,
            "line": 1,
          },
          "start": {
            "column": 5,
            "line": 1,
          },
        },
        "raw": "c",
        "type": "ID",
        "value": "c",
      },
    ]
  `,
  );
});

it('pipe', () => {
  expect(tokenize('x | f')).toMatchInlineSnapshot(
    `
    [
      {
        "loc": {
          "end": {
            "column": 2,
            "line": 1,
          },
          "start": {
            "column": 1,
            "line": 1,
          },
        },
        "raw": "x",
        "type": "ID",
        "value": "x",
      },
      {
        "loc": {
          "end": {
            "column": 4,
            "line": 1,
          },
          "start": {
            "column": 3,
            "line": 1,
          },
        },
        "raw": "|",
        "type": "PIPE",
        "value": "|",
      },
      {
        "loc": {
          "end": {
            "column": 6,
            "line": 1,
          },
          "start": {
            "column": 5,
            "line": 1,
          },
        },
        "raw": "f",
        "type": "ID",
        "value": "f",
      },
    ]
  `,
  );
  expect(tokenize('x | f | f2')).toMatchInlineSnapshot(
    `
    [
      {
        "loc": {
          "end": {
            "column": 2,
            "line": 1,
          },
          "start": {
            "column": 1,
            "line": 1,
          },
        },
        "raw": "x",
        "type": "ID",
        "value": "x",
      },
      {
        "loc": {
          "end": {
            "column": 4,
            "line": 1,
          },
          "start": {
            "column": 3,
            "line": 1,
          },
        },
        "raw": "|",
        "type": "PIPE",
        "value": "|",
      },
      {
        "loc": {
          "end": {
            "column": 6,
            "line": 1,
          },
          "start": {
            "column": 5,
            "line": 1,
          },
        },
        "raw": "f",
        "type": "ID",
        "value": "f",
      },
      {
        "loc": {
          "end": {
            "column": 8,
            "line": 1,
          },
          "start": {
            "column": 7,
            "line": 1,
          },
        },
        "raw": "|",
        "type": "PIPE",
        "value": "|",
      },
      {
        "loc": {
          "end": {
            "column": 11,
            "line": 1,
          },
          "start": {
            "column": 9,
            "line": 1,
          },
        },
        "raw": "f2",
        "type": "ID",
        "value": "f2",
      },
    ]
  `,
  );
  expect(tokenize('x | f(a, "b") | f2(not c, 1) | f3')).toMatchInlineSnapshot(
    `
    [
      {
        "loc": {
          "end": {
            "column": 2,
            "line": 1,
          },
          "start": {
            "column": 1,
            "line": 1,
          },
        },
        "raw": "x",
        "type": "ID",
        "value": "x",
      },
      {
        "loc": {
          "end": {
            "column": 4,
            "line": 1,
          },
          "start": {
            "column": 3,
            "line": 1,
          },
        },
        "raw": "|",
        "type": "PIPE",
        "value": "|",
      },
      {
        "loc": {
          "end": {
            "column": 6,
            "line": 1,
          },
          "start": {
            "column": 5,
            "line": 1,
          },
        },
        "raw": "f",
        "type": "ID",
        "value": "f",
      },
      {
        "loc": {
          "end": {
            "column": 7,
            "line": 1,
          },
          "start": {
            "column": 6,
            "line": 1,
          },
        },
        "raw": "(",
        "type": "LP",
        "value": "(",
      },
      {
        "loc": {
          "end": {
            "column": 8,
            "line": 1,
          },
          "start": {
            "column": 7,
            "line": 1,
          },
        },
        "raw": "a",
        "type": "ID",
        "value": "a",
      },
      {
        "loc": {
          "end": {
            "column": 9,
            "line": 1,
          },
          "start": {
            "column": 8,
            "line": 1,
          },
        },
        "raw": ",",
        "type": "COMMA",
        "value": ",",
      },
      {
        "loc": {
          "end": {
            "column": 11,
            "line": 1,
          },
          "start": {
            "column": 10,
            "line": 1,
          },
        },
        "raw": ""b"",
        "type": "LIT",
        "value": "b",
      },
      {
        "loc": {
          "end": {
            "column": 12,
            "line": 1,
          },
          "start": {
            "column": 11,
            "line": 1,
          },
        },
        "raw": ")",
        "type": "RP",
        "value": ")",
      },
      {
        "loc": {
          "end": {
            "column": 14,
            "line": 1,
          },
          "start": {
            "column": 13,
            "line": 1,
          },
        },
        "raw": "|",
        "type": "PIPE",
        "value": "|",
      },
      {
        "loc": {
          "end": {
            "column": 17,
            "line": 1,
          },
          "start": {
            "column": 15,
            "line": 1,
          },
        },
        "raw": "f2",
        "type": "ID",
        "value": "f2",
      },
      {
        "loc": {
          "end": {
            "column": 18,
            "line": 1,
          },
          "start": {
            "column": 17,
            "line": 1,
          },
        },
        "raw": "(",
        "type": "LP",
        "value": "(",
      },
      {
        "loc": {
          "end": {
            "column": 21,
            "line": 1,
          },
          "start": {
            "column": 18,
            "line": 1,
          },
        },
        "raw": "not",
        "type": "NOT",
        "value": "not",
      },
      {
        "loc": {
          "end": {
            "column": 23,
            "line": 1,
          },
          "start": {
            "column": 22,
            "line": 1,
          },
        },
        "raw": "c",
        "type": "ID",
        "value": "c",
      },
      {
        "loc": {
          "end": {
            "column": 24,
            "line": 1,
          },
          "start": {
            "column": 23,
            "line": 1,
          },
        },
        "raw": ",",
        "type": "COMMA",
        "value": ",",
      },
      {
        "loc": {
          "end": {
            "column": 26,
            "line": 1,
          },
          "start": {
            "column": 25,
            "line": 1,
          },
        },
        "raw": "1",
        "type": "LIT",
        "value": 1,
      },
      {
        "loc": {
          "end": {
            "column": 27,
            "line": 1,
          },
          "start": {
            "column": 26,
            "line": 1,
          },
        },
        "raw": ")",
        "type": "RP",
        "value": ")",
      },
      {
        "loc": {
          "end": {
            "column": 29,
            "line": 1,
          },
          "start": {
            "column": 28,
            "line": 1,
          },
        },
        "raw": "|",
        "type": "PIPE",
        "value": "|",
      },
      {
        "loc": {
          "end": {
            "column": 32,
            "line": 1,
          },
          "start": {
            "column": 30,
            "line": 1,
          },
        },
        "raw": "f3",
        "type": "ID",
        "value": "f3",
      },
    ]
  `,
  );
});

it('conditional', () => {
  expect(tokenize('"a" if x')).toMatchInlineSnapshot(
    `
    [
      {
        "loc": {
          "end": {
            "column": 2,
            "line": 1,
          },
          "start": {
            "column": 1,
            "line": 1,
          },
        },
        "raw": ""a"",
        "type": "LIT",
        "value": "a",
      },
      {
        "loc": {
          "end": {
            "column": 5,
            "line": 1,
          },
          "start": {
            "column": 3,
            "line": 1,
          },
        },
        "raw": "if",
        "type": "IF",
        "value": "if",
      },
      {
        "loc": {
          "end": {
            "column": 7,
            "line": 1,
          },
          "start": {
            "column": 6,
            "line": 1,
          },
        },
        "raw": "x",
        "type": "ID",
        "value": "x",
      },
    ]
  `,
  );
  expect(tokenize('"a" if x else "y"')).toMatchInlineSnapshot(
    `
    [
      {
        "loc": {
          "end": {
            "column": 2,
            "line": 1,
          },
          "start": {
            "column": 1,
            "line": 1,
          },
        },
        "raw": ""a"",
        "type": "LIT",
        "value": "a",
      },
      {
        "loc": {
          "end": {
            "column": 5,
            "line": 1,
          },
          "start": {
            "column": 3,
            "line": 1,
          },
        },
        "raw": "if",
        "type": "IF",
        "value": "if",
      },
      {
        "loc": {
          "end": {
            "column": 7,
            "line": 1,
          },
          "start": {
            "column": 6,
            "line": 1,
          },
        },
        "raw": "x",
        "type": "ID",
        "value": "x",
      },
      {
        "loc": {
          "end": {
            "column": 12,
            "line": 1,
          },
          "start": {
            "column": 8,
            "line": 1,
          },
        },
        "raw": "else",
        "type": "ELSE",
        "value": "else",
      },
      {
        "loc": {
          "end": {
            "column": 14,
            "line": 1,
          },
          "start": {
            "column": 13,
            "line": 1,
          },
        },
        "raw": ""y"",
        "type": "LIT",
        "value": "y",
      },
    ]
  `,
  );
});

it('complex', () => {
  expect(
    tokenize('user | get("age") gt 18 and user | get("name") eq "John"'),
  ).toMatchInlineSnapshot(
    `
    [
      {
        "loc": {
          "end": {
            "column": 5,
            "line": 1,
          },
          "start": {
            "column": 1,
            "line": 1,
          },
        },
        "raw": "user",
        "type": "ID",
        "value": "user",
      },
      {
        "loc": {
          "end": {
            "column": 7,
            "line": 1,
          },
          "start": {
            "column": 6,
            "line": 1,
          },
        },
        "raw": "|",
        "type": "PIPE",
        "value": "|",
      },
      {
        "loc": {
          "end": {
            "column": 11,
            "line": 1,
          },
          "start": {
            "column": 8,
            "line": 1,
          },
        },
        "raw": "get",
        "type": "ID",
        "value": "get",
      },
      {
        "loc": {
          "end": {
            "column": 12,
            "line": 1,
          },
          "start": {
            "column": 11,
            "line": 1,
          },
        },
        "raw": "(",
        "type": "LP",
        "value": "(",
      },
      {
        "loc": {
          "end": {
            "column": 15,
            "line": 1,
          },
          "start": {
            "column": 12,
            "line": 1,
          },
        },
        "raw": ""age"",
        "type": "LIT",
        "value": "age",
      },
      {
        "loc": {
          "end": {
            "column": 16,
            "line": 1,
          },
          "start": {
            "column": 15,
            "line": 1,
          },
        },
        "raw": ")",
        "type": "RP",
        "value": ")",
      },
      {
        "loc": {
          "end": {
            "column": 19,
            "line": 1,
          },
          "start": {
            "column": 17,
            "line": 1,
          },
        },
        "raw": "gt",
        "type": "GT",
        "value": "gt",
      },
      {
        "loc": {
          "end": {
            "column": 22,
            "line": 1,
          },
          "start": {
            "column": 20,
            "line": 1,
          },
        },
        "raw": "18",
        "type": "LIT",
        "value": 18,
      },
      {
        "loc": {
          "end": {
            "column": 26,
            "line": 1,
          },
          "start": {
            "column": 23,
            "line": 1,
          },
        },
        "raw": "and",
        "type": "AND",
        "value": "and",
      },
      {
        "loc": {
          "end": {
            "column": 31,
            "line": 1,
          },
          "start": {
            "column": 27,
            "line": 1,
          },
        },
        "raw": "user",
        "type": "ID",
        "value": "user",
      },
      {
        "loc": {
          "end": {
            "column": 33,
            "line": 1,
          },
          "start": {
            "column": 32,
            "line": 1,
          },
        },
        "raw": "|",
        "type": "PIPE",
        "value": "|",
      },
      {
        "loc": {
          "end": {
            "column": 37,
            "line": 1,
          },
          "start": {
            "column": 34,
            "line": 1,
          },
        },
        "raw": "get",
        "type": "ID",
        "value": "get",
      },
      {
        "loc": {
          "end": {
            "column": 38,
            "line": 1,
          },
          "start": {
            "column": 37,
            "line": 1,
          },
        },
        "raw": "(",
        "type": "LP",
        "value": "(",
      },
      {
        "loc": {
          "end": {
            "column": 42,
            "line": 1,
          },
          "start": {
            "column": 38,
            "line": 1,
          },
        },
        "raw": ""name"",
        "type": "LIT",
        "value": "name",
      },
      {
        "loc": {
          "end": {
            "column": 43,
            "line": 1,
          },
          "start": {
            "column": 42,
            "line": 1,
          },
        },
        "raw": ")",
        "type": "RP",
        "value": ")",
      },
      {
        "loc": {
          "end": {
            "column": 46,
            "line": 1,
          },
          "start": {
            "column": 44,
            "line": 1,
          },
        },
        "raw": "eq",
        "type": "EQ",
        "value": "eq",
      },
      {
        "loc": {
          "end": {
            "column": 51,
            "line": 1,
          },
          "start": {
            "column": 47,
            "line": 1,
          },
        },
        "raw": ""John"",
        "type": "LIT",
        "value": "John",
      },
    ]
  `,
  );
});

it('whitespace', () => {
  expect(
    tokenize(`  x
    +\ty  `),
  ).toMatchInlineSnapshot(
    `
      [
        {
          "loc": {
            "end": {
              "column": 4,
              "line": 1,
            },
            "start": {
              "column": 3,
              "line": 1,
            },
          },
          "raw": "x",
          "type": "ID",
          "value": "x",
        },
        {
          "loc": {
            "end": {
              "column": 5,
              "line": 2,
            },
            "start": {
              "column": 4,
              "line": 2,
            },
          },
          "raw": "+",
          "type": "ADD",
          "value": "+",
        },
        {
          "loc": {
            "end": {
              "column": 7,
              "line": 2,
            },
            "start": {
              "column": 6,
              "line": 2,
            },
          },
          "raw": "y",
          "type": "ID",
          "value": "y",
        },
      ]
    `,
  );
});
