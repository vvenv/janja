import { describe, expect, it } from 'vitest'
import { compile, render } from '../test/__helper'
import { loader } from './loaders/file-loader'

describe('autoEscape', async () => {
  it('enabled', async () => {
    expect(
      await render(
        `"
{{= x }}
<>`,
        { x: '<foo>\t</foo>' },
      ),
    ).toMatchInlineSnapshot(`
      ""
      &lt;foo&gt;\t&lt;/foo&gt;
      <>"
    `)
  })

  it('disabled', async () => {
    expect(
      await render(
        `"
{{= x }}
<>`,
        { x: '<foo>\t</foo>' },
        {
          autoEscape: false,
        },
      ),
    ).toMatchInlineSnapshot(`
      ""
      <foo>\t</foo>
      <>"
    `)
  })
})

it('interpolate', async () => {
  expect(await render('{{= name }}', { name: 'foo' })).toMatchInlineSnapshot(
    '"foo"',
  )
  expect(
    await render('{{= name }} and {{= name }}', { name: 'foo' }),
  ).toMatchInlineSnapshot('"foo and foo"')
  expect(await render('{{= "*" }}', {})).toMatchInlineSnapshot('"*"')
})

it('for loop', async () => {
  expect(
    await render('{{ #for name in names }}{{ name }}{{ /for }}', {
      names: ['foo', 'bar'],
    }),
  ).toMatchInlineSnapshot('""')
  expect(
    await render(
      `{{ #for name in names -}}
  {{= name }}
{{- /for }}`,
      {
        names: ['foo', 'bar'],
      },
    ),
  ).toMatchInlineSnapshot(`"foobar"`)
})

it('for loop - nested', async () => {
  expect(
    await render(
      '{{ #for _as in ass }}{{ #for a in _as }}|{{= a }} in {{= _as }} in {{= ass }}|{{ /for }}{{ /for }}',
      {
        ass: ['foo', 'bar'],
      },
    ),
  ).toMatchInlineSnapshot(
    `"|f in foo in foo,bar||o in foo in foo,bar||o in foo in foo,bar||b in bar in foo,bar||a in bar in foo,bar||r in bar in foo,bar|"`,
  )
})

it('if - else', async () => {
  expect(
    await render('{{ #if name }}{{= name }}{{ else }}{{= "*" }}{{ /if }}', {
      name: 'foo',
    }),
  ).toMatchInlineSnapshot('"foo"')
  expect(
    await render('{{ #if name }}{{= name }}{{ else }}{{= "*" }}{{ /if }}', {}),
  ).toMatchInlineSnapshot('"*"')
})

it('mixed', async () => {
  expect(
    await render(
      '{{ #for name in names }}{{ #if name }}{{= name }}{{ else }}{{= "*" }}{{ /if }}{{ /for }}',
      {
        names: ['foo', '', 'bar'],
      },
    ),
  ).toMatchInlineSnapshot(`"foo*bar"`)
})

it('destructing', async () => {
  expect(
    await render(
      '{{ #for name in names }}{{ #for k, v in name }}{{= k }}{{= v }}{{ /for }}{{ /for }}',
      {
        names: [
          { x: 1, y: 3 },
          { y: 2, x: 4 },
        ],
      },
    ),
  ).toMatchInlineSnapshot(`"x1y3y2x4"`)
})

it('layout', async () => {
  expect(
    await render(
      '{{ layout "default" }}',
      {},
      {
        loader: path => loader(`test/${path}`),
      },
    ),
  ).toMatchInlineSnapshot(`
    "<html>
      <head>
      <title>JianJia</title>
      </head>
      <body>
      <h1>Hello, JianJia!</h1>
      </body>
    </html>
    "
  `)
})

it('include', async () => {
  expect(
    await render(
      '{{ layout "default" }}x{{ include "head" }}y{{ include "body" }}z',
      {},
      {
        loader: path => loader(`test/${path}`),
      },
    ),
  ).toMatchInlineSnapshot(`
    "<html>
      <head>
      <title>蒹葭苍苍，白露为霜</title>
      </head>
      <body>
      <h1>蒹葭苍苍，白露为霜</h1>
      </body>
    </html>
    x
    y
    z"
  `)
})

it('include / not found', async () => {
  expect(
    await render(
      '{{ include "fallback" }}',
      {},
      {
        debug: true,
        loader: path => loader(`test/${path}`),
      },
    ),
  ).toMatchInlineSnapshot(`"file not found: test/partials/fallback.jianjia"`)
})

it('include / optional', async () => {
  expect(
    await render(
      '{{ include "fallback"? }}',
      {},
      {
        debug: true,
        loader: path => loader(`test/${path}`),
      },
    ),
  ).toMatchInlineSnapshot(`""`)
})

it('custom tag', async () => {
  expect(
    await render('{{ custom }}', {}, {
      tags: {
        custom: [{
          names: ['custom'],
          compile: async ({ token: { name }, out }) => {
            if (name === 'custom') {
              out.pushStr('CUSTOM')
            }
          },
        }],
      },
    }),
  ).toMatchInlineSnapshot('"CUSTOM"')
})

it('compile error', async () => {
  expect(await compile('{{ #for name in names }}{{ /if }}', { debug: true }))
    .toMatchInlineSnapshot(`
      " JianJia  Unexpected /if

      {{ /if }}

      24:33"
    `)
})

it('render error', async () => {
  expect(
    await render('{{ #for name in names }}{{ /for }}', {}, { debug: true }),
  ).toMatchInlineSnapshot(`
    " JianJia  Cannot convert undefined or null to object

    1: {{ #for name in names }}{{ /for }}
       ^^^^^^^^^^^^^^^^^^^^^^^^
    "
  `)
})
