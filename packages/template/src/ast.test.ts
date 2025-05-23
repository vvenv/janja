import { describe, expect, test } from 'vitest';
import { AST } from './ast';
import { tags } from './tags';
import { defaultOptions } from './engine';

expect.addSnapshotSerializer({
  serialize: () => 'AST',
  test: (val) => val instanceof AST,
});

test('empty', () => {
  const tree = new AST({});

  expect(tree.valid).toBe(true);
  expect(tree.children).toMatchInlineSnapshot(`[]`);

  tree.start({
    name: 'root',
    startIndex: 0,
    endIndex: 0,
  });
  expect(tree.valid).toBe(false);
  expect(tree.children).toMatchInlineSnapshot(`[]`);

  tree.end({
    name: 'endroot',
    startIndex: 0,
    endIndex: 0,
  });
  expect(tree.valid).toBe(true);
  expect(tree.children).toMatchInlineSnapshot(`[]`);
});

describe('validation', () => {
  test('Unexpected endif tag', () => {
    const ast = new AST({});

    ast.end({
      name: 'endif',
      startIndex: 0,
      endIndex: 1,
    });
    expect(ast.valid).toBe(true);
    expect(ast.children).toMatchInlineSnapshot(`[]`);
  });

  test('Unexpected else tag', () => {
    const ast = new AST({});

    ast.between({
      name: 'else',
      startIndex: 0,
      endIndex: 1,
    });
    expect(ast.valid).toBe(true);
    expect(ast.children).toMatchInlineSnapshot(`[]`);
  });

  test('Unexpected next tag', () => {
    const ast = new AST({});

    ast.start({
      name: 'raw',
      startIndex: 0,
      endIndex: 1,
    });
    ast.nextTag = 'endraw';
    ast.end({
      name: 'for',
      startIndex: 2,
      endIndex: 3,
    });
    expect(ast.valid).toBe(false);
    expect(ast.tags).toMatchInlineSnapshot(`
      [
        {
          "children": [],
          "endIndex": 1,
          "name": "raw",
          "next": null,
          "node": AST,
          "prev": null,
          "startIndex": 0,
        },
      ]
    `);
  });

  test('Unexpected next tag 2', () => {
    const ast = new AST({});

    ast.start({
      name: 'raw',
      startIndex: 0,
      endIndex: 1,
    });
    ast.nextTag = 'endraw';
    ast.between({
      name: 'for',
      startIndex: 2,
      endIndex: 3,
    });
    expect(ast.valid).toBe(false);
    expect(ast.tags).toMatchInlineSnapshot(`
      [
        {
          "children": [],
          "endIndex": 1,
          "name": "raw",
          "next": null,
          "node": AST,
          "prev": null,
          "startIndex": 0,
        },
      ]
    `);
  });
});

describe('validation w/ debug', () => {
  test('Unexpected endif tag', () => {
    try {
      const ast = new AST({ debug: true });

      ast.end({
        name: 'endif',
        startIndex: 0,
        endIndex: 1,
      });
    } catch (error) {
      expect(error).toMatchInlineSnapshot(`[]`);
    }
  });

  test('Unexpected else tag', () => {
    try {
      const ast = new AST({ debug: true });

      ast.between({
        name: 'else',
        startIndex: 0,
        endIndex: 1,
      });
    } catch (error) {
      expect(error).toMatchInlineSnapshot(`[]`);
    }
  });

  test('Unexpected next tag', () => {
    try {
      const ast = new AST({ debug: true });

      ast.start({
        name: 'raw',
        startIndex: 0,
        endIndex: 1,
      });
      ast.nextTag = 'endraw';
      ast.end({
        name: 'for',
        startIndex: 2,
        endIndex: 3,
      });
    } catch (error) {
      expect(error).toMatchInlineSnapshot(
        `[ASTError: expect "endraw", "for" found.]`,
      );
    }
  });

  test('Unexpected next tag 2', () => {
    try {
      const ast = new AST({ debug: true });

      ast.start({
        name: 'raw',
        startIndex: 0,
        endIndex: 1,
      });
      ast.nextTag = 'endraw';
      ast.between({
        name: 'for',
        startIndex: 2,
        endIndex: 3,
      });
    } catch (error) {
      expect(error).toMatchInlineSnapshot(
        `[ASTError: expect "endraw", "for" found.]`,
      );
    }
  });
});

test('getNextTag', () => {
  const ast = new AST({});
  const tags = [
    { name: 'if', startIndex: 0, endIndex: 1 },
    { name: 'if', startIndex: 2, endIndex: 3 },
    { name: 'else', startIndex: 4, endIndex: 5 },
    { name: 'endif', startIndex: 6, endIndex: 7 },
    { name: 'endif', startIndex: 8, endIndex: 9 },
  ];

  const start1 = ast.start(tags[0]);
  const start2 = ast.start(tags[1]);
  const between = ast.between(tags[2]);
  ast.end(tags[3]);
  ast.end(tags[4]);

  expect(ast.valid).toBe(true);
  expect(ast.getNextTag(start1!)).toBe(start2);
  expect(ast.getNextTag(start2!)).toBe(between);
});

test('verifyFirstTag', () => {
  const ast = new AST({});
  const tags = [
    { name: 'for', startIndex: 0, endIndex: 1 },
    { name: 'endif', startIndex: 2, endIndex: 3 },
    { name: 'endfor', startIndex: 4, endIndex: 5 },
  ];
  ast.start(tags[0]);

  expect(ast.verifyFirstTag('if', tags[1], false)).toBe(false);
  expect(ast.verifyFirstTag('for', tags[2], false)).toBe(true);
});

test('verifyFirstTag /w debug', () => {
  const ast = new AST({ debug: true });
  const tags = [
    { name: 'for', startIndex: 0, endIndex: 1 },
    { name: 'endif', startIndex: 2, endIndex: 3 },
  ];
  ast.start(tags[0]);

  expect(() =>
    ast.verifyFirstTag('if', tags[1]),
  ).toThrowErrorMatchingInlineSnapshot(
    `[ASTError: "endif" must follow "if", not "for".]`,
  );
});

test('verifyStartTag', () => {
  const ast = new AST({});
  const tags = [
    { name: 'root', startIndex: 0, endIndex: 0 },
    { name: 'for', startIndex: 0, endIndex: 1 },
    { name: 'if', startIndex: 2, endIndex: 3 },
    { name: 'break', startIndex: 4, endIndex: 5 },
  ];

  ast.start(tags[0]);
  ast.nextTag = 'endraw';
  expect(ast.verifyStartTag('for', tags[3])).toBe(true);

  ast.nextTag = null;
  expect(ast.verifyStartTag('for', tags[3])).toBe(false);

  ast.start(tags[1]);
  expect(ast.verifyStartTag('for', tags[3])).toBe(true);

  ast.start(tags[2]);
  expect(ast.verifyStartTag('for', tags[3])).toBe(true);
});

test('complicated', () => {
  const ast = new AST({});

  let i = 0;

  expect(ast.valid).toBe(true);
  expect(ast.children).toMatchInlineSnapshot(`[]`);

  ast.start({
    name: 'root',
    startIndex: i++,
    endIndex: i++,
  });
  expect(ast.valid).toBe(false);

  ast.start({
    name: 'if',
    startIndex: i++,
    endIndex: i++,
    rawStatement: 'x',
  });
  expect(ast.valid).toBe(false);

  ast.end({
    name: 'endif',
    startIndex: i++,
    endIndex: i++,
  });
  expect(ast.valid).toBe(false);

  ast.start({
    name: 'if',
    startIndex: i++,
    endIndex: i++,
    rawStatement: 'x',
  });
  expect(ast.valid).toBe(false);

  ast.between({
    name: 'elif',
    startIndex: i,
    endIndex: i,
    rawStatement: 'y',
  });
  expect(ast.valid).toBe(false);

  ast.between({
    name: 'else',
    startIndex: i++,
    endIndex: i++,
  });
  expect(ast.valid).toBe(false);

  ast.start({
    name: 'if',
    startIndex: i,
    endIndex: i,
    rawStatement: 'z',
  });
  expect(ast.valid).toBe(false);

  ast.start({
    name: 'if',
    startIndex: i++,
    endIndex: i++,
    rawStatement: 'x',
  });
  expect(ast.valid).toBe(false);

  ast.end({
    name: 'endif',
    startIndex: i++,
    endIndex: i++,
  });
  expect(ast.valid).toBe(false);

  ast.end({
    name: 'endif',
    startIndex: i++,
    endIndex: i++,
  });
  expect(ast.valid).toBe(false);

  ast.end({
    name: 'endif',
    startIndex: i++,
    endIndex: i++,
  });
  expect(ast.valid).toBe(false);

  ast.end({
    name: 'endroot',
    startIndex: i++,
    endIndex: i++,
  });
  expect(ast.valid).toBe(true);
  expect(ast.children).toMatchInlineSnapshot(`
    [
      {
        "index": 0,
        "level": 1,
        "next": {
          "index": 1,
          "level": 1,
          "next": null,
          "parent": AST,
          "prev": [Circular],
          "tags": [
            {
              "children": [],
              "endIndex": 7,
              "name": "if",
              "next": {
                "children": [],
                "endIndex": 8,
                "name": "elif",
                "next": {
                  "children": [
                    {
                      "index": 0,
                      "level": 2,
                      "next": null,
                      "parent": [Circular],
                      "prev": null,
                      "tags": [
                        {
                          "children": [
                            {
                              "index": 0,
                              "level": 3,
                              "next": null,
                              "parent": [Circular],
                              "prev": null,
                              "tags": [
                                {
                                  "children": [],
                                  "endIndex": 11,
                                  "name": "if",
                                  "next": {
                                    "endIndex": 13,
                                    "name": "endif",
                                    "next": null,
                                    "prev": [Circular],
                                    "startIndex": 12,
                                  },
                                  "node": [Circular],
                                  "prev": null,
                                  "rawStatement": "x",
                                  "startIndex": 10,
                                  "statement": [
                                    {
                                      "type": "expression",
                                      "value": "x",
                                    },
                                  ],
                                },
                                {
                                  "endIndex": 13,
                                  "name": "endif",
                                  "next": null,
                                  "prev": {
                                    "children": [],
                                    "endIndex": 11,
                                    "name": "if",
                                    "next": [Circular],
                                    "node": [Circular],
                                    "prev": null,
                                    "rawStatement": "x",
                                    "startIndex": 10,
                                    "statement": [
                                      {
                                        "type": "expression",
                                        "value": "x",
                                      },
                                    ],
                                  },
                                  "startIndex": 12,
                                },
                              ],
                            },
                          ],
                          "endIndex": 10,
                          "name": "if",
                          "next": {
                            "endIndex": 15,
                            "name": "endif",
                            "next": null,
                            "prev": [Circular],
                            "startIndex": 14,
                          },
                          "node": [Circular],
                          "prev": null,
                          "rawStatement": "z",
                          "startIndex": 10,
                          "statement": [
                            {
                              "type": "expression",
                              "value": "z",
                            },
                          ],
                        },
                        {
                          "endIndex": 15,
                          "name": "endif",
                          "next": null,
                          "prev": {
                            "children": [
                              {
                                "index": 0,
                                "level": 3,
                                "next": null,
                                "parent": [Circular],
                                "prev": null,
                                "tags": [
                                  {
                                    "children": [],
                                    "endIndex": 11,
                                    "name": "if",
                                    "next": {
                                      "endIndex": 13,
                                      "name": "endif",
                                      "next": null,
                                      "prev": [Circular],
                                      "startIndex": 12,
                                    },
                                    "node": [Circular],
                                    "prev": null,
                                    "rawStatement": "x",
                                    "startIndex": 10,
                                    "statement": [
                                      {
                                        "type": "expression",
                                        "value": "x",
                                      },
                                    ],
                                  },
                                  {
                                    "endIndex": 13,
                                    "name": "endif",
                                    "next": null,
                                    "prev": {
                                      "children": [],
                                      "endIndex": 11,
                                      "name": "if",
                                      "next": [Circular],
                                      "node": [Circular],
                                      "prev": null,
                                      "rawStatement": "x",
                                      "startIndex": 10,
                                      "statement": [
                                        {
                                          "type": "expression",
                                          "value": "x",
                                        },
                                      ],
                                    },
                                    "startIndex": 12,
                                  },
                                ],
                              },
                            ],
                            "endIndex": 10,
                            "name": "if",
                            "next": [Circular],
                            "node": [Circular],
                            "prev": null,
                            "rawStatement": "z",
                            "startIndex": 10,
                            "statement": [
                              {
                                "type": "expression",
                                "value": "z",
                              },
                            ],
                          },
                          "startIndex": 14,
                        },
                      ],
                    },
                  ],
                  "endIndex": 9,
                  "name": "else",
                  "next": {
                    "endIndex": 17,
                    "name": "endif",
                    "next": null,
                    "prev": [Circular],
                    "startIndex": 16,
                  },
                  "node": [Circular],
                  "prev": [Circular],
                  "startIndex": 8,
                },
                "node": [Circular],
                "prev": [Circular],
                "rawStatement": "y",
                "startIndex": 8,
                "statement": [
                  {
                    "type": "expression",
                    "value": "y",
                  },
                ],
              },
              "node": [Circular],
              "prev": null,
              "rawStatement": "x",
              "startIndex": 6,
              "statement": [
                {
                  "type": "expression",
                  "value": "x",
                },
              ],
            },
            {
              "children": [],
              "endIndex": 8,
              "name": "elif",
              "next": {
                "children": [
                  {
                    "index": 0,
                    "level": 2,
                    "next": null,
                    "parent": [Circular],
                    "prev": null,
                    "tags": [
                      {
                        "children": [
                          {
                            "index": 0,
                            "level": 3,
                            "next": null,
                            "parent": [Circular],
                            "prev": null,
                            "tags": [
                              {
                                "children": [],
                                "endIndex": 11,
                                "name": "if",
                                "next": {
                                  "endIndex": 13,
                                  "name": "endif",
                                  "next": null,
                                  "prev": [Circular],
                                  "startIndex": 12,
                                },
                                "node": [Circular],
                                "prev": null,
                                "rawStatement": "x",
                                "startIndex": 10,
                                "statement": [
                                  {
                                    "type": "expression",
                                    "value": "x",
                                  },
                                ],
                              },
                              {
                                "endIndex": 13,
                                "name": "endif",
                                "next": null,
                                "prev": {
                                  "children": [],
                                  "endIndex": 11,
                                  "name": "if",
                                  "next": [Circular],
                                  "node": [Circular],
                                  "prev": null,
                                  "rawStatement": "x",
                                  "startIndex": 10,
                                  "statement": [
                                    {
                                      "type": "expression",
                                      "value": "x",
                                    },
                                  ],
                                },
                                "startIndex": 12,
                              },
                            ],
                          },
                        ],
                        "endIndex": 10,
                        "name": "if",
                        "next": {
                          "endIndex": 15,
                          "name": "endif",
                          "next": null,
                          "prev": [Circular],
                          "startIndex": 14,
                        },
                        "node": [Circular],
                        "prev": null,
                        "rawStatement": "z",
                        "startIndex": 10,
                        "statement": [
                          {
                            "type": "expression",
                            "value": "z",
                          },
                        ],
                      },
                      {
                        "endIndex": 15,
                        "name": "endif",
                        "next": null,
                        "prev": {
                          "children": [
                            {
                              "index": 0,
                              "level": 3,
                              "next": null,
                              "parent": [Circular],
                              "prev": null,
                              "tags": [
                                {
                                  "children": [],
                                  "endIndex": 11,
                                  "name": "if",
                                  "next": {
                                    "endIndex": 13,
                                    "name": "endif",
                                    "next": null,
                                    "prev": [Circular],
                                    "startIndex": 12,
                                  },
                                  "node": [Circular],
                                  "prev": null,
                                  "rawStatement": "x",
                                  "startIndex": 10,
                                  "statement": [
                                    {
                                      "type": "expression",
                                      "value": "x",
                                    },
                                  ],
                                },
                                {
                                  "endIndex": 13,
                                  "name": "endif",
                                  "next": null,
                                  "prev": {
                                    "children": [],
                                    "endIndex": 11,
                                    "name": "if",
                                    "next": [Circular],
                                    "node": [Circular],
                                    "prev": null,
                                    "rawStatement": "x",
                                    "startIndex": 10,
                                    "statement": [
                                      {
                                        "type": "expression",
                                        "value": "x",
                                      },
                                    ],
                                  },
                                  "startIndex": 12,
                                },
                              ],
                            },
                          ],
                          "endIndex": 10,
                          "name": "if",
                          "next": [Circular],
                          "node": [Circular],
                          "prev": null,
                          "rawStatement": "z",
                          "startIndex": 10,
                          "statement": [
                            {
                              "type": "expression",
                              "value": "z",
                            },
                          ],
                        },
                        "startIndex": 14,
                      },
                    ],
                  },
                ],
                "endIndex": 9,
                "name": "else",
                "next": {
                  "endIndex": 17,
                  "name": "endif",
                  "next": null,
                  "prev": [Circular],
                  "startIndex": 16,
                },
                "node": [Circular],
                "prev": [Circular],
                "startIndex": 8,
              },
              "node": [Circular],
              "prev": {
                "children": [],
                "endIndex": 7,
                "name": "if",
                "next": [Circular],
                "node": [Circular],
                "prev": null,
                "rawStatement": "x",
                "startIndex": 6,
                "statement": [
                  {
                    "type": "expression",
                    "value": "x",
                  },
                ],
              },
              "rawStatement": "y",
              "startIndex": 8,
              "statement": [
                {
                  "type": "expression",
                  "value": "y",
                },
              ],
            },
            {
              "children": [
                {
                  "index": 0,
                  "level": 2,
                  "next": null,
                  "parent": [Circular],
                  "prev": null,
                  "tags": [
                    {
                      "children": [
                        {
                          "index": 0,
                          "level": 3,
                          "next": null,
                          "parent": [Circular],
                          "prev": null,
                          "tags": [
                            {
                              "children": [],
                              "endIndex": 11,
                              "name": "if",
                              "next": {
                                "endIndex": 13,
                                "name": "endif",
                                "next": null,
                                "prev": [Circular],
                                "startIndex": 12,
                              },
                              "node": [Circular],
                              "prev": null,
                              "rawStatement": "x",
                              "startIndex": 10,
                              "statement": [
                                {
                                  "type": "expression",
                                  "value": "x",
                                },
                              ],
                            },
                            {
                              "endIndex": 13,
                              "name": "endif",
                              "next": null,
                              "prev": {
                                "children": [],
                                "endIndex": 11,
                                "name": "if",
                                "next": [Circular],
                                "node": [Circular],
                                "prev": null,
                                "rawStatement": "x",
                                "startIndex": 10,
                                "statement": [
                                  {
                                    "type": "expression",
                                    "value": "x",
                                  },
                                ],
                              },
                              "startIndex": 12,
                            },
                          ],
                        },
                      ],
                      "endIndex": 10,
                      "name": "if",
                      "next": {
                        "endIndex": 15,
                        "name": "endif",
                        "next": null,
                        "prev": [Circular],
                        "startIndex": 14,
                      },
                      "node": [Circular],
                      "prev": null,
                      "rawStatement": "z",
                      "startIndex": 10,
                      "statement": [
                        {
                          "type": "expression",
                          "value": "z",
                        },
                      ],
                    },
                    {
                      "endIndex": 15,
                      "name": "endif",
                      "next": null,
                      "prev": {
                        "children": [
                          {
                            "index": 0,
                            "level": 3,
                            "next": null,
                            "parent": [Circular],
                            "prev": null,
                            "tags": [
                              {
                                "children": [],
                                "endIndex": 11,
                                "name": "if",
                                "next": {
                                  "endIndex": 13,
                                  "name": "endif",
                                  "next": null,
                                  "prev": [Circular],
                                  "startIndex": 12,
                                },
                                "node": [Circular],
                                "prev": null,
                                "rawStatement": "x",
                                "startIndex": 10,
                                "statement": [
                                  {
                                    "type": "expression",
                                    "value": "x",
                                  },
                                ],
                              },
                              {
                                "endIndex": 13,
                                "name": "endif",
                                "next": null,
                                "prev": {
                                  "children": [],
                                  "endIndex": 11,
                                  "name": "if",
                                  "next": [Circular],
                                  "node": [Circular],
                                  "prev": null,
                                  "rawStatement": "x",
                                  "startIndex": 10,
                                  "statement": [
                                    {
                                      "type": "expression",
                                      "value": "x",
                                    },
                                  ],
                                },
                                "startIndex": 12,
                              },
                            ],
                          },
                        ],
                        "endIndex": 10,
                        "name": "if",
                        "next": [Circular],
                        "node": [Circular],
                        "prev": null,
                        "rawStatement": "z",
                        "startIndex": 10,
                        "statement": [
                          {
                            "type": "expression",
                            "value": "z",
                          },
                        ],
                      },
                      "startIndex": 14,
                    },
                  ],
                },
              ],
              "endIndex": 9,
              "name": "else",
              "next": {
                "endIndex": 17,
                "name": "endif",
                "next": null,
                "prev": [Circular],
                "startIndex": 16,
              },
              "node": [Circular],
              "prev": {
                "children": [],
                "endIndex": 8,
                "name": "elif",
                "next": [Circular],
                "node": [Circular],
                "prev": {
                  "children": [],
                  "endIndex": 7,
                  "name": "if",
                  "next": [Circular],
                  "node": [Circular],
                  "prev": null,
                  "rawStatement": "x",
                  "startIndex": 6,
                  "statement": [
                    {
                      "type": "expression",
                      "value": "x",
                    },
                  ],
                },
                "rawStatement": "y",
                "startIndex": 8,
                "statement": [
                  {
                    "type": "expression",
                    "value": "y",
                  },
                ],
              },
              "startIndex": 8,
            },
            {
              "endIndex": 17,
              "name": "endif",
              "next": null,
              "prev": {
                "children": [
                  {
                    "index": 0,
                    "level": 2,
                    "next": null,
                    "parent": [Circular],
                    "prev": null,
                    "tags": [
                      {
                        "children": [
                          {
                            "index": 0,
                            "level": 3,
                            "next": null,
                            "parent": [Circular],
                            "prev": null,
                            "tags": [
                              {
                                "children": [],
                                "endIndex": 11,
                                "name": "if",
                                "next": {
                                  "endIndex": 13,
                                  "name": "endif",
                                  "next": null,
                                  "prev": [Circular],
                                  "startIndex": 12,
                                },
                                "node": [Circular],
                                "prev": null,
                                "rawStatement": "x",
                                "startIndex": 10,
                                "statement": [
                                  {
                                    "type": "expression",
                                    "value": "x",
                                  },
                                ],
                              },
                              {
                                "endIndex": 13,
                                "name": "endif",
                                "next": null,
                                "prev": {
                                  "children": [],
                                  "endIndex": 11,
                                  "name": "if",
                                  "next": [Circular],
                                  "node": [Circular],
                                  "prev": null,
                                  "rawStatement": "x",
                                  "startIndex": 10,
                                  "statement": [
                                    {
                                      "type": "expression",
                                      "value": "x",
                                    },
                                  ],
                                },
                                "startIndex": 12,
                              },
                            ],
                          },
                        ],
                        "endIndex": 10,
                        "name": "if",
                        "next": {
                          "endIndex": 15,
                          "name": "endif",
                          "next": null,
                          "prev": [Circular],
                          "startIndex": 14,
                        },
                        "node": [Circular],
                        "prev": null,
                        "rawStatement": "z",
                        "startIndex": 10,
                        "statement": [
                          {
                            "type": "expression",
                            "value": "z",
                          },
                        ],
                      },
                      {
                        "endIndex": 15,
                        "name": "endif",
                        "next": null,
                        "prev": {
                          "children": [
                            {
                              "index": 0,
                              "level": 3,
                              "next": null,
                              "parent": [Circular],
                              "prev": null,
                              "tags": [
                                {
                                  "children": [],
                                  "endIndex": 11,
                                  "name": "if",
                                  "next": {
                                    "endIndex": 13,
                                    "name": "endif",
                                    "next": null,
                                    "prev": [Circular],
                                    "startIndex": 12,
                                  },
                                  "node": [Circular],
                                  "prev": null,
                                  "rawStatement": "x",
                                  "startIndex": 10,
                                  "statement": [
                                    {
                                      "type": "expression",
                                      "value": "x",
                                    },
                                  ],
                                },
                                {
                                  "endIndex": 13,
                                  "name": "endif",
                                  "next": null,
                                  "prev": {
                                    "children": [],
                                    "endIndex": 11,
                                    "name": "if",
                                    "next": [Circular],
                                    "node": [Circular],
                                    "prev": null,
                                    "rawStatement": "x",
                                    "startIndex": 10,
                                    "statement": [
                                      {
                                        "type": "expression",
                                        "value": "x",
                                      },
                                    ],
                                  },
                                  "startIndex": 12,
                                },
                              ],
                            },
                          ],
                          "endIndex": 10,
                          "name": "if",
                          "next": [Circular],
                          "node": [Circular],
                          "prev": null,
                          "rawStatement": "z",
                          "startIndex": 10,
                          "statement": [
                            {
                              "type": "expression",
                              "value": "z",
                            },
                          ],
                        },
                        "startIndex": 14,
                      },
                    ],
                  },
                ],
                "endIndex": 9,
                "name": "else",
                "next": [Circular],
                "node": [Circular],
                "prev": {
                  "children": [],
                  "endIndex": 8,
                  "name": "elif",
                  "next": [Circular],
                  "node": [Circular],
                  "prev": {
                    "children": [],
                    "endIndex": 7,
                    "name": "if",
                    "next": [Circular],
                    "node": [Circular],
                    "prev": null,
                    "rawStatement": "x",
                    "startIndex": 6,
                    "statement": [
                      {
                        "type": "expression",
                        "value": "x",
                      },
                    ],
                  },
                  "rawStatement": "y",
                  "startIndex": 8,
                  "statement": [
                    {
                      "type": "expression",
                      "value": "y",
                    },
                  ],
                },
                "startIndex": 8,
              },
              "startIndex": 16,
            },
          ],
        },
        "parent": AST,
        "prev": null,
        "tags": [
          {
            "children": [],
            "endIndex": 3,
            "name": "if",
            "next": {
              "endIndex": 5,
              "name": "endif",
              "next": null,
              "prev": [Circular],
              "startIndex": 4,
            },
            "node": [Circular],
            "prev": null,
            "rawStatement": "x",
            "startIndex": 2,
            "statement": [
              {
                "type": "expression",
                "value": "x",
              },
            ],
          },
          {
            "endIndex": 5,
            "name": "endif",
            "next": null,
            "prev": {
              "children": [],
              "endIndex": 3,
              "name": "if",
              "next": [Circular],
              "node": [Circular],
              "prev": null,
              "rawStatement": "x",
              "startIndex": 2,
              "statement": [
                {
                  "type": "expression",
                  "value": "x",
                },
              ],
            },
            "startIndex": 4,
          },
        ],
      },
      {
        "index": 1,
        "level": 1,
        "next": null,
        "parent": AST,
        "prev": {
          "index": 0,
          "level": 1,
          "next": [Circular],
          "parent": AST,
          "prev": null,
          "tags": [
            {
              "children": [],
              "endIndex": 3,
              "name": "if",
              "next": {
                "endIndex": 5,
                "name": "endif",
                "next": null,
                "prev": [Circular],
                "startIndex": 4,
              },
              "node": [Circular],
              "prev": null,
              "rawStatement": "x",
              "startIndex": 2,
              "statement": [
                {
                  "type": "expression",
                  "value": "x",
                },
              ],
            },
            {
              "endIndex": 5,
              "name": "endif",
              "next": null,
              "prev": {
                "children": [],
                "endIndex": 3,
                "name": "if",
                "next": [Circular],
                "node": [Circular],
                "prev": null,
                "rawStatement": "x",
                "startIndex": 2,
                "statement": [
                  {
                    "type": "expression",
                    "value": "x",
                  },
                ],
              },
              "startIndex": 4,
            },
          ],
        },
        "tags": [
          {
            "children": [],
            "endIndex": 7,
            "name": "if",
            "next": {
              "children": [],
              "endIndex": 8,
              "name": "elif",
              "next": {
                "children": [
                  {
                    "index": 0,
                    "level": 2,
                    "next": null,
                    "parent": [Circular],
                    "prev": null,
                    "tags": [
                      {
                        "children": [
                          {
                            "index": 0,
                            "level": 3,
                            "next": null,
                            "parent": [Circular],
                            "prev": null,
                            "tags": [
                              {
                                "children": [],
                                "endIndex": 11,
                                "name": "if",
                                "next": {
                                  "endIndex": 13,
                                  "name": "endif",
                                  "next": null,
                                  "prev": [Circular],
                                  "startIndex": 12,
                                },
                                "node": [Circular],
                                "prev": null,
                                "rawStatement": "x",
                                "startIndex": 10,
                                "statement": [
                                  {
                                    "type": "expression",
                                    "value": "x",
                                  },
                                ],
                              },
                              {
                                "endIndex": 13,
                                "name": "endif",
                                "next": null,
                                "prev": {
                                  "children": [],
                                  "endIndex": 11,
                                  "name": "if",
                                  "next": [Circular],
                                  "node": [Circular],
                                  "prev": null,
                                  "rawStatement": "x",
                                  "startIndex": 10,
                                  "statement": [
                                    {
                                      "type": "expression",
                                      "value": "x",
                                    },
                                  ],
                                },
                                "startIndex": 12,
                              },
                            ],
                          },
                        ],
                        "endIndex": 10,
                        "name": "if",
                        "next": {
                          "endIndex": 15,
                          "name": "endif",
                          "next": null,
                          "prev": [Circular],
                          "startIndex": 14,
                        },
                        "node": [Circular],
                        "prev": null,
                        "rawStatement": "z",
                        "startIndex": 10,
                        "statement": [
                          {
                            "type": "expression",
                            "value": "z",
                          },
                        ],
                      },
                      {
                        "endIndex": 15,
                        "name": "endif",
                        "next": null,
                        "prev": {
                          "children": [
                            {
                              "index": 0,
                              "level": 3,
                              "next": null,
                              "parent": [Circular],
                              "prev": null,
                              "tags": [
                                {
                                  "children": [],
                                  "endIndex": 11,
                                  "name": "if",
                                  "next": {
                                    "endIndex": 13,
                                    "name": "endif",
                                    "next": null,
                                    "prev": [Circular],
                                    "startIndex": 12,
                                  },
                                  "node": [Circular],
                                  "prev": null,
                                  "rawStatement": "x",
                                  "startIndex": 10,
                                  "statement": [
                                    {
                                      "type": "expression",
                                      "value": "x",
                                    },
                                  ],
                                },
                                {
                                  "endIndex": 13,
                                  "name": "endif",
                                  "next": null,
                                  "prev": {
                                    "children": [],
                                    "endIndex": 11,
                                    "name": "if",
                                    "next": [Circular],
                                    "node": [Circular],
                                    "prev": null,
                                    "rawStatement": "x",
                                    "startIndex": 10,
                                    "statement": [
                                      {
                                        "type": "expression",
                                        "value": "x",
                                      },
                                    ],
                                  },
                                  "startIndex": 12,
                                },
                              ],
                            },
                          ],
                          "endIndex": 10,
                          "name": "if",
                          "next": [Circular],
                          "node": [Circular],
                          "prev": null,
                          "rawStatement": "z",
                          "startIndex": 10,
                          "statement": [
                            {
                              "type": "expression",
                              "value": "z",
                            },
                          ],
                        },
                        "startIndex": 14,
                      },
                    ],
                  },
                ],
                "endIndex": 9,
                "name": "else",
                "next": {
                  "endIndex": 17,
                  "name": "endif",
                  "next": null,
                  "prev": [Circular],
                  "startIndex": 16,
                },
                "node": [Circular],
                "prev": [Circular],
                "startIndex": 8,
              },
              "node": [Circular],
              "prev": [Circular],
              "rawStatement": "y",
              "startIndex": 8,
              "statement": [
                {
                  "type": "expression",
                  "value": "y",
                },
              ],
            },
            "node": [Circular],
            "prev": null,
            "rawStatement": "x",
            "startIndex": 6,
            "statement": [
              {
                "type": "expression",
                "value": "x",
              },
            ],
          },
          {
            "children": [],
            "endIndex": 8,
            "name": "elif",
            "next": {
              "children": [
                {
                  "index": 0,
                  "level": 2,
                  "next": null,
                  "parent": [Circular],
                  "prev": null,
                  "tags": [
                    {
                      "children": [
                        {
                          "index": 0,
                          "level": 3,
                          "next": null,
                          "parent": [Circular],
                          "prev": null,
                          "tags": [
                            {
                              "children": [],
                              "endIndex": 11,
                              "name": "if",
                              "next": {
                                "endIndex": 13,
                                "name": "endif",
                                "next": null,
                                "prev": [Circular],
                                "startIndex": 12,
                              },
                              "node": [Circular],
                              "prev": null,
                              "rawStatement": "x",
                              "startIndex": 10,
                              "statement": [
                                {
                                  "type": "expression",
                                  "value": "x",
                                },
                              ],
                            },
                            {
                              "endIndex": 13,
                              "name": "endif",
                              "next": null,
                              "prev": {
                                "children": [],
                                "endIndex": 11,
                                "name": "if",
                                "next": [Circular],
                                "node": [Circular],
                                "prev": null,
                                "rawStatement": "x",
                                "startIndex": 10,
                                "statement": [
                                  {
                                    "type": "expression",
                                    "value": "x",
                                  },
                                ],
                              },
                              "startIndex": 12,
                            },
                          ],
                        },
                      ],
                      "endIndex": 10,
                      "name": "if",
                      "next": {
                        "endIndex": 15,
                        "name": "endif",
                        "next": null,
                        "prev": [Circular],
                        "startIndex": 14,
                      },
                      "node": [Circular],
                      "prev": null,
                      "rawStatement": "z",
                      "startIndex": 10,
                      "statement": [
                        {
                          "type": "expression",
                          "value": "z",
                        },
                      ],
                    },
                    {
                      "endIndex": 15,
                      "name": "endif",
                      "next": null,
                      "prev": {
                        "children": [
                          {
                            "index": 0,
                            "level": 3,
                            "next": null,
                            "parent": [Circular],
                            "prev": null,
                            "tags": [
                              {
                                "children": [],
                                "endIndex": 11,
                                "name": "if",
                                "next": {
                                  "endIndex": 13,
                                  "name": "endif",
                                  "next": null,
                                  "prev": [Circular],
                                  "startIndex": 12,
                                },
                                "node": [Circular],
                                "prev": null,
                                "rawStatement": "x",
                                "startIndex": 10,
                                "statement": [
                                  {
                                    "type": "expression",
                                    "value": "x",
                                  },
                                ],
                              },
                              {
                                "endIndex": 13,
                                "name": "endif",
                                "next": null,
                                "prev": {
                                  "children": [],
                                  "endIndex": 11,
                                  "name": "if",
                                  "next": [Circular],
                                  "node": [Circular],
                                  "prev": null,
                                  "rawStatement": "x",
                                  "startIndex": 10,
                                  "statement": [
                                    {
                                      "type": "expression",
                                      "value": "x",
                                    },
                                  ],
                                },
                                "startIndex": 12,
                              },
                            ],
                          },
                        ],
                        "endIndex": 10,
                        "name": "if",
                        "next": [Circular],
                        "node": [Circular],
                        "prev": null,
                        "rawStatement": "z",
                        "startIndex": 10,
                        "statement": [
                          {
                            "type": "expression",
                            "value": "z",
                          },
                        ],
                      },
                      "startIndex": 14,
                    },
                  ],
                },
              ],
              "endIndex": 9,
              "name": "else",
              "next": {
                "endIndex": 17,
                "name": "endif",
                "next": null,
                "prev": [Circular],
                "startIndex": 16,
              },
              "node": [Circular],
              "prev": [Circular],
              "startIndex": 8,
            },
            "node": [Circular],
            "prev": {
              "children": [],
              "endIndex": 7,
              "name": "if",
              "next": [Circular],
              "node": [Circular],
              "prev": null,
              "rawStatement": "x",
              "startIndex": 6,
              "statement": [
                {
                  "type": "expression",
                  "value": "x",
                },
              ],
            },
            "rawStatement": "y",
            "startIndex": 8,
            "statement": [
              {
                "type": "expression",
                "value": "y",
              },
            ],
          },
          {
            "children": [
              {
                "index": 0,
                "level": 2,
                "next": null,
                "parent": [Circular],
                "prev": null,
                "tags": [
                  {
                    "children": [
                      {
                        "index": 0,
                        "level": 3,
                        "next": null,
                        "parent": [Circular],
                        "prev": null,
                        "tags": [
                          {
                            "children": [],
                            "endIndex": 11,
                            "name": "if",
                            "next": {
                              "endIndex": 13,
                              "name": "endif",
                              "next": null,
                              "prev": [Circular],
                              "startIndex": 12,
                            },
                            "node": [Circular],
                            "prev": null,
                            "rawStatement": "x",
                            "startIndex": 10,
                            "statement": [
                              {
                                "type": "expression",
                                "value": "x",
                              },
                            ],
                          },
                          {
                            "endIndex": 13,
                            "name": "endif",
                            "next": null,
                            "prev": {
                              "children": [],
                              "endIndex": 11,
                              "name": "if",
                              "next": [Circular],
                              "node": [Circular],
                              "prev": null,
                              "rawStatement": "x",
                              "startIndex": 10,
                              "statement": [
                                {
                                  "type": "expression",
                                  "value": "x",
                                },
                              ],
                            },
                            "startIndex": 12,
                          },
                        ],
                      },
                    ],
                    "endIndex": 10,
                    "name": "if",
                    "next": {
                      "endIndex": 15,
                      "name": "endif",
                      "next": null,
                      "prev": [Circular],
                      "startIndex": 14,
                    },
                    "node": [Circular],
                    "prev": null,
                    "rawStatement": "z",
                    "startIndex": 10,
                    "statement": [
                      {
                        "type": "expression",
                        "value": "z",
                      },
                    ],
                  },
                  {
                    "endIndex": 15,
                    "name": "endif",
                    "next": null,
                    "prev": {
                      "children": [
                        {
                          "index": 0,
                          "level": 3,
                          "next": null,
                          "parent": [Circular],
                          "prev": null,
                          "tags": [
                            {
                              "children": [],
                              "endIndex": 11,
                              "name": "if",
                              "next": {
                                "endIndex": 13,
                                "name": "endif",
                                "next": null,
                                "prev": [Circular],
                                "startIndex": 12,
                              },
                              "node": [Circular],
                              "prev": null,
                              "rawStatement": "x",
                              "startIndex": 10,
                              "statement": [
                                {
                                  "type": "expression",
                                  "value": "x",
                                },
                              ],
                            },
                            {
                              "endIndex": 13,
                              "name": "endif",
                              "next": null,
                              "prev": {
                                "children": [],
                                "endIndex": 11,
                                "name": "if",
                                "next": [Circular],
                                "node": [Circular],
                                "prev": null,
                                "rawStatement": "x",
                                "startIndex": 10,
                                "statement": [
                                  {
                                    "type": "expression",
                                    "value": "x",
                                  },
                                ],
                              },
                              "startIndex": 12,
                            },
                          ],
                        },
                      ],
                      "endIndex": 10,
                      "name": "if",
                      "next": [Circular],
                      "node": [Circular],
                      "prev": null,
                      "rawStatement": "z",
                      "startIndex": 10,
                      "statement": [
                        {
                          "type": "expression",
                          "value": "z",
                        },
                      ],
                    },
                    "startIndex": 14,
                  },
                ],
              },
            ],
            "endIndex": 9,
            "name": "else",
            "next": {
              "endIndex": 17,
              "name": "endif",
              "next": null,
              "prev": [Circular],
              "startIndex": 16,
            },
            "node": [Circular],
            "prev": {
              "children": [],
              "endIndex": 8,
              "name": "elif",
              "next": [Circular],
              "node": [Circular],
              "prev": {
                "children": [],
                "endIndex": 7,
                "name": "if",
                "next": [Circular],
                "node": [Circular],
                "prev": null,
                "rawStatement": "x",
                "startIndex": 6,
                "statement": [
                  {
                    "type": "expression",
                    "value": "x",
                  },
                ],
              },
              "rawStatement": "y",
              "startIndex": 8,
              "statement": [
                {
                  "type": "expression",
                  "value": "y",
                },
              ],
            },
            "startIndex": 8,
          },
          {
            "endIndex": 17,
            "name": "endif",
            "next": null,
            "prev": {
              "children": [
                {
                  "index": 0,
                  "level": 2,
                  "next": null,
                  "parent": [Circular],
                  "prev": null,
                  "tags": [
                    {
                      "children": [
                        {
                          "index": 0,
                          "level": 3,
                          "next": null,
                          "parent": [Circular],
                          "prev": null,
                          "tags": [
                            {
                              "children": [],
                              "endIndex": 11,
                              "name": "if",
                              "next": {
                                "endIndex": 13,
                                "name": "endif",
                                "next": null,
                                "prev": [Circular],
                                "startIndex": 12,
                              },
                              "node": [Circular],
                              "prev": null,
                              "rawStatement": "x",
                              "startIndex": 10,
                              "statement": [
                                {
                                  "type": "expression",
                                  "value": "x",
                                },
                              ],
                            },
                            {
                              "endIndex": 13,
                              "name": "endif",
                              "next": null,
                              "prev": {
                                "children": [],
                                "endIndex": 11,
                                "name": "if",
                                "next": [Circular],
                                "node": [Circular],
                                "prev": null,
                                "rawStatement": "x",
                                "startIndex": 10,
                                "statement": [
                                  {
                                    "type": "expression",
                                    "value": "x",
                                  },
                                ],
                              },
                              "startIndex": 12,
                            },
                          ],
                        },
                      ],
                      "endIndex": 10,
                      "name": "if",
                      "next": {
                        "endIndex": 15,
                        "name": "endif",
                        "next": null,
                        "prev": [Circular],
                        "startIndex": 14,
                      },
                      "node": [Circular],
                      "prev": null,
                      "rawStatement": "z",
                      "startIndex": 10,
                      "statement": [
                        {
                          "type": "expression",
                          "value": "z",
                        },
                      ],
                    },
                    {
                      "endIndex": 15,
                      "name": "endif",
                      "next": null,
                      "prev": {
                        "children": [
                          {
                            "index": 0,
                            "level": 3,
                            "next": null,
                            "parent": [Circular],
                            "prev": null,
                            "tags": [
                              {
                                "children": [],
                                "endIndex": 11,
                                "name": "if",
                                "next": {
                                  "endIndex": 13,
                                  "name": "endif",
                                  "next": null,
                                  "prev": [Circular],
                                  "startIndex": 12,
                                },
                                "node": [Circular],
                                "prev": null,
                                "rawStatement": "x",
                                "startIndex": 10,
                                "statement": [
                                  {
                                    "type": "expression",
                                    "value": "x",
                                  },
                                ],
                              },
                              {
                                "endIndex": 13,
                                "name": "endif",
                                "next": null,
                                "prev": {
                                  "children": [],
                                  "endIndex": 11,
                                  "name": "if",
                                  "next": [Circular],
                                  "node": [Circular],
                                  "prev": null,
                                  "rawStatement": "x",
                                  "startIndex": 10,
                                  "statement": [
                                    {
                                      "type": "expression",
                                      "value": "x",
                                    },
                                  ],
                                },
                                "startIndex": 12,
                              },
                            ],
                          },
                        ],
                        "endIndex": 10,
                        "name": "if",
                        "next": [Circular],
                        "node": [Circular],
                        "prev": null,
                        "rawStatement": "z",
                        "startIndex": 10,
                        "statement": [
                          {
                            "type": "expression",
                            "value": "z",
                          },
                        ],
                      },
                      "startIndex": 14,
                    },
                  ],
                },
              ],
              "endIndex": 9,
              "name": "else",
              "next": [Circular],
              "node": [Circular],
              "prev": {
                "children": [],
                "endIndex": 8,
                "name": "elif",
                "next": [Circular],
                "node": [Circular],
                "prev": {
                  "children": [],
                  "endIndex": 7,
                  "name": "if",
                  "next": [Circular],
                  "node": [Circular],
                  "prev": null,
                  "rawStatement": "x",
                  "startIndex": 6,
                  "statement": [
                    {
                      "type": "expression",
                      "value": "x",
                    },
                  ],
                },
                "rawStatement": "y",
                "startIndex": 8,
                "statement": [
                  {
                    "type": "expression",
                    "value": "y",
                  },
                ],
              },
              "startIndex": 8,
            },
            "startIndex": 16,
          },
        ],
      },
    ]
  `);
});

test('real world', () => {
  const ast = new AST(defaultOptions);
  ast.parse(`{{ "hello, {name}" | t name="IJK" }}`, tags);
  expect(ast.children).toMatchInlineSnapshot(`
    [
      {
        "index": 0,
        "level": 1,
        "next": null,
        "parent": AST,
        "prev": null,
        "tags": [
          {
            "children": [],
            "endIndex": 36,
            "name": "expression",
            "next": {
              "endIndex": 36,
              "name": "endexpression",
              "next": null,
              "prev": [Circular],
              "startIndex": 36,
              "stripAfter": false,
              "stripBefore": false,
            },
            "node": [Circular],
            "prev": null,
            "rawStatement": ""hello, {name}" | t name="IJK"",
            "startIndex": 0,
            "statement": [
              {
                "filters": [
                  {
                    "args": "name="IJK"",
                    "name": "t",
                  },
                ],
                "type": "expression",
                "value": ""hello, {name}"",
              },
            ],
            "stripAfter": false,
            "stripBefore": false,
          },
          {
            "endIndex": 36,
            "name": "endexpression",
            "next": null,
            "prev": {
              "children": [],
              "endIndex": 36,
              "name": "expression",
              "next": [Circular],
              "node": [Circular],
              "prev": null,
              "rawStatement": ""hello, {name}" | t name="IJK"",
              "startIndex": 0,
              "statement": [
                {
                  "filters": [
                    {
                      "args": "name="IJK"",
                      "name": "t",
                    },
                  ],
                  "type": "expression",
                  "value": ""hello, {name}"",
                },
              ],
              "stripAfter": false,
              "stripBefore": false,
            },
            "startIndex": 36,
            "stripAfter": false,
            "stripBefore": false,
          },
        ],
      },
    ]
  `);
});
