import { expect, it } from 'vitest';
import { parse } from '../test/__helper';

it('error', async () => {
  try {
    await parse('{{}}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: Unknown "" node]`);
    expect(error.details).toMatchInlineSnapshot(
      `
      "Unknown "" node

      1｜ {{}}
       ｜ ^  ^
      "
    `,
    );
  }

  try {
    await parse('{{ else');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: Unclosed "{{"]`);
    expect(error.details).toMatchInlineSnapshot(
      `
      "Unclosed "{{"

      1｜ {{ else
       ｜ ^^
      "
    `,
    );
  }

  try {
    await parse('{{ else }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: Unknown "else" node]`);
    expect(error.details).toMatchInlineSnapshot(
      `
      "Unknown "else" node

      1｜ {{ else }}
       ｜ ^        ^
      "
    `,
    );
  }

  try {
    await parse('{{ elseif }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: Unexpected "elseif" node]`,
    );
    expect(error.details).toMatchInlineSnapshot(
      `
      "Unexpected "elseif" node

      1｜ {{ elseif }}
       ｜ ^          ^
      "
    `,
    );
  }

  try {
    await parse('{{ if }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "if" requires expression]`,
    );
    expect(error.details).toMatchInlineSnapshot(
      `
      ""if" requires expression

      1｜ {{ if }}
       ｜ ^      ^
      "
    `,
    );
  }

  try {
    await parse('{{ if x }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: Unclosed "if"]`);
    expect(error.details).toMatchInlineSnapshot(
      `
      "Unclosed "if"

      1｜ {{ if x }}
       ｜ ^        ^
      "
    `,
    );
  }

  try {
    await parse('{{ if x }}{{ else y }}{{ endif }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "else" should not have expression]`,
    );
    expect(error.details).toMatchInlineSnapshot(
      `
      ""else" should not have expression

      1｜ {{ if x }}{{ else y }}{{ endif }}
       ｜           ^          ^
      "
    `,
    );
  }

  try {
    await parse('{{ for }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: "for" requires expression]`,
    );
    expect(error.details).toMatchInlineSnapshot(
      `
      ""for" requires expression

      1｜ {{ for }}
       ｜ ^       ^
      "
    `,
    );
  }
});

it('escape tag', async () => {
  expect(await parse('{{= "{{ escape }}" }}')).toMatchInlineSnapshot(
    `
    RootNode {
      "body": [
        OutputNode {
          "body": undefined,
          "exp": {
            "loc": {
              "end": {
                "column": 12,
                "line": 1,
              },
              "start": {
                "column": 2,
                "line": 1,
              },
            },
            "raw": ""{{ escape "",
            "type": "LIT",
            "value": "{{ escape ",
          },
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
          "type": "OUTPUT",
          "val": " "{{ escape ",
        },
        TextNode {
          "body": undefined,
          "loc": {
            "end": {
              "column": 22,
              "line": 1,
            },
            "start": {
              "column": 18,
              "line": 1,
            },
          },
          "strip": {},
          "type": "TEXT",
          "val": "" }}",
        },
      ],
      "loc": {
        "end": {
          "column": 22,
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
  expect(await parse('{{= "\\{\\{ escape \\}\\}" }}')).toMatchInlineSnapshot(
    `
    RootNode {
      "body": [
        OutputNode {
          "body": undefined,
          "exp": {
            "loc": {
              "end": {
                "column": 14,
                "line": 1,
              },
              "start": {
                "column": 2,
                "line": 1,
              },
            },
            "raw": ""{{ escape }}"",
            "type": "LIT",
            "value": "{{ escape }}",
          },
          "loc": {
            "end": {
              "column": 26,
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
          "type": "OUTPUT",
          "val": " "{{ escape }}" ",
        },
      ],
      "loc": {
        "end": {
          "column": 26,
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

it('empty', async () => {
  expect(await parse('')).toMatchInlineSnapshot(
    `
    RootNode {
      "body": [],
      "loc": {
        "end": {
          "column": 1,
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
  expect(await parse(' ')).toMatchInlineSnapshot(
    `
    RootNode {
      "body": [
        TextNode {
          "body": undefined,
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
          "strip": {},
          "type": "TEXT",
          "val": " ",
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
      "type": "TEMPLATE",
    }
  `,
  );
});

it('comment', async () => {
  expect(await parse('{{# if x -#}}')).toMatchInlineSnapshot(
    `
    RootNode {
      "body": [
        CommentNode {
          "body": undefined,
          "loc": {
            "end": {
              "column": 14,
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
          "type": "COMMENT",
          "val": " if x -#",
        },
      ],
      "loc": {
        "end": {
          "column": 14,
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

it('directive', async () => {
  expect(await parse('{{if x -}}{{endif}}')).toMatchInlineSnapshot(
    `
    RootNode {
      "body": [
        IfNode {
          "alternatives": [],
          "body": [],
          "loc": {
            "end": {
              "column": 11,
              "line": 1,
            },
            "start": {
              "column": 1,
              "line": 1,
            },
          },
          "strip": {
            "after": true,
            "before": false,
          },
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
      "type": "TEMPLATE",
    }
  `,
  );
});

it('output', async () => {
  expect(await parse('{{=- x }}')).toMatchInlineSnapshot(
    `
    RootNode {
      "body": [
        OutputNode {
          "body": undefined,
          "exp": {
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
          "strip": {
            "after": false,
            "before": true,
          },
          "type": "OUTPUT",
          "val": " x ",
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
      "type": "TEMPLATE",
    }
  `,
  );
  expect(await parse('{{= null }}')).toMatchInlineSnapshot(
    `
    RootNode {
      "body": [
        OutputNode {
          "body": undefined,
          "exp": {
            "loc": {
              "end": {
                "column": 6,
                "line": 1,
              },
              "start": {
                "column": 2,
                "line": 1,
              },
            },
            "raw": "null",
            "type": "LIT",
            "value": null,
          },
          "loc": {
            "end": {
              "column": 12,
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
          "type": "OUTPUT",
          "val": " null ",
        },
      ],
      "loc": {
        "end": {
          "column": 12,
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
  expect(await parse('{{= x + 1 }}')).toMatchInlineSnapshot(
    `
    RootNode {
      "body": [
        OutputNode {
          "body": undefined,
          "exp": {
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
            "raw": "+",
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
              "raw": "1",
              "type": "LIT",
              "value": 1,
            },
            "type": "ADD",
            "value": "+",
          },
          "loc": {
            "end": {
              "column": 13,
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
          "type": "OUTPUT",
          "val": " x + 1 ",
        },
      ],
      "loc": {
        "end": {
          "column": 13,
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

it('text', async () => {
  expect(
    await parse(`hello
      world`),
  ).toMatchInlineSnapshot(
    `
    RootNode {
      "body": [
        TextNode {
          "body": undefined,
          "loc": {
            "end": {
              "column": 12,
              "line": 2,
            },
            "start": {
              "column": 1,
              "line": 1,
            },
          },
          "strip": {},
          "type": "TEXT",
          "val": "hello
          world",
        },
      ],
      "loc": {
        "end": {
          "column": 12,
          "line": 2,
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

it('custom open/close markers', async () => {
  expect(
    await parse('<% if x %>{{ x }}<% endif %>', {
      directiveOpen: '<%',
      directiveClose: '%>',
      outputOpen: '{{',
      outputClose: '}}',
    }),
  ).toMatchInlineSnapshot(
    `
    RootNode {
      "body": [
        IfNode {
          "alternatives": [],
          "body": [
            OutputNode {
              "body": undefined,
              "exp": {
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
                "raw": "x",
                "type": "ID",
                "value": "x",
              },
              "loc": {
                "end": {
                  "column": 18,
                  "line": 1,
                },
                "start": {
                  "column": 11,
                  "line": 1,
                },
              },
              "strip": {
                "after": false,
                "before": false,
              },
              "type": "OUTPUT",
              "val": " x ",
            },
          ],
          "loc": {
            "end": {
              "column": 11,
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
          "test": {
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
          "type": "IF",
        },
      ],
      "loc": {
        "end": {
          "column": 29,
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
