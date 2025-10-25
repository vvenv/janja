import { expect, it } from 'vitest'
import { parse } from '../test/__helper'
import { loader } from './loaders/file-loader'

it('invalid', async () => {
  try {
    await parse('{{ layout }}')
    expect(true).toBe(false)
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[ParseError: "layout" tag must have a file path]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `
      ""layout" tag must have a file path

      1: {{ layout }}
      "
    `,
    )
  }
  try {
    await parse('{{ layout "" }}')
    expect(true).toBe(false)
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[ParseError: "layout" tag must have a file path]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `
      ""layout" tag must have a file path

      1: {{ layout "" }}
         ^^
      "
    `,
    )
  }
  try {
    await parse(
      '{{ layout "default" }}',
      { loader },
    )
    expect(true).toBe(false)
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
  expect(await parse(
    '{{ layout "default" }}',
    {
      loader: async path => loader(`test/${path}`),
    },
  )).toMatchInlineSnapshot(
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
