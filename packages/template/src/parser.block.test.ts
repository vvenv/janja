import { expect, it } from 'vitest'
import { config } from './config'
import { Parser } from './parser'

it('invalid', async () => {
  try {
    await new Parser(config).parse('{{ block }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[TypeError: Cannot destructure property 'type' of 'token.value' as it is null.]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `undefined`,
    )
  }
  try {
    await new Parser(config).parse('{{ block "" }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[ParseError: "block" tag must have a title]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `
      ""block" tag must have a title

      1: {{ block "" }}
      "
    `,
    )
  }
})

it('1', async () => {
  expect(
    await new Parser(config).parse('{{ block title }}1{{ endblock }}'),
  ).toMatchInlineSnapshot(
    `
    {
      "end": 17,
      "name": "block",
      "next": {
        "end": 18,
        "name": "str",
        "next": {
          "end": 32,
          "name": "endblock",
          "next": null,
          "previous": [Circular],
          "raw": "{{ endblock }}",
          "start": 18,
          "stripAfter": false,
          "stripBefore": false,
          "value": null,
        },
        "previous": [Circular],
        "raw": "1",
        "start": 17,
      },
      "previous": null,
      "raw": "{{ block title }}",
      "start": 0,
      "stripAfter": false,
      "stripBefore": false,
      "value": {
        "end": 5,
        "raw": "title",
        "start": 0,
        "type": "ID",
        "value": "title",
      },
    }
  `,
  )
})

it('2', async () => {
  expect(
    await new Parser(config).parse('{{ block title }}1{{ endblock }}{{ block title }}{{ super }}2{{ endblock }}'),
  ).toMatchInlineSnapshot(
    `
    {
      "end": 49,
      "name": "block",
      "next": {
        "end": 17,
        "name": "block",
        "next": {
          "end": 18,
          "name": "str",
          "next": {
            "end": 32,
            "name": "endblock",
            "next": {
              "end": 61,
              "name": "str",
              "next": {
                "end": 75,
                "name": "endblock",
                "next": null,
                "previous": [Circular],
                "raw": "{{ endblock }}",
                "start": 61,
                "stripAfter": false,
                "stripBefore": false,
                "value": null,
              },
              "previous": [Circular],
              "raw": "2",
              "start": 60,
            },
            "previous": [Circular],
            "raw": "{{ endblock }}",
            "start": 18,
            "stripAfter": false,
            "stripBefore": false,
            "value": null,
          },
          "previous": [Circular],
          "raw": "1",
          "start": 17,
        },
        "previous": [Circular],
        "raw": "{{ block title }}",
        "start": 0,
        "stripAfter": false,
        "stripBefore": false,
        "value": {
          "end": 5,
          "raw": "title",
          "start": 0,
          "type": "ID",
          "value": "title",
        },
      },
      "previous": null,
      "raw": "{{ block title }}",
      "start": 32,
      "stripAfter": false,
      "stripBefore": false,
      "value": {
        "end": 5,
        "raw": "title",
        "start": 0,
        "type": "ID",
        "value": "title",
      },
    }
  `,
  )
})

it('3', async () => {
  expect(
    await new Parser(config).parse('{{ block title }}1{{ endblock }}{{ block title }}2{{ endblock }}{{ block title }}{{ super }}3{{ endblock }}'),
  ).toMatchInlineSnapshot(
    `
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
        },
        "previous": [Circular],
        "raw": "{{ block title }}",
        "start": 32,
        "stripAfter": false,
        "stripBefore": false,
        "value": {
          "end": 5,
          "raw": "title",
          "start": 0,
          "type": "ID",
          "value": "title",
        },
      },
      "previous": null,
      "raw": "{{ block title }}",
      "start": 64,
      "stripAfter": false,
      "stripBefore": false,
      "value": {
        "end": 5,
        "raw": "title",
        "start": 0,
        "type": "ID",
        "value": "title",
      },
    }
  `,
  )
})

it('hoist', async () => {
  expect(
    await new Parser(config).parse('{{ block title }}1{{ endblock }}{{ if x }}{{ block title }}2{{ super }}{{ endblock }}{{ endif }}'),
  ).toMatchInlineSnapshot(

    `
    {
      "end": 59,
      "name": "block",
      "next": {
        "end": 60,
        "name": "str",
        "next": {
          "end": 17,
          "name": "block",
          "next": {
            "end": 18,
            "name": "str",
            "next": {
              "end": 32,
              "name": "endblock",
              "next": {
                "end": 85,
                "name": "endblock",
                "next": {
                  "end": 42,
                  "name": "if",
                  "next": {
                    "end": 96,
                    "name": "endif",
                    "next": null,
                    "previous": [Circular],
                    "raw": "{{ endif }}",
                    "start": 85,
                    "stripAfter": false,
                    "stripBefore": false,
                    "value": null,
                  },
                  "previous": [Circular],
                  "raw": "{{ if x }}",
                  "start": 32,
                  "stripAfter": false,
                  "stripBefore": false,
                  "value": {
                    "end": 1,
                    "raw": "x",
                    "start": 0,
                    "type": "ID",
                    "value": "x",
                  },
                },
                "previous": [Circular],
                "raw": "{{ endblock }}",
                "start": 71,
                "stripAfter": false,
                "stripBefore": false,
                "value": null,
              },
              "previous": [Circular],
              "raw": "{{ endblock }}",
              "start": 18,
              "stripAfter": false,
              "stripBefore": false,
              "value": null,
            },
            "previous": [Circular],
            "raw": "1",
            "start": 17,
          },
          "previous": [Circular],
          "raw": "{{ block title }}",
          "start": 0,
          "stripAfter": false,
          "stripBefore": false,
          "value": {
            "end": 5,
            "raw": "title",
            "start": 0,
            "type": "ID",
            "value": "title",
          },
        },
        "previous": [Circular],
        "raw": "2",
        "start": 59,
      },
      "previous": null,
      "raw": "{{ block title }}",
      "start": 42,
      "stripAfter": false,
      "stripBefore": false,
      "value": {
        "end": 5,
        "raw": "title",
        "start": 0,
        "type": "ID",
        "value": "title",
      },
    }
  `,
  )
})
