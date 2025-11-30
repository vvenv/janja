import { expect, it } from 'vitest';
import { ExpParser } from './exp-parser';

function parse(template: string) {
  return new ExpParser().parse(template, {
    start: { line: 1, column: 1 },
    end: { line: 1, column: template.length },
  });
}

it('error', () => {
  expect(() => parse('not')).toThrowErrorMatchingInlineSnapshot(
    `[ExpError: Unexpected end of expression]`,
  );
  expect(() => parse('and')).toThrowErrorMatchingInlineSnapshot(
    `[ExpError: No left operand for "AND"]`,
  );
  expect(() => parse('a and')).toThrowErrorMatchingInlineSnapshot(
    `[ExpError: No right operand for "AND"]`,
  );
  expect(() => parse('(')).toThrowErrorMatchingInlineSnapshot(
    `[ExpError: Unexpected end of expression]`,
  );
  expect(() => parse('(a')).toThrowErrorMatchingInlineSnapshot(
    `[ExpError: Expected "RP" after "LP"]`,
  );
  expect(() => parse('a(')).toThrowErrorMatchingInlineSnapshot(
    `[ExpError: Expected "RP" after "LP"]`,
  );
  expect(() => parse('a.')).toThrowErrorMatchingInlineSnapshot(
    `[ExpError: Expected "ID" after "DOT"]`,
  );
  expect(() => parse('a.1')).toThrowErrorMatchingInlineSnapshot(
    `[ExpError: Expected "ID" after "DOT"]`,
  );
  expect(() => parse('|')).toThrowErrorMatchingInlineSnapshot(
    `[ExpError: No left operand for "PIPE"]`,
  );
  expect(() => parse('a |')).toThrowErrorMatchingInlineSnapshot(
    `[ExpError: Expected "ID" after "PIPE"]`,
  );
  expect(() => parse('a | 1')).toThrowErrorMatchingInlineSnapshot(
    `[ExpError: Expected "ID" after "PIPE"]`,
  );
  expect(() => parse('a | f(')).toThrowErrorMatchingInlineSnapshot(
    `[ExpError: Expected "RP" after "LP"]`,
  );
  expect(() => parse('x if')).toThrowErrorMatchingInlineSnapshot(
    `[ExpError: Expected test expression]`,
  );
  expect(() => parse('x if y else')).toThrowErrorMatchingInlineSnapshot(
    `[ExpError: Expected alternative expression]`,
  );
  expect(() => parse('x if y else ,')).toThrowErrorMatchingInlineSnapshot(
    `[ExpError: Expected alternative expression]`,
  );
  expect(() => parse('x if else')).toThrowErrorMatchingInlineSnapshot(
    `[ExpError: Expected test expression]`,
  );
  expect(() => parse('x if if')).toThrowErrorMatchingInlineSnapshot(
    `[ExpError: Expected test expression]`,
  );
  expect(() => parse('x if ,')).toThrowErrorMatchingInlineSnapshot(
    `[ExpError: Expected test expression]`,
  );
});

it('empty', () => {
  expect(parse('')).toMatchInlineSnapshot(`null`);
});

it('string', () => {
  expect(parse("'foo'")).toMatchInlineSnapshot(
    `
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
    }
  `,
  );
  expect(parse('"bar"')).toMatchInlineSnapshot(
    `
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
      "raw": ""bar"",
      "type": "LIT",
      "value": "bar",
    }
  `,
  );
});

it('number', () => {
  expect(parse('123')).toMatchInlineSnapshot(
    `
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
    }
  `,
  );
  expect(parse('12.34')).toMatchInlineSnapshot(
    `
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
      "raw": "12.34",
      "type": "LIT",
      "value": 12.34,
    }
  `,
  );
});

it('boolean', () => {
  expect(parse('true')).toMatchInlineSnapshot(
    `
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
    }
  `,
  );
  expect(parse('false')).toMatchInlineSnapshot(
    `
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
    }
  `,
  );
});

it('null and undefined', () => {
  expect(parse('null')).toMatchInlineSnapshot(
    `
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
    }
  `,
  );
  expect(parse('undefined')).toMatchInlineSnapshot(
    `
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
    }
  `,
  );
});

it('id', () => {
  expect(parse('a')).toMatchInlineSnapshot(
    `
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
    }
  `,
  );
  expect(parse('abc')).toMatchInlineSnapshot(
    `
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
      "raw": "abc",
      "type": "ID",
      "value": "abc",
    }
  `,
  );
});

it('dot', () => {
  expect(parse('.')).toMatchInlineSnapshot(`null`);
  expect(parse('a.b.c')).toMatchInlineSnapshot(
    `
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
      "path": [
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
      ],
      "raw": "a",
      "type": "ID",
      "value": "a",
    }
  `,
  );
  expect(parse('a.b.c(x, y, z)')).toMatchInlineSnapshot(
    `
    {
      "args": [
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
          "raw": "x",
          "type": "ID",
          "value": "x",
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
          "raw": "y",
          "type": "ID",
          "value": "y",
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
          "raw": "z",
          "type": "ID",
          "value": "z",
        },
      ],
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
      "path": [
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
      ],
      "raw": "a",
      "type": "ID",
      "value": "a",
    }
  `,
  );
});

it('not', () => {
  expect(parse('not a')).toMatchInlineSnapshot(
    `
    {
      "argument": {
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
        "raw": "a",
        "type": "ID",
        "value": "a",
      },
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
      "raw": "not",
      "type": "NOT",
      "value": "not",
    }
  `,
  );
  expect(parse('not not a')).toMatchInlineSnapshot(
    `
    {
      "argument": {
        "argument": {
          "loc": {
            "end": {
              "column": 10,
              "line": 1,
            },
            "start": {
              "column": 9,
              "line": 1,
            },
          },
          "raw": "a",
          "type": "ID",
          "value": "a",
        },
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
        "raw": "not",
        "type": "NOT",
        "value": "not",
      },
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
      "raw": "not",
      "type": "NOT",
      "value": "not",
    }
  `,
  );
  expect(parse('not x | f(a, "b")')).toMatchInlineSnapshot(
    `
    {
      "argument": {
        "left": {
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
          "raw": "x",
          "type": "ID",
          "value": "x",
        },
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
        "right": {
          "args": [
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
              "raw": "a",
              "type": "ID",
              "value": "a",
            },
            {
              "loc": {
                "end": {
                  "column": 15,
                  "line": 1,
                },
                "start": {
                  "column": 14,
                  "line": 1,
                },
              },
              "raw": ""b"",
              "type": "LIT",
              "value": "b",
            },
          ],
          "loc": {
            "end": {
              "column": 10,
              "line": 1,
            },
            "start": {
              "column": 9,
              "line": 1,
            },
          },
          "raw": "f",
          "type": "ID",
          "value": "f",
        },
        "type": "PIPE",
        "value": "|",
      },
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
      "raw": "not",
      "type": "NOT",
      "value": "not",
    }
  `,
  );
});

it('and', () => {
  expect(parse('a and b')).toMatchInlineSnapshot(
    `
    {
      "left": {
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
      "loc": {
        "end": {
          "column": 6,
          "line": 1,
        },
        "start": {
          "column": 3,
          "line": 1,
        },
      },
      "raw": "and",
      "right": {
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
        "raw": "b",
        "type": "ID",
        "value": "b",
      },
      "type": "AND",
      "value": "and",
    }
  `,
  );
});

it('or', () => {
  expect(parse('a or b')).toMatchInlineSnapshot(
    `
    {
      "left": {
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
      "raw": "or",
      "right": {
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
        "raw": "b",
        "type": "ID",
        "value": "b",
      },
      "type": "OR",
      "value": "or",
    }
  `,
  );
});

it('is', () => {
  expect(parse('a is b')).toMatchInlineSnapshot(
    `
    {
      "left": {
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
      "raw": "is",
      "right": {
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
        "raw": "b",
        "type": "ID",
        "value": "b",
      },
      "type": "IS",
      "value": "is",
    }
  `,
  );
});

it('eq', () => {
  expect(parse('a eq b')).toMatchInlineSnapshot(
    `
    {
      "left": {
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
      "raw": "eq",
      "right": {
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
        "raw": "b",
        "type": "ID",
        "value": "b",
      },
      "type": "EQ",
      "value": "eq",
    }
  `,
  );
});

it('ne', () => {
  expect(parse('a ne b')).toMatchInlineSnapshot(
    `
    {
      "left": {
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
      "raw": "ne",
      "right": {
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
        "raw": "b",
        "type": "ID",
        "value": "b",
      },
      "type": "NE",
      "value": "ne",
    }
  `,
  );
});

it('add', () => {
  expect(parse('a + b')).toMatchInlineSnapshot(
    `
    {
      "left": {
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
      "raw": "+",
      "right": {
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
        "raw": "b",
        "type": "ID",
        "value": "b",
      },
      "type": "ADD",
      "value": "+",
    }
  `,
  );
});

it('sub', () => {
  expect(parse('a - b')).toMatchInlineSnapshot(
    `
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
      "raw": "b",
      "type": "ID",
      "value": "b",
    }
  `,
  );
});

it('mul', () => {
  expect(parse('a * b')).toMatchInlineSnapshot(
    `
    {
      "left": {
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
      "raw": "*",
      "right": {
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
        "raw": "b",
        "type": "ID",
        "value": "b",
      },
      "type": "MUL",
      "value": "*",
    }
  `,
  );
});

it('div', () => {
  expect(parse('a / b')).toMatchInlineSnapshot(
    `
    {
      "left": {
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
      "raw": "/",
      "right": {
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
        "raw": "b",
        "type": "ID",
        "value": "b",
      },
      "type": "DIV",
      "value": "/",
    }
  `,
  );
});

it('mod', () => {
  expect(parse('a % b')).toMatchInlineSnapshot(
    `
    {
      "left": {
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
      "raw": "%",
      "right": {
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
        "raw": "b",
        "type": "ID",
        "value": "b",
      },
      "type": "MOD",
      "value": "%",
    }
  `,
  );
});

it('=', () => {
  expect(parse('a = b')).toMatchInlineSnapshot(
    `
    {
      "left": {
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
      "raw": "=",
      "right": {
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
        "raw": "b",
        "type": "ID",
        "value": "b",
      },
      "type": "ASSIGN",
      "value": "=",
    }
  `,
  );
});

it('in', () => {
  expect(parse('a in b')).toMatchInlineSnapshot(
    `
    {
      "left": {
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
      "raw": "in",
      "right": {
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
        "raw": "b",
        "type": "ID",
        "value": "b",
      },
      "type": "IN",
      "value": "in",
    }
  `,
  );
});

it('ni', () => {
  expect(parse('a ni b')).toMatchInlineSnapshot(
    `
    {
      "left": {
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
      "raw": "ni",
      "right": {
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
        "raw": "b",
        "type": "ID",
        "value": "b",
      },
      "type": "NI",
      "value": "ni",
    }
  `,
  );
});

it('of', () => {
  expect(parse('a of b')).toMatchInlineSnapshot(
    `
    {
      "left": {
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
      "raw": "of",
      "right": {
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
        "raw": "b",
        "type": "ID",
        "value": "b",
      },
      "type": "OF",
      "value": "of",
    }
  `,
  );
});

it('sequence', () => {
  expect(parse('(a,"b",1)')).toMatchInlineSnapshot(
    `
    {
      "elements": [
        {
          "loc": {
            "end": {
              "column": 3,
              "line": 1,
            },
            "start": {
              "column": 2,
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
              "column": 5,
              "line": 1,
            },
            "start": {
              "column": 4,
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
              "column": 7,
              "line": 1,
            },
            "start": {
              "column": 6,
              "line": 1,
            },
          },
          "raw": "1",
          "type": "LIT",
          "value": 1,
        },
      ],
      "loc": {
        "end": {
          "column": 8,
          "line": 1,
        },
        "start": {
          "column": 1,
          "line": 1,
        },
      },
      "raw": "(",
      "type": "SEQ",
      "value": "(",
    }
  `,
  );
  expect(parse('(a|b,"b" + 2,1 and 2)')).toMatchInlineSnapshot(
    `
    {
      "elements": [
        {
          "left": {
            "loc": {
              "end": {
                "column": 3,
                "line": 1,
              },
              "start": {
                "column": 2,
                "line": 1,
              },
            },
            "raw": "a",
            "type": "ID",
            "value": "a",
          },
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
          "right": {
            "loc": {
              "end": {
                "column": 5,
                "line": 1,
              },
              "start": {
                "column": 4,
                "line": 1,
              },
            },
            "raw": "b",
            "type": "ID",
            "value": "b",
          },
          "type": "PIPE",
          "value": "|",
        },
        {
          "left": {
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
            "raw": ""b"",
            "type": "LIT",
            "value": "b",
          },
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
          "raw": "+",
          "right": {
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
            "raw": "2",
            "type": "LIT",
            "value": 2,
          },
          "type": "ADD",
          "value": "+",
        },
        {
          "left": {
            "loc": {
              "end": {
                "column": 13,
                "line": 1,
              },
              "start": {
                "column": 12,
                "line": 1,
              },
            },
            "raw": "1",
            "type": "LIT",
            "value": 1,
          },
          "loc": {
            "end": {
              "column": 17,
              "line": 1,
            },
            "start": {
              "column": 14,
              "line": 1,
            },
          },
          "raw": "and",
          "right": {
            "loc": {
              "end": {
                "column": 19,
                "line": 1,
              },
              "start": {
                "column": 18,
                "line": 1,
              },
            },
            "raw": "2",
            "type": "LIT",
            "value": 2,
          },
          "type": "AND",
          "value": "and",
        },
      ],
      "loc": {
        "end": {
          "column": 20,
          "line": 1,
        },
        "start": {
          "column": 1,
          "line": 1,
        },
      },
      "raw": "(",
      "type": "SEQ",
      "value": "(",
    }
  `,
  );
  expect(parse(`x|f(a,"b",1)`)).toMatchInlineSnapshot(
    `
    {
      "left": {
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
      "loc": {
        "end": {
          "column": 3,
          "line": 1,
        },
        "start": {
          "column": 2,
          "line": 1,
        },
      },
      "raw": "|",
      "right": {
        "args": [
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
            "raw": "a",
            "type": "ID",
            "value": "a",
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
            "raw": ""b"",
            "type": "LIT",
            "value": "b",
          },
          {
            "loc": {
              "end": {
                "column": 10,
                "line": 1,
              },
              "start": {
                "column": 9,
                "line": 1,
              },
            },
            "raw": "1",
            "type": "LIT",
            "value": 1,
          },
        ],
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
        "raw": "f",
        "type": "ID",
        "value": "f",
      },
      "type": "PIPE",
      "value": "|",
    }
  `,
  );
});

it('pipe', () => {
  expect(parse('x | f')).toMatchInlineSnapshot(
    `
    {
      "left": {
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
      "right": {
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
      "type": "PIPE",
      "value": "|",
    }
  `,
  );
  expect(parse('x | f | f2')).toMatchInlineSnapshot(
    `
    {
      "left": {
        "left": {
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
        "right": {
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
        "type": "PIPE",
        "value": "|",
      },
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
      "right": {
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
      "type": "PIPE",
      "value": "|",
    }
  `,
  );
  expect(parse('x | f(a, "b")')).toMatchInlineSnapshot(
    `
    {
      "left": {
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
      "right": {
        "args": [
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
        ],
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
      "type": "PIPE",
      "value": "|",
    }
  `,
  );
  expect(parse('x | f(a, "b") | f2 (c, 1)')).toMatchInlineSnapshot(
    `
    {
      "left": {
        "left": {
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
        "right": {
          "args": [
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
          ],
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
        "type": "PIPE",
        "value": "|",
      },
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
      "right": {
        "args": [
          {
            "loc": {
              "end": {
                "column": 20,
                "line": 1,
              },
              "start": {
                "column": 19,
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
                "column": 23,
                "line": 1,
              },
              "start": {
                "column": 22,
                "line": 1,
              },
            },
            "raw": "1",
            "type": "LIT",
            "value": 1,
          },
        ],
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
      "type": "PIPE",
      "value": "|",
    }
  `,
  );
});

it('conditional', () => {
  expect(parse('"a" if x')).toMatchInlineSnapshot(
    `
    {
      "consequent": {
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
      "test": {
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
      "type": "IF",
      "value": "if",
    }
  `,
  );
  expect(parse('"a" if x else "b"')).toMatchInlineSnapshot(
    `
    {
      "alternative": {
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
        "raw": ""b"",
        "type": "LIT",
        "value": "b",
      },
      "consequent": {
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
      "test": {
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
      "type": "IF",
      "value": "if",
    }
  `,
  );
  expect(
    parse('"a" | f if x and y else "b" | f(a, "b")'),
  ).toMatchInlineSnapshot(
    `
    {
      "alternative": {
        "left": {
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
          "raw": ""b"",
          "type": "LIT",
          "value": "b",
        },
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
        "raw": "|",
        "right": {
          "args": [
            {
              "loc": {
                "end": {
                  "column": 30,
                  "line": 1,
                },
                "start": {
                  "column": 29,
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
                  "column": 33,
                  "line": 1,
                },
                "start": {
                  "column": 32,
                  "line": 1,
                },
              },
              "raw": ""b"",
              "type": "LIT",
              "value": "b",
            },
          ],
          "loc": {
            "end": {
              "column": 28,
              "line": 1,
            },
            "start": {
              "column": 27,
              "line": 1,
            },
          },
          "raw": "f",
          "type": "ID",
          "value": "f",
        },
        "type": "PIPE",
        "value": "|",
      },
      "consequent": {
        "left": {
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
        "right": {
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
        "type": "PIPE",
        "value": "|",
      },
      "loc": {
        "end": {
          "column": 9,
          "line": 1,
        },
        "start": {
          "column": 7,
          "line": 1,
        },
      },
      "raw": "if",
      "test": {
        "left": {
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
          "raw": "x",
          "type": "ID",
          "value": "x",
        },
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
        "raw": "and",
        "right": {
          "loc": {
            "end": {
              "column": 17,
              "line": 1,
            },
            "start": {
              "column": 16,
              "line": 1,
            },
          },
          "raw": "y",
          "type": "ID",
          "value": "y",
        },
        "type": "AND",
        "value": "and",
      },
      "type": "IF",
      "value": "if",
    }
  `,
  );
});

it('complex', () => {
  expect(
    parse('user | get("age") gt 18 and user | get("name") eq "John"'),
  ).toMatchInlineSnapshot(
    `
    {
      "left": {
        "left": {
          "left": {
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
          "right": {
            "args": [
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
            ],
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
          "type": "PIPE",
          "value": "|",
        },
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
        "right": {
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
        "type": "GT",
        "value": "gt",
      },
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
      "right": {
        "left": {
          "left": {
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
          "right": {
            "args": [
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
            ],
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
          "type": "PIPE",
          "value": "|",
        },
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
        "right": {
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
        "type": "EQ",
        "value": "eq",
      },
      "type": "AND",
      "value": "and",
    }
  `,
  );
});

it('whitespace', () => {
  expect(
    parse(`  x
    +\ty  `),
  ).toMatchInlineSnapshot(
    `
      {
        "left": {
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
        "right": {
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
        "type": "ADD",
        "value": "+",
      }
    `,
  );
});

it('precedences', () => {
  expect(parse('a + b * c')).toMatchInlineSnapshot(
    `
    {
      "left": {
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
      "raw": "+",
      "right": {
        "left": {
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
          "raw": "b",
          "type": "ID",
          "value": "b",
        },
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
        "raw": "*",
        "right": {
          "loc": {
            "end": {
              "column": 10,
              "line": 1,
            },
            "start": {
              "column": 9,
              "line": 1,
            },
          },
          "raw": "c",
          "type": "ID",
          "value": "c",
        },
        "type": "MUL",
        "value": "*",
      },
      "type": "ADD",
      "value": "+",
    }
  `,
  );
  expect(parse('a / b - c')).toMatchInlineSnapshot(
    `
    {
      "left": {
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
      "raw": "/",
      "right": {
        "loc": {
          "end": {
            "column": 10,
            "line": 1,
          },
          "start": {
            "column": 9,
            "line": 1,
          },
        },
        "raw": "c",
        "type": "ID",
        "value": "c",
      },
      "type": "DIV",
      "value": "/",
    }
  `,
  );
});

it('real world', () => {
  expect(parse('f(x|a, y + b, z and c)')).toMatchInlineSnapshot(
    `
    {
      "args": [
        {
          "left": {
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
          "loc": {
            "end": {
              "column": 5,
              "line": 1,
            },
            "start": {
              "column": 4,
              "line": 1,
            },
          },
          "raw": "|",
          "right": {
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
            "raw": "a",
            "type": "ID",
            "value": "a",
          },
          "type": "PIPE",
          "value": "|",
        },
        {
          "left": {
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
            "raw": "y",
            "type": "ID",
            "value": "y",
          },
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
          "raw": "+",
          "right": {
            "loc": {
              "end": {
                "column": 13,
                "line": 1,
              },
              "start": {
                "column": 12,
                "line": 1,
              },
            },
            "raw": "b",
            "type": "ID",
            "value": "b",
          },
          "type": "ADD",
          "value": "+",
        },
        {
          "left": {
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
            "raw": "z",
            "type": "ID",
            "value": "z",
          },
          "loc": {
            "end": {
              "column": 20,
              "line": 1,
            },
            "start": {
              "column": 17,
              "line": 1,
            },
          },
          "raw": "and",
          "right": {
            "loc": {
              "end": {
                "column": 22,
                "line": 1,
              },
              "start": {
                "column": 21,
                "line": 1,
              },
            },
            "raw": "c",
            "type": "ID",
            "value": "c",
          },
          "type": "AND",
          "value": "and",
        },
      ],
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
      "raw": "f",
      "type": "ID",
      "value": "f",
    }
  `,
  );
  expect(parse('(x, y, z) = a | b')).toMatchInlineSnapshot(
    `
    {
      "left": {
        "elements": [
          {
            "loc": {
              "end": {
                "column": 3,
                "line": 1,
              },
              "start": {
                "column": 2,
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
                "column": 6,
                "line": 1,
              },
              "start": {
                "column": 5,
                "line": 1,
              },
            },
            "raw": "y",
            "type": "ID",
            "value": "y",
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
            "raw": "z",
            "type": "ID",
            "value": "z",
          },
        ],
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
        "raw": "(",
        "type": "SEQ",
        "value": "(",
      },
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
      "raw": "=",
      "right": {
        "left": {
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
          "raw": "a",
          "type": "ID",
          "value": "a",
        },
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
        "raw": "|",
        "right": {
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
          "raw": "b",
          "type": "ID",
          "value": "b",
        },
        "type": "PIPE",
        "value": "|",
      },
      "type": "ASSIGN",
      "value": "=",
    }
  `,
  );
  expect(parse('(x, y) of items | f(a, "b")')).toMatchInlineSnapshot(
    `
    {
      "left": {
        "elements": [
          {
            "loc": {
              "end": {
                "column": 3,
                "line": 1,
              },
              "start": {
                "column": 2,
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
                "column": 6,
                "line": 1,
              },
              "start": {
                "column": 5,
                "line": 1,
              },
            },
            "raw": "y",
            "type": "ID",
            "value": "y",
          },
        ],
        "loc": {
          "end": {
            "column": 7,
            "line": 1,
          },
          "start": {
            "column": 1,
            "line": 1,
          },
        },
        "raw": "(",
        "type": "SEQ",
        "value": "(",
      },
      "loc": {
        "end": {
          "column": 10,
          "line": 1,
        },
        "start": {
          "column": 8,
          "line": 1,
        },
      },
      "raw": "of",
      "right": {
        "left": {
          "loc": {
            "end": {
              "column": 16,
              "line": 1,
            },
            "start": {
              "column": 11,
              "line": 1,
            },
          },
          "raw": "items",
          "type": "ID",
          "value": "items",
        },
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
        "raw": "|",
        "right": {
          "args": [
            {
              "loc": {
                "end": {
                  "column": 22,
                  "line": 1,
                },
                "start": {
                  "column": 21,
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
                  "column": 25,
                  "line": 1,
                },
                "start": {
                  "column": 24,
                  "line": 1,
                },
              },
              "raw": ""b"",
              "type": "LIT",
              "value": "b",
            },
          ],
          "loc": {
            "end": {
              "column": 20,
              "line": 1,
            },
            "start": {
              "column": 19,
              "line": 1,
            },
          },
          "raw": "f",
          "type": "ID",
          "value": "f",
        },
        "type": "PIPE",
        "value": "|",
      },
      "type": "OF",
      "value": "of",
    }
  `,
  );
});
