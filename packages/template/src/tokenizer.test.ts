import { expect, it } from 'vitest'
import { defaultOptions } from './engine'
import { loader } from './loaders/file-loader'
import { Tokenizer } from './tokenizer'

it('empty', async () => {
  expect(await new Tokenizer(defaultOptions).parse('')).toMatchInlineSnapshot('null')
  expect(await new Tokenizer(defaultOptions).parse(' ')).toMatchInlineSnapshot(`
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
  expect(await new Tokenizer({ ...defaultOptions, loader: async path => loader(`test/${path}`) }).parse('{{ layout "default" }}')).toMatchInlineSnapshot(`
    {
      "end": 18,
      "name": "str",
      "next": {
        "end": 35,
        "name": "#block",
        "next": {
          "end": 57,
          "name": "str",
          "next": {
            "end": 69,
            "name": "/block",
            "next": {
              "end": 91,
              "name": "str",
              "next": {
                "end": 108,
                "name": "#block",
                "next": {
                  "end": 132,
                  "name": "str",
                  "next": {
                    "end": 144,
                    "name": "/block",
                    "next": {
                      "end": 163,
                      "name": "str",
                      "next": null,
                      "previous": [Circular],
                      "raw": "
      </body>
    </html>
    ",
                      "start": 144,
                      "value": "
      </body>
    </html>
    ",
                    },
                    "previous": [Circular],
                    "raw": "{{ /block }}",
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
                "raw": "{{ #block body }}",
                "start": 91,
                "stripAfter": false,
                "stripBefore": false,
                "value": "body",
              },
              "previous": [Circular],
              "raw": "
      </head>
      <body>
      ",
              "start": 69,
              "value": "
      </head>
      <body>
      ",
            },
            "previous": [Circular],
            "raw": "{{ /block }}",
            "start": 57,
            "stripAfter": false,
            "stripBefore": false,
            "value": null,
          },
          "previous": [Circular],
          "raw": "<title>JianJia</title>",
          "start": 35,
          "value": "<title>JianJia</title>",
        },
        "previous": [Circular],
        "raw": "{{ #block head }}",
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
  expect(await new Tokenizer(defaultOptions).parse('{{ #block title }}1{{ /block }}{{ #block title }}2{{ /block }}{{ #block title }}{{ super }}3{{ /block }}')).toMatchInlineSnapshot(`
    {
      "end": 80,
      "name": "#block",
      "next": {
        "end": 49,
        "name": "#block",
        "next": {
          "end": 50,
          "name": "str",
          "next": {
            "end": 62,
            "name": "/block",
            "next": {
              "end": 92,
              "name": "str",
              "next": {
                "end": 104,
                "name": "/block",
                "next": null,
                "previous": [Circular],
                "raw": "{{ /block }}",
                "start": 92,
                "stripAfter": false,
                "stripBefore": false,
                "value": null,
              },
              "previous": [Circular],
              "raw": "3",
              "start": 91,
              "value": "3",
            },
            "previous": [Circular],
            "raw": "{{ /block }}",
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
        "raw": "{{ #block title }}",
        "start": 31,
        "stripAfter": false,
        "stripBefore": false,
        "value": "title",
      },
      "previous": null,
      "raw": "{{ #block title }}",
      "start": 62,
      "stripAfter": false,
      "stripBefore": false,
      "value": "title",
    }
  `)
})

it('whitespace', async () => {
  expect(await new Tokenizer(defaultOptions).parse(' hello {{= name }} ')).toMatchInlineSnapshot(`
    {
      "end": 7,
      "name": "str",
      "next": {
        "end": 18,
        "name": "=",
        "next": {
          "end": 19,
          "name": "str",
          "next": null,
          "previous": [Circular],
          "raw": " ",
          "start": 18,
          "value": " ",
        },
        "previous": [Circular],
        "raw": "{{= name }}",
        "start": 7,
        "stripAfter": false,
        "stripBefore": false,
        "value": "name",
      },
      "previous": null,
      "raw": " hello ",
      "start": 0,
      "value": " hello ",
    }
  `)
})

it('expression', async () => {
  expect(await new Tokenizer(defaultOptions).parse('{{= "hello, {name}" | t name="JianJia" }}')).toMatchInlineSnapshot(`
    {
      "end": 41,
      "name": "=",
      "next": null,
      "previous": null,
      "raw": "{{= "hello, {name}" | t name="JianJia" }}",
      "start": 0,
      "stripAfter": false,
      "stripBefore": false,
      "value": ""hello, {name}" | t name="JianJia"",
    }
  `)
})

it('if/elif/else', async () => {
  expect(await new Tokenizer(defaultOptions).parse('{{ #if x }}x{{ elif y }}y{{ else }}z{{ /if }}')).toMatchInlineSnapshot(`
    {
      "end": 11,
      "name": "#if",
      "next": {
        "end": 12,
        "name": "str",
        "next": {
          "end": 24,
          "name": "elif",
          "next": {
            "end": 25,
            "name": "str",
            "next": {
              "end": 35,
              "name": "else",
              "next": {
                "end": 36,
                "name": "str",
                "next": {
                  "end": 45,
                  "name": "/if",
                  "next": null,
                  "previous": [Circular],
                  "raw": "{{ /if }}",
                  "start": 36,
                  "stripAfter": false,
                  "stripBefore": false,
                  "value": null,
                },
                "previous": [Circular],
                "raw": "z",
                "start": 35,
                "value": "z",
              },
              "previous": [Circular],
              "raw": "{{ else }}",
              "start": 25,
              "stripAfter": false,
              "stripBefore": false,
              "value": null,
            },
            "previous": [Circular],
            "raw": "y",
            "start": 24,
            "value": "y",
          },
          "previous": [Circular],
          "raw": "{{ elif y }}",
          "start": 12,
          "stripAfter": false,
          "stripBefore": false,
          "value": "y",
        },
        "previous": [Circular],
        "raw": "x",
        "start": 11,
        "value": "x",
      },
      "previous": null,
      "raw": "{{ #if x }}",
      "start": 0,
      "stripAfter": false,
      "stripBefore": false,
      "value": "x",
    }
  `)
})
