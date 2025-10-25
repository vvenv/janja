import { expect, it } from 'vitest'
import { config } from './config'
import { loader } from './loaders/file-loader'
import { Parser } from './parser'

it('invalid', async () => {
  try {
    await new Parser(config).parse('{{ include }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[ParseError: missing file path]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `
      "missing file path

      1: {{ include }}
      "
    `,
    )
  }
  try {
    await new Parser(config).parse('{{ include "" }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[ParseError: missing file path]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `
      "missing file path

      1: {{ include "" }}
         ^^
      "
    `,
    )
  }
  try {
    await new Parser({ ...config, loader }).parse('{{ include "default" }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[Error: file not found: partials/default.jianjia]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `undefined`,
    )
  }
})

it('include', async () => {
  expect(await new Parser({
    ...config,
    loader: async path => loader(`test/${path}`),
  }).parse('{{ include "head" }}{{ include "empty" }}{{ include "body" }}')).toMatchInlineSnapshot(
    `
    {
      "end": 17,
      "name": "block",
      "next": {
        "end": 43,
        "name": "raw",
        "next": {
          "end": 58,
          "name": "endblock",
          "next": {
            "end": 59,
            "name": "raw",
            "next": {
              "end": 17,
              "name": "block",
              "next": {
                "end": 37,
                "name": "raw",
                "next": {
                  "end": 52,
                  "name": "endblock",
                  "next": {
                    "end": 53,
                    "name": "raw",
                    "next": null,
                    "previous": [Circular],
                    "raw": "
    ",
                    "start": 52,
                  },
                  "previous": [Circular],
                  "raw": "{{- endblock }}",
                  "start": 37,
                  "stripAfter": false,
                  "stripBefore": true,
                  "value": null,
                },
                "previous": [Circular],
                "raw": "
    <h1>蒹葭苍苍，白露为霜</h1>
    ",
                "start": 17,
              },
              "previous": [Circular],
              "raw": "{{ block body -}}",
              "start": 0,
              "stripAfter": true,
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
    ",
            "start": 58,
          },
          "previous": [Circular],
          "raw": "{{- endblock }}",
          "start": 43,
          "stripAfter": false,
          "stripBefore": true,
          "value": null,
        },
        "previous": [Circular],
        "raw": "
    <title>蒹葭苍苍，白露为霜</title>
    ",
        "start": 17,
      },
      "previous": null,
      "raw": "{{ block head -}}",
      "start": 0,
      "stripAfter": true,
      "stripBefore": false,
      "value": {
        "end": 4,
        "raw": "head",
        "start": 0,
        "type": "ID",
        "value": "head",
      },
    }
  `,
  )
})
