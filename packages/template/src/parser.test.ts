import type { EngineOptions } from './types'
import { describe, expect, it } from 'vitest'
import { defaultOptions } from './engine'
import { Parser } from './parser'

expect.addSnapshotSerializer({
  serialize: () => 'AST',
  test: val => val instanceof Parser,
})

it('empty', () => {
  const tree = new Parser({} as Required<EngineOptions>)

  expect(tree.valid).toBe(true)
  expect(tree.tags).toMatchInlineSnapshot(`[]`)

  tree.start({
    name: 'root',
    startIndex: 0,
    endIndex: 0,
  })
  expect(tree.valid).toBe(false)
  expect(tree.tags).toMatchInlineSnapshot(`[]`)

  tree.end({
    name: 'end_root',
    startIndex: 0,
    endIndex: 0,
  })
  expect(tree.valid).toBe(true)
  expect(tree.tags).toMatchInlineSnapshot(`[]`)
})

it('add nodes', () => {
  const parser = new Parser({} as Required<EngineOptions>)

  let i = 0

  expect(parser.valid).toBe(true)
  expect(parser.tags).toMatchInlineSnapshot(`[]`)

  parser.start({
    name: 'root',
    startIndex: i++,
    endIndex: i++,
  })
  expect(parser.valid).toBe(false)

  parser.start({
    name: 'if',
    startIndex: i++,
    endIndex: i++,
    data: 'x',
  })
  expect(parser.valid).toBe(false)

  parser.end({
    name: 'end_if',
    startIndex: i++,
    endIndex: i++,
  })
  expect(parser.valid).toBe(false)

  parser.start({
    name: 'if',
    startIndex: i++,
    endIndex: i++,
    data: 'x',
  })
  expect(parser.valid).toBe(false)

  parser.between({
    name: 'elif',
    startIndex: i,
    endIndex: i,
    data: 'y',
  })
  expect(parser.valid).toBe(false)

  parser.between({
    name: 'else',
    startIndex: i++,
    endIndex: i++,
  })
  expect(parser.valid).toBe(false)

  parser.start({
    name: 'if',
    startIndex: i,
    endIndex: i,
    data: 'z',
  })
  expect(parser.valid).toBe(false)

  parser.start({
    name: 'if',
    startIndex: i++,
    endIndex: i++,
    data: 'x',
  })
  expect(parser.valid).toBe(false)

  parser.end({
    name: 'end_if',
    startIndex: i++,
    endIndex: i++,
  })
  expect(parser.valid).toBe(false)

  parser.end({
    name: 'end_if',
    startIndex: i++,
    endIndex: i++,
  })
  expect(parser.valid).toBe(false)

  parser.end({
    name: 'end_if',
    startIndex: i++,
    endIndex: i++,
  })
  expect(parser.valid).toBe(false)

  parser.end({
    name: 'end_root',
    startIndex: i++,
    endIndex: i++,
  })
  expect(parser.valid).toBe(true)
})

describe('validation', () => {
  it('unexpected end_if node', () => {
    const parser = new Parser({} as Required<EngineOptions>)

    parser.end({
      name: 'end_if',
      startIndex: 0,
      endIndex: 1,
    })
    expect(parser.valid).toBe(true)
    expect(parser.tags).toMatchInlineSnapshot(`[]`)
  })

  it('unexpected else node', () => {
    const parser = new Parser({} as Required<EngineOptions>)

    parser.between({
      name: 'else',
      startIndex: 0,
      endIndex: 1,
    })
    expect(parser.valid).toBe(true)
    expect(parser.tags).toMatchInlineSnapshot(`[]`)
  })

  it('unexpected next node', () => {
    const parser = new Parser({} as Required<EngineOptions>)

    parser.start({
      name: 'raw',
      startIndex: 0,
      endIndex: 1,
    })
    parser.nextNode = 'end_raw'
    parser.end({
      name: 'for',
      startIndex: 2,
      endIndex: 3,
    })
    expect(parser.valid).toBe(false)
    expect(parser.nodes).toMatchInlineSnapshot(`
      [
        {
          "endIndex": 1,
          "name": "raw",
          "next": null,
          "nextSibling": null,
          "previous": null,
          "previousSibling": null,
          "startIndex": 0,
          "tag": AST,
          "tags": [],
        },
      ]
    `)
  })

  it('unexpected next node 2', () => {
    const parser = new Parser({} as Required<EngineOptions>)

    parser.start({
      name: 'raw',
      startIndex: 0,
      endIndex: 1,
    })
    parser.nextNode = 'end_raw'
    parser.between({
      name: 'for',
      startIndex: 2,
      endIndex: 3,
    })
    expect(parser.valid).toBe(false)
    expect(parser.nodes).toMatchInlineSnapshot(`
      [
        {
          "endIndex": 1,
          "name": "raw",
          "next": null,
          "nextSibling": null,
          "previous": null,
          "previousSibling": null,
          "startIndex": 0,
          "tag": AST,
          "tags": [],
        },
      ]
    `)
  })
})

describe('validation w/ debug', () => {
  it('unexpected end_if node', () => {
    try {
      const parser = new Parser({ debug: true } as Required<EngineOptions>)

      parser.end({
        name: 'end_if',
        startIndex: 0,
        endIndex: 1,
      })
    }
    catch (error) {
      expect(error).toMatchInlineSnapshot(`[]`)
    }
  })

  it('unexpected else node', () => {
    try {
      const ast = new Parser({ debug: true } as Required<EngineOptions>)

      ast.between({
        name: 'else',
        startIndex: 0,
        endIndex: 1,
      })
    }
    catch (error) {
      expect(error).toMatchInlineSnapshot(`[]`)
    }
  })

  it('unexpected next node', () => {
    try {
      const ast = new Parser({ debug: true } as Required<EngineOptions>)

      ast.start({
        name: 'raw',
        startIndex: 0,
        endIndex: 1,
      })
      ast.nextNode = 'end_raw'
      ast.end({
        name: 'for',
        startIndex: 2,
        endIndex: 3,
      })
    }
    catch (error) {
      expect(error).toMatchInlineSnapshot(
        `[ASTError: expect "end_raw", "for" found.]`,
      )
    }
  })

  it('unexpected next node 2', () => {
    try {
      const ast = new Parser({ debug: true } as Required<EngineOptions>)

      ast.start({
        name: 'raw',
        startIndex: 0,
        endIndex: 1,
      })
      ast.nextNode = 'end_raw'
      ast.between({
        name: 'for',
        startIndex: 2,
        endIndex: 3,
      })
    }
    catch (error) {
      expect(error).toMatchInlineSnapshot(
        `[ASTError: expect "end_raw", "for" found.]`,
      )
    }
  })
})

describe('verify', () => {
  it('checkStartNode', () => {
    const parser = new Parser({} as Required<EngineOptions>)
    const nodes = [
      { name: 'for', startIndex: 0, endIndex: 1 },
      { name: 'end_if', startIndex: 2, endIndex: 3 },
      { name: 'end_for', startIndex: 4, endIndex: 5 },
    ]
    parser.start(nodes[0])

    expect(parser.checkStartNode('if', nodes[1], false)).toBe(false)
    expect(parser.checkStartNode('for', nodes[2], false)).toBe(true)
  })

  it('checkStartNode /w debug', () => {
    const parser = new Parser({ debug: true } as Required<EngineOptions>)
    const nodes = [
      { name: 'for', startIndex: 0, endIndex: 1 },
      { name: 'end_if', startIndex: 2, endIndex: 3 },
    ]
    parser.start(nodes[0])

    expect(() =>
      parser.checkStartNode('if', nodes[1]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[ASTError: "end_if" must follow "if", not "for".]`,
    )
  })

  it('checkAncestorStartNode', () => {
    const ast = new Parser({} as Required<EngineOptions>)
    const nodes = [
      { name: 'root', startIndex: 0, endIndex: 0 },
      { name: 'for', startIndex: 0, endIndex: 1 },
      { name: 'if', startIndex: 2, endIndex: 3 },
      { name: 'break', startIndex: 4, endIndex: 5 },
    ]

    ast.start(nodes[0])
    ast.nextNode = 'end_raw'
    expect(ast.checkAncestorStartNode('for', nodes[3])).toBe(true)

    ast.nextNode = null
    expect(ast.checkAncestorStartNode('for', nodes[3])).toBe(false)

    ast.start(nodes[1])
    expect(ast.checkAncestorStartNode('for', nodes[3])).toBe(true)

    ast.start(nodes[2])
    expect(ast.checkAncestorStartNode('for', nodes[3])).toBe(true)
  })
})

it('real world', async () => {
  const ast = new Parser(defaultOptions)
  await ast.parse(
    `{{= "hello, {name}" | t name="IJK" }}`,
  )
  expect(ast.tags).toMatchInlineSnapshot(`
    [
      {
        "index": 0,
        "level": 1,
        "nextSibling": null,
        "nodes": [
          {
            "data": ""hello, {name}" | t name="IJK"",
            "endIndex": 37,
            "identifier": "=",
            "name": "expression",
            "next": {
              "data": ""hello, {name}" | t name="IJK"",
              "endIndex": 37,
              "identifier": "=",
              "name": "end_expression",
              "next": {
                "endIndex": 37,
                "name": "end_root",
                "next": null,
                "nextSibling": null,
                "previous": [Circular],
                "previousSibling": {
                  "endIndex": 0,
                  "name": "root",
                  "next": [Circular],
                  "nextSibling": [Circular],
                  "previous": null,
                  "previousSibling": null,
                  "startIndex": 0,
                  "tag": AST,
                  "tags": [Circular],
                },
                "startIndex": 37,
              },
              "nextSibling": null,
              "original": "{{= "hello, {name}" | t name="IJK" }}",
              "previous": [Circular],
              "previousSibling": [Circular],
              "startIndex": 37,
              "stripAfter": false,
              "stripBefore": false,
            },
            "nextSibling": {
              "data": ""hello, {name}" | t name="IJK"",
              "endIndex": 37,
              "identifier": "=",
              "name": "end_expression",
              "next": {
                "endIndex": 37,
                "name": "end_root",
                "next": null,
                "nextSibling": null,
                "previous": [Circular],
                "previousSibling": {
                  "endIndex": 0,
                  "name": "root",
                  "next": [Circular],
                  "nextSibling": [Circular],
                  "previous": null,
                  "previousSibling": null,
                  "startIndex": 0,
                  "tag": AST,
                  "tags": [Circular],
                },
                "startIndex": 37,
              },
              "nextSibling": null,
              "original": "{{= "hello, {name}" | t name="IJK" }}",
              "previous": [Circular],
              "previousSibling": [Circular],
              "startIndex": 37,
              "stripAfter": false,
              "stripBefore": false,
            },
            "original": "{{= "hello, {name}" | t name="IJK" }}",
            "previous": {
              "endIndex": 0,
              "name": "root",
              "next": [Circular],
              "nextSibling": {
                "endIndex": 37,
                "name": "end_root",
                "next": null,
                "nextSibling": null,
                "previous": {
                  "data": ""hello, {name}" | t name="IJK"",
                  "endIndex": 37,
                  "identifier": "=",
                  "name": "end_expression",
                  "next": [Circular],
                  "nextSibling": null,
                  "original": "{{= "hello, {name}" | t name="IJK" }}",
                  "previous": [Circular],
                  "previousSibling": [Circular],
                  "startIndex": 37,
                  "stripAfter": false,
                  "stripBefore": false,
                },
                "previousSibling": [Circular],
                "startIndex": 37,
              },
              "previous": null,
              "previousSibling": null,
              "startIndex": 0,
              "tag": AST,
              "tags": [Circular],
            },
            "previousSibling": null,
            "startIndex": 0,
            "stripAfter": false,
            "stripBefore": false,
            "tag": [Circular],
            "tags": [],
          },
          {
            "data": ""hello, {name}" | t name="IJK"",
            "endIndex": 37,
            "identifier": "=",
            "name": "end_expression",
            "next": {
              "endIndex": 37,
              "name": "end_root",
              "next": null,
              "nextSibling": null,
              "previous": [Circular],
              "previousSibling": {
                "endIndex": 0,
                "name": "root",
                "next": {
                  "data": ""hello, {name}" | t name="IJK"",
                  "endIndex": 37,
                  "identifier": "=",
                  "name": "expression",
                  "next": [Circular],
                  "nextSibling": [Circular],
                  "original": "{{= "hello, {name}" | t name="IJK" }}",
                  "previous": [Circular],
                  "previousSibling": null,
                  "startIndex": 0,
                  "stripAfter": false,
                  "stripBefore": false,
                  "tag": [Circular],
                  "tags": [],
                },
                "nextSibling": [Circular],
                "previous": null,
                "previousSibling": null,
                "startIndex": 0,
                "tag": AST,
                "tags": [Circular],
              },
              "startIndex": 37,
            },
            "nextSibling": null,
            "original": "{{= "hello, {name}" | t name="IJK" }}",
            "previous": {
              "data": ""hello, {name}" | t name="IJK"",
              "endIndex": 37,
              "identifier": "=",
              "name": "expression",
              "next": [Circular],
              "nextSibling": [Circular],
              "original": "{{= "hello, {name}" | t name="IJK" }}",
              "previous": {
                "endIndex": 0,
                "name": "root",
                "next": [Circular],
                "nextSibling": {
                  "endIndex": 37,
                  "name": "end_root",
                  "next": null,
                  "nextSibling": null,
                  "previous": [Circular],
                  "previousSibling": [Circular],
                  "startIndex": 37,
                },
                "previous": null,
                "previousSibling": null,
                "startIndex": 0,
                "tag": AST,
                "tags": [Circular],
              },
              "previousSibling": null,
              "startIndex": 0,
              "stripAfter": false,
              "stripBefore": false,
              "tag": [Circular],
              "tags": [],
            },
            "previousSibling": {
              "data": ""hello, {name}" | t name="IJK"",
              "endIndex": 37,
              "identifier": "=",
              "name": "expression",
              "next": [Circular],
              "nextSibling": [Circular],
              "original": "{{= "hello, {name}" | t name="IJK" }}",
              "previous": {
                "endIndex": 0,
                "name": "root",
                "next": [Circular],
                "nextSibling": {
                  "endIndex": 37,
                  "name": "end_root",
                  "next": null,
                  "nextSibling": null,
                  "previous": [Circular],
                  "previousSibling": [Circular],
                  "startIndex": 37,
                },
                "previous": null,
                "previousSibling": null,
                "startIndex": 0,
                "tag": AST,
                "tags": [Circular],
              },
              "previousSibling": null,
              "startIndex": 0,
              "stripAfter": false,
              "stripBefore": false,
              "tag": [Circular],
              "tags": [],
            },
            "startIndex": 37,
            "stripAfter": false,
            "stripBefore": false,
          },
        ],
        "parent": AST,
        "previousSibling": null,
      },
    ]
  `)
})
