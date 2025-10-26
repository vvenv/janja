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
      `[Error: file not found: layouts/default.janja]`,
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
          "end": 54,
          "name": "raw",
          "next": {
            "end": 68,
            "name": "endblock",
            "next": {
              "end": 90,
              "name": "raw",
              "next": {
                "end": 106,
                "name": "block",
                "next": {
                  "end": 128,
                  "name": "raw",
                  "next": {
                    "end": 142,
                    "name": "endblock",
                    "next": {
                      "end": 161,
                      "name": "raw",
                      "next": null,
                      "previous": [Circular],
                      "raw": "
      </body>
    </html>
    ",
                      "start": 142,
                    },
                    "previous": [Circular],
                    "raw": "{{ endblock }}",
                    "start": 128,
                    "stripAfter": false,
                    "stripBefore": false,
                    "value": null,
                  },
                  "previous": [Circular],
                  "raw": "<h1>Hello, Janja!</h1>",
                  "start": 106,
                },
                "previous": [Circular],
                "raw": "{{ block body }}",
                "start": 90,
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
              "start": 68,
            },
            "previous": [Circular],
            "raw": "{{ endblock }}",
            "start": 54,
            "stripAfter": false,
            "stripBefore": false,
            "value": null,
          },
          "previous": [Circular],
          "raw": "<title>Janja</title>",
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
