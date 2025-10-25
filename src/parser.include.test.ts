import { expect, it } from 'vitest'
import { parse } from '../test/__helper'
import { loader } from './loaders/file-loader'

it('invalid', async () => {
  try {
    await parse('{{ include }}')
    expect(true).toBe(false)
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[ParseError: "include" tag must have a file path]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `
      ""include" tag must have a file path

      1: {{ include }}
      "
    `,
    )
  }
  try {
    await parse('{{ include "" }}')
    expect(true).toBe(false)
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[ParseError: "include" tag must have a file path]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `
      ""include" tag must have a file path

      1: {{ include "" }}
         ^^
      "
    `,
    )
  }
  try {
    await parse(
      '{{ include "default" }}',
      { loader },
    )
    expect(true).toBe(false)
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
  expect(await parse(
    '{{ include "head" }}{{ include "empty" }}{{ include "body" }}',
    {
      loader: async path => loader(`test/${path}`),
    },
  )).toMatchInlineSnapshot(
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
