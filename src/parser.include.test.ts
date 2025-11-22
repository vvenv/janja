import { expect, it } from 'vitest';
import { parse } from '../test/__helper';

it('error', async () => {
  try {
    await parse('{{ include }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "include" requires expression]`,
    );
    expect(error.details).toMatchInlineSnapshot(
      `
      ""include" requires expression

      1｜ {{ include }}
       ｜ ^           ^
      "
    `,
    );
  }
});

it('include', async () => {
  expect(
    await parse(
      '{{ include "head" }}{{ include "empty" }}{{ include "body" }}',
    ),
  ).toMatchInlineSnapshot(
    `
    RootNode {
      "body": [
        IncludeNode {
          "body": undefined,
          "loc": {
            "end": {
              "column": 21,
              "line": 1,
            },
            "start": {
              "column": 1,
              "line": 1,
            },
          },
          "strip": {
            "after": false,
            "before": false,
          },
          "type": "INCLUDE",
          "val": {
            "loc": {
              "end": {
                "column": 16,
                "line": 1,
              },
              "start": {
                "column": 12,
                "line": 1,
              },
            },
            "raw": ""head"",
            "type": "LIT",
            "value": "head",
          },
        },
        IncludeNode {
          "body": undefined,
          "loc": {
            "end": {
              "column": 42,
              "line": 1,
            },
            "start": {
              "column": 21,
              "line": 1,
            },
          },
          "strip": {
            "after": false,
            "before": false,
          },
          "type": "INCLUDE",
          "val": {
            "loc": {
              "end": {
                "column": 37,
                "line": 1,
              },
              "start": {
                "column": 32,
                "line": 1,
              },
            },
            "raw": ""empty"",
            "type": "LIT",
            "value": "empty",
          },
        },
        IncludeNode {
          "body": undefined,
          "loc": {
            "end": {
              "column": 62,
              "line": 1,
            },
            "start": {
              "column": 42,
              "line": 1,
            },
          },
          "strip": {
            "after": false,
            "before": false,
          },
          "type": "INCLUDE",
          "val": {
            "loc": {
              "end": {
                "column": 57,
                "line": 1,
              },
              "start": {
                "column": 53,
                "line": 1,
              },
            },
            "raw": ""body"",
            "type": "LIT",
            "value": "body",
          },
        },
      ],
      "loc": {
        "end": {
          "column": 62,
          "line": 1,
        },
        "start": {
          "column": 1,
          "line": 1,
        },
      },
      "type": "TEMPLATE",
    }
  `,
  );
});
