import { expect, it } from 'vitest'
import { config } from './config'
import { loader } from './loaders/file-loader'
import { Parser } from './parser'

it('invalid', async () => {
  try {
    await new Parser(config).parse('{{ layout }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[ParseError: missing file path]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `
      "missing file path

      1: {{ layout }}
      "
    `,
    )
  }
  try {
    await new Parser(config).parse('{{ layout "" }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[ParseError: missing file path]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `
      "missing file path

      1: {{ layout "" }}
         ^^
      "
    `,
    )
  }
  try {
    await new Parser({ ...config, loader }).parse('{{ layout "default" }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[Error: file not found: layouts/default.jianjia]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `undefined`,
    )
  }
})

it('layout', async () => {
  expect(await new Parser({
    ...config,
    loader: async path => loader(`test/${path}`),
  }).parse('{{ layout "default" }}')).toMatchInlineSnapshot(
    `
    {
      "end": 18,
      "name": "raw",
      "next": {
        "end": 34,
        "name": "block",
        "next": {
          "end": 56,
          "name": "raw",
          "next": {
            "end": 70,
            "name": "endblock",
            "next": {
              "end": 92,
              "name": "raw",
              "next": {
                "end": 108,
                "name": "block",
                "next": {
                  "end": 132,
                  "name": "raw",
                  "next": {
                    "end": 146,
                    "name": "endblock",
                    "next": {
                      "end": 165,
                      "name": "raw",
                      "next": null,
                      "previous": [Circular],
                      "raw": "
      </body>
    </html>
    ",
                      "start": 146,
                    },
                    "previous": [Circular],
                    "raw": "{{ endblock }}",
                    "start": 132,
                    "stripAfter": false,
                    "stripBefore": false,
                    "value": null,
                  },
                  "previous": [Circular],
                  "raw": "<h1>Hello, JianJia!</h1>",
                  "start": 108,
                },
                "previous": [Circular],
                "raw": "{{ block body }}",
                "start": 92,
                "stripAfter": false,
                "stripBefore": false,
                "value": {
                  "end": 4,
                  "raw": "body",
                  "start": 0,
                  "type": "ID",
                  "value": "body",
                },
              },
              "previous": [Circular],
              "raw": "
      </head>
      <body>
      ",
              "start": 70,
            },
            "previous": [Circular],
            "raw": "{{ endblock }}",
            "start": 56,
            "stripAfter": false,
            "stripBefore": false,
            "value": null,
          },
          "previous": [Circular],
          "raw": "<title>JianJia</title>",
          "start": 34,
        },
        "previous": [Circular],
        "raw": "{{ block head }}",
        "start": 18,
        "stripAfter": false,
        "stripBefore": false,
        "value": {
          "end": 4,
          "raw": "head",
          "start": 0,
          "type": "ID",
          "value": "head",
        },
      },
      "previous": null,
      "raw": "<html>
      <head>
      ",
      "start": 0,
    }
  `,
  )
})
