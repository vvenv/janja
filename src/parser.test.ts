import { expect, it } from 'vitest'
import { config } from './config'
import { Parser } from './parser'

it('invalid', async () => {
  try {
    await new Parser(config).parse('{{= x + 1 }}')
  }
  catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[ParseError: unexpect "+"]`,
    )
    expect(error.details).toMatchInlineSnapshot(
      `
      "unexpect "+"

      1:  x + 1 
            ^
      "
    `,
    )
  }
})

it('escape tag', async () => {
  expect(
    await new Parser(config).parse('{{= "{{= escape }}" }}'),
  ).toMatchInlineSnapshot(
    `
    {
      "end": 18,
      "name": "=",
      "next": {
        "end": 22,
        "name": "raw",
        "next": null,
        "previous": [Circular],
        "raw": "" }}",
        "start": 18,
      },
      "previous": null,
      "raw": "{{= "{{= escape }}",
      "start": 0,
      "stripAfter": false,
      "stripBefore": false,
      "value": {
        "end": 14,
        "raw": ""{{= escape "",
        "start": 1,
        "type": "STR",
        "value": "{{= escape ",
      },
    }
  `,
  )
  expect(
    await new Parser(config).parse('{{= "\\{\\{= escape \\}\\}" }}'),
  ).toMatchInlineSnapshot(
    `
    {
      "end": 26,
      "name": "=",
      "next": null,
      "previous": null,
      "raw": "{{= "\\{\\{= escape \\}\\}" }}",
      "start": 0,
      "stripAfter": false,
      "stripBefore": false,
      "value": {
        "end": 16,
        "raw": ""{{= escape }}"",
        "start": 1,
        "type": "STR",
        "value": "{{= escape }}",
      },
    }
  `,
  )
})

it('empty', async () => {
  expect(
    await new Parser(config).parse(''),
  ).toMatchInlineSnapshot(
    'null',
  )
  expect(
    await new Parser(config).parse(' '),
  ).toMatchInlineSnapshot(
    `
    {
      "end": 1,
      "name": "raw",
      "next": null,
      "previous": null,
      "raw": " ",
      "start": 0,
    }
  `,
  )
})

it('tag', async () => {
  expect(
    await new Parser(config).parse('{{ if x -}}'),
  ).toMatchInlineSnapshot(
    `
    {
      "end": 11,
      "name": "if",
      "next": null,
      "previous": null,
      "raw": "{{ if x -}}",
      "start": 0,
      "stripAfter": true,
      "stripBefore": false,
      "value": {
        "end": 1,
        "raw": "x",
        "start": 0,
        "type": "ID",
        "value": "x",
      },
    }
  `,
  )
  expect(
    await new Parser(config).parse('{{ if }}'),
  ).toMatchInlineSnapshot(
    `
    {
      "end": 8,
      "name": "if",
      "next": null,
      "previous": null,
      "raw": "{{ if }}",
      "start": 0,
      "stripAfter": false,
      "stripBefore": false,
      "value": null,
    }
  `,
  )
})

it('expression', async () => {
  expect(
    await new Parser(config).parse('{{-= x }}'),
  ).toMatchInlineSnapshot(
    `
    {
      "end": 9,
      "name": "=",
      "next": null,
      "previous": null,
      "raw": "{{-= x }}",
      "start": 0,
      "stripAfter": false,
      "stripBefore": true,
      "value": {
        "end": 2,
        "raw": "x",
        "start": 1,
        "type": "ID",
        "value": "x",
      },
    }
  `,
  )
  expect(
    await new Parser(config).parse('{{= }}'),
  ).toMatchInlineSnapshot(
    `
    {
      "end": 6,
      "name": "=",
      "next": null,
      "previous": null,
      "raw": "{{= }}",
      "start": 0,
      "stripAfter": false,
      "stripBefore": false,
      "value": null,
    }
  `,
  )
})
