import { expect, it } from 'vitest';
import { tokenize } from '../test/__helper';

it('escape', () => {
  expect(tokenize('{{ "{{ escape }}" }}')).toMatchInlineSnapshot(
    `
    [
      {
        "expression": {
          "loc": {
            "end": {
              "column": 15,
              "line": 1,
            },
            "start": {
              "column": 8,
              "line": 1,
            },
          },
          "val": "escape ",
        },
        "loc": {
          "end": {
            "column": 17,
            "line": 1,
          },
          "start": {
            "column": 1,
            "line": 1,
          },
        },
        "name": ""{{",
        "strip": {
          "after": false,
          "before": false,
        },
        "type": "DIRECTIVE",
        "val": " "{{ escape ",
      },
      {
        "loc": {
          "end": {
            "column": 21,
            "line": 1,
          },
          "start": {
            "column": 17,
            "line": 1,
          },
        },
        "strip": {},
        "type": "TEXT",
        "val": "" }}",
      },
    ]
  `,
  );
  expect(tokenize('{{ "\\{\\{ escape \\}\\}" }}')).toMatchInlineSnapshot(
    `
    [
      {
        "expression": {
          "loc": {
            "end": {
              "column": 23,
              "line": 1,
            },
            "start": {
              "column": 10,
              "line": 1,
            },
          },
          "val": "escape \\}\\}" ",
        },
        "loc": {
          "end": {
            "column": 25,
            "line": 1,
          },
          "start": {
            "column": 1,
            "line": 1,
          },
        },
        "name": ""\\{\\{",
        "strip": {
          "after": false,
          "before": false,
        },
        "type": "DIRECTIVE",
        "val": " "{{ escape }}" ",
      },
    ]
  `,
  );
});

it('empty', async () => {
  expect(tokenize('')).toMatchInlineSnapshot(`[]`);
  expect(tokenize(' ')).toMatchInlineSnapshot(
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
        "strip": {},
        "type": "TEXT",
        "val": " ",
      },
    ]
  `,
  );
});

it('comment', async () => {
  expect(tokenize('{# if x -#}')).toMatchInlineSnapshot(`
    [
      {
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
        "strip": {},
        "type": "TEXT",
        "val": "{# if x -#}",
      },
    ]
  `);
});

it('directive', async () => {
  expect(tokenize('{{if x -}}{{endif}}')).toMatchInlineSnapshot(
    `
    [
      {
        "expression": {
          "loc": {
            "end": {
              "column": 8,
              "line": 1,
            },
            "start": {
              "column": 6,
              "line": 1,
            },
          },
          "val": "x ",
        },
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
        "name": "if",
        "strip": {
          "after": true,
          "before": false,
        },
        "type": "DIRECTIVE",
        "val": "if x ",
      },
      {
        "expression": null,
        "loc": {
          "end": {
            "column": 20,
            "line": 1,
          },
          "start": {
            "column": 11,
            "line": 1,
          },
        },
        "name": "endif",
        "strip": {
          "after": false,
          "before": false,
        },
        "type": "DIRECTIVE",
        "val": "endif",
      },
    ]
  `,
  );
  expect(tokenize('{{ if }}{{ endif }}')).toMatchInlineSnapshot(
    `
    [
      {
        "expression": null,
        "loc": {
          "end": {
            "column": 9,
            "line": 1,
          },
          "start": {
            "column": 1,
            "line": 1,
          },
        },
        "name": "if",
        "strip": {
          "after": false,
          "before": false,
        },
        "type": "DIRECTIVE",
        "val": " if ",
      },
      {
        "expression": null,
        "loc": {
          "end": {
            "column": 20,
            "line": 1,
          },
          "start": {
            "column": 9,
            "line": 1,
          },
        },
        "name": "endif",
        "strip": {
          "after": false,
          "before": false,
        },
        "type": "DIRECTIVE",
        "val": " endif ",
      },
    ]
  `,
  );
});

it('output', async () => {
  expect(tokenize('{{- x }}')).toMatchInlineSnapshot(
    `
    [
      {
        "expression": null,
        "loc": {
          "end": {
            "column": 9,
            "line": 1,
          },
          "start": {
            "column": 1,
            "line": 1,
          },
        },
        "name": "x",
        "strip": {
          "after": false,
          "before": true,
        },
        "type": "DIRECTIVE",
        "val": " x ",
      },
    ]
  `,
  );
  expect(tokenize('{{ null }}')).toMatchInlineSnapshot(
    `
    [
      {
        "expression": null,
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
        "name": "null",
        "strip": {
          "after": false,
          "before": false,
        },
        "type": "DIRECTIVE",
        "val": " null ",
      },
    ]
  `,
  );
  expect(tokenize('{{ x + 1 }}')).toMatchInlineSnapshot(
    `
    [
      {
        "expression": {
          "loc": {
            "end": {
              "column": 10,
              "line": 1,
            },
            "start": {
              "column": 6,
              "line": 1,
            },
          },
          "val": "+ 1 ",
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
        "name": "x",
        "strip": {
          "after": false,
          "before": false,
        },
        "type": "DIRECTIVE",
        "val": " x + 1 ",
      },
    ]
  `,
  );
});

it('text', async () => {
  expect(
    await tokenize(`hello
      world`),
  ).toMatchInlineSnapshot(
    `
    [
      {
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
    ]
  `,
  );
});

it('custom open/close markers', async () => {
  expect(
    await tokenize('<% if x %><%= x %><% endif %>', {
      directiveOpen: '<%',
      directiveClose: '%>',
      outputOpen: '<%=',
      outputClose: '%>',
    }),
  ).toMatchInlineSnapshot(
    `
    [
      {
        "expression": {
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
          "val": "x ",
        },
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
        "name": "if",
        "strip": {
          "after": false,
          "before": false,
        },
        "type": "DIRECTIVE",
        "val": " if x ",
      },
      {
        "loc": {
          "end": {
            "column": 19,
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
      {
        "expression": null,
        "loc": {
          "end": {
            "column": 30,
            "line": 1,
          },
          "start": {
            "column": 19,
            "line": 1,
          },
        },
        "name": "endif",
        "strip": {
          "after": false,
          "before": false,
        },
        "type": "DIRECTIVE",
        "val": " endif ",
      },
    ]
  `,
  );
  expect(tokenize('{{ if x }}{{ x }}{{ endif }}')).toMatchInlineSnapshot(
    `
    [
      {
        "expression": {
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
          "val": "x ",
        },
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
        "name": "if",
        "strip": {
          "after": false,
          "before": false,
        },
        "type": "DIRECTIVE",
        "val": " if x ",
      },
      {
        "expression": null,
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
        "name": "x",
        "strip": {
          "after": false,
          "before": false,
        },
        "type": "DIRECTIVE",
        "val": " x ",
      },
      {
        "expression": null,
        "loc": {
          "end": {
            "column": 29,
            "line": 1,
          },
          "start": {
            "column": 18,
            "line": 1,
          },
        },
        "name": "endif",
        "strip": {
          "after": false,
          "before": false,
        },
        "type": "DIRECTIVE",
        "val": " endif ",
      },
    ]
  `,
  );
});
