import { expect, it } from 'vitest'
import { config } from './config'
import { loader } from './loaders/file-loader'
import { Tokenizer } from './tokenizer'

it('empty', async () => {
  expect(await new Tokenizer(config).tokenize('')).toMatchInlineSnapshot('null')
  expect(await new Tokenizer(config).tokenize(' ')).toMatchInlineSnapshot(`
    {
      "end": 1,
      "name": "str",
      "next": null,
      "previous": null,
      "raw": " ",
      "start": 0,
      "value": " ",
    }
  `)
})

it('layout', async () => {
  expect(await new Tokenizer({ ...config, loader: async path => loader(`test/${path}`) }).tokenize('{{ layout "default" }}')).toMatchInlineSnapshot(`
    {
      "end": 18,
      "name": "str",
      "next": {
        "end": 34,
        "name": "block",
        "next": {
          "end": 56,
          "name": "str",
          "next": {
            "end": 70,
            "name": "endblock",
            "next": {
              "end": 92,
              "name": "str",
              "next": {
                "end": 108,
                "name": "block",
                "next": {
                  "end": 132,
                  "name": "str",
                  "next": {
                    "end": 146,
                    "name": "endblock",
                    "next": {
                      "end": 165,
                      "name": "str",
                      "next": null,
                      "previous": [Circular],
                      "raw": "
      </body>
    </html>
    ",
                      "start": 146,
                      "value": "
      </body>
    </html>
    ",
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
                  "value": "<h1>Hello, JianJia!</h1>",
                },
                "previous": [Circular],
                "raw": "{{ block body }}",
                "start": 92,
                "stripAfter": false,
                "stripBefore": false,
                "value": "body",
              },
              "previous": [Circular],
              "raw": "
      </head>
      <body>
      ",
              "start": 70,
              "value": "
      </head>
      <body>
      ",
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
          "value": "<title>JianJia</title>",
        },
        "previous": [Circular],
        "raw": "{{ block head }}",
        "start": 18,
        "stripAfter": false,
        "stripBefore": false,
        "value": "head",
      },
      "previous": null,
      "raw": "<html>
      <head>
      ",
      "start": 0,
      "value": "<html>
      <head>
      ",
    }
  `)
})

it('block', async () => {
  expect(await new Tokenizer(config).tokenize('{{ block title }}1{{ endblock }}{{ block title }}2{{ endblock }}{{ block title }}{{ super }}3{{ endblock }}')).toMatchInlineSnapshot(`
    {
      "end": 81,
      "name": "block",
      "next": {
        "end": 49,
        "name": "block",
        "next": {
          "end": 50,
          "name": "str",
          "next": {
            "end": 64,
            "name": "endblock",
            "next": {
              "end": 93,
              "name": "str",
              "next": {
                "end": 107,
                "name": "endblock",
                "next": null,
                "previous": [Circular],
                "raw": "{{ endblock }}",
                "start": 93,
                "stripAfter": false,
                "stripBefore": false,
                "value": null,
              },
              "previous": [Circular],
              "raw": "3",
              "start": 92,
              "value": "3",
            },
            "previous": [Circular],
            "raw": "{{ endblock }}",
            "start": 50,
            "stripAfter": false,
            "stripBefore": false,
            "value": null,
          },
          "previous": [Circular],
          "raw": "2",
          "start": 49,
          "value": "2",
        },
        "previous": [Circular],
        "raw": "{{ block title }}",
        "start": 32,
        "stripAfter": false,
        "stripBefore": false,
        "value": "title",
      },
      "previous": null,
      "raw": "{{ block title }}",
      "start": 64,
      "stripAfter": false,
      "stripBefore": false,
      "value": "title",
    }
  `)
})

it('invalid', async () => {
  try {
    await new Tokenizer(config).tokenize('{{ layout }}')
  }
  catch (error) {
    expect(error).toMatchInlineSnapshot(`[Error: missing layout file path]`)
  }
  try {
    await new Tokenizer(config).tokenize('{{ layout "" }}')
  }
  catch (error) {
    expect(error).toMatchInlineSnapshot(`[Error: missing layout file path]`)
  }
  try {
    await new Tokenizer(config).tokenize('{{ include }}')
  }
  catch (error) {
    expect(error).toMatchInlineSnapshot(`[Error: missing include file path]`)
  }
  try {
    await new Tokenizer(config).tokenize('{{ include "" }}')
  }
  catch (error) {
    expect(error).toMatchInlineSnapshot(`[Error: missing include file path]`)
  }
  try {
    await new Tokenizer({ ...config, loader: async path => loader(`test/${path}`) }).tokenize('{{ include "empty" }}')
  }
  catch (error) {
    expect(error).toMatchInlineSnapshot(`[TypeError: Failed to parse URL from test/partials/empty.jianjia]`)
  }
})
