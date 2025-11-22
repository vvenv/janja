import { expect, it } from 'vitest';
import { parse } from '../test/__helper';

it('error', async () => {
  try {
    await parse('{{ block }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "block" requires expression]`,
    );
    expect(error.details).toMatchInlineSnapshot(
      `
      ""block" requires expression

      1｜ {{ block }}
       ｜ ^         ^
      "
    `,
    );
  }

  try {
    await parse('{{ block "" }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: Unclosed "block"]`);
    expect(error.details).toMatchInlineSnapshot(
      `
      "Unclosed "block"

      1｜ {{ block "" }}
       ｜ ^            ^
      "
    `,
    );
  }
});

it('block', async () => {
  expect(
    await parse(
      '{{ block title }}1{{ endblock }}{{ if x }}{{ block title }}2{{ super }}{{ endblock }}{{ endif }}',
    ),
  ).toMatchInlineSnapshot(
    `
    RootNode {
      "body": [
        BlockNode {
          "body": [
            TextNode {
              "body": undefined,
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
              "strip": {},
              "type": "TEXT",
              "val": "1",
            },
          ],
          "loc": {
            "end": {
              "column": 18,
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
          "type": "BLOCK",
          "val": {
            "loc": {
              "end": {
                "column": 15,
                "line": 1,
              },
              "start": {
                "column": 10,
                "line": 1,
              },
            },
            "raw": "title",
            "type": "ID",
            "value": "title",
          },
        },
        IfNode {
          "alternatives": [],
          "body": [
            BlockNode {
              "body": [
                TextNode {
                  "body": undefined,
                  "loc": {
                    "end": {
                      "column": 61,
                      "line": 1,
                    },
                    "start": {
                      "column": 60,
                      "line": 1,
                    },
                  },
                  "strip": {},
                  "type": "TEXT",
                  "val": "2",
                },
                SuperNode {
                  "body": undefined,
                  "loc": {
                    "end": {
                      "column": 72,
                      "line": 1,
                    },
                    "start": {
                      "column": 61,
                      "line": 1,
                    },
                  },
                  "strip": {
                    "after": false,
                    "before": false,
                  },
                  "type": "SUPER",
                  "val": " super ",
                },
              ],
              "loc": {
                "end": {
                  "column": 60,
                  "line": 1,
                },
                "start": {
                  "column": 43,
                  "line": 1,
                },
              },
              "strip": {
                "after": false,
                "before": false,
              },
              "type": "BLOCK",
              "val": {
                "loc": {
                  "end": {
                    "column": 57,
                    "line": 1,
                  },
                  "start": {
                    "column": 52,
                    "line": 1,
                  },
                },
                "raw": "title",
                "type": "ID",
                "value": "title",
              },
            },
          ],
          "loc": {
            "end": {
              "column": 43,
              "line": 1,
            },
            "start": {
              "column": 33,
              "line": 1,
            },
          },
          "strip": {
            "after": false,
            "before": false,
          },
          "test": {
            "loc": {
              "end": {
                "column": 40,
                "line": 1,
              },
              "start": {
                "column": 39,
                "line": 1,
              },
            },
            "raw": "x",
            "type": "ID",
            "value": "x",
          },
          "type": "IF",
        },
      ],
      "loc": {
        "end": {
          "column": 97,
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
