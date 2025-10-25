import { expect, it } from 'vitest'
import { parse } from '../test/__helper'

it('escape tag', async () => {
  expect(
    await parse('{{= "{{= escape }}" }}'),
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
    await parse('{{= "\\{\\{= escape \\}\\}" }}'),
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
    await parse(''),
  ).toMatchInlineSnapshot(
    `null`,
  )
  expect(
    await parse(' '),
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
    await parse('{{ if x -}}'),
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
    await parse('{{ if }}'),
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
    await parse('{{-= x }}'),
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
    await parse('{{= }}'),
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
  expect(
    await parse('{{= x + 1 }}'),
  ).toMatchInlineSnapshot(
    `
    {
      "end": 12,
      "name": "=",
      "next": null,
      "previous": null,
      "raw": "{{= x + 1 }}",
      "start": 0,
      "stripAfter": false,
      "stripBefore": false,
      "value": {
        "end": 3,
        "left": {
          "end": 2,
          "raw": "x",
          "start": 1,
          "type": "ID",
          "value": "x",
        },
        "raw": "+",
        "right": {
          "end": 6,
          "raw": "1",
          "start": 5,
          "type": "NUM",
          "value": 1,
        },
        "start": 3,
        "type": "ADD",
        "value": "+",
      },
    }
  `,
  )
})
