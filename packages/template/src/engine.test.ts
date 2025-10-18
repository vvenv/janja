/* eslint-disable style/no-tabs */
import { describe, expect, it } from 'vitest'
import { render } from '../test/__helper'
import { loader } from './loaders/file-loader'

it('invalid', async () => {
  try {
    await render('{{ for name of names }}{{ endif }}')
  }
  catch (error: any) {
    expect(error)
      .toMatchInlineSnapshot(
        `[CompileError: unexpected "endif"]`,
      )
    expect(error.details)
      .toMatchInlineSnapshot(
        `
        "unexpected "endif"

           ...
        "
      `,
      )
  }
  try {
    await render('{{ for name of names }}{{ endfor }}')
  }
  catch (error: any) {
    expect(error)
      .toMatchInlineSnapshot(
        `[RenderError: c.names is not iterable]`,
      )
    expect(error.details)
      .toMatchInlineSnapshot(
        `
        "c.names is not iterable

        1: {{ for name of names }}{{ endfor }}
           ^^^^^^^^^^^^^^^^^^^^^^^
        "
      `,
      )
  }
})

it('escape tag', async () => {
  expect(
    await render('{{= "{{= escape }}" }}'),
  ).toMatchInlineSnapshot(
    `"{{= escape " }}"`,
  )
  expect(
    await render('{{= "\\{\\{= escape \\}\\}" }}'),
  ).toMatchInlineSnapshot(
    `"{{= escape }}"`,
  )
})

describe('autoEscape', async () => {
  it('enabled', async () => {
    expect(
      await render(
        `"
{{= x }}
<>`,
        { x: '<foo>\t</foo>' },
      ),
    ).toMatchInlineSnapshot(
      `
      ""
      &lt;foo&gt;	&lt;/foo&gt;
      <>"
    `,
    )
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
    ).toMatchInlineSnapshot(
      `
      ""
      <foo>	</foo>
      <>"
    `,
    )
  })
})

it('interpolate', async () => {
  expect(await render('{{= name }}', { name: 'foo' })).toMatchInlineSnapshot(
    `"foo"`,
  )
  expect(
    await render('{{= name }} and {{= name }}', { name: 'foo' }),
  ).toMatchInlineSnapshot(
    `"foo and foo"`,
  )
  expect(await render('{{= "*" }}')).toMatchInlineSnapshot(
    `"*"`,
  )
})

it('for loop', async () => {
  expect(
    await render('{{ for name of names }}{{ name }}{{ endfor }}', {
      names: ['foo', 'bar'],
    }),
  ).toMatchInlineSnapshot(
    `""`,
  )
  expect(
    await render(
      `{{ for name of names -}}
  {{= name }}
{{- endfor }}`,
      {
        names: ['foo', 'bar'],
      },
    ),
  ).toMatchInlineSnapshot(
    `"foobar"`,
  )
})

it('for loop - nested', async () => {
  expect(
    await render(
      '{{ for _as of ass }}{{ for a of _as | split }}|{{= a }} in {{= _as }} in {{= ass }}|{{ endfor }}{{ endfor }}',
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
    await render('{{ if name }}{{= name }}{{ else }}{{= "*" }}{{ endif }}', {
      name: 'foo',
    }),
  ).toMatchInlineSnapshot(
    `"foo"`,
  )
  expect(
    await render('{{ if name }}{{= name }}{{ else }}{{= "*" }}{{ endif }}'),
  ).toMatchInlineSnapshot(
    `"*"`,
  )
})

it('mixed', async () => {
  expect(
    await render(
      '{{ for name of names }}{{ if name }}{{= name }}{{ else }}{{= "*" }}{{ endif }}{{ endfor }}',
      {
        names: ['foo', '', 'bar'],
      },
    ),
  ).toMatchInlineSnapshot(
    `"foo*bar"`,
  )
})

it('destructing', async () => {
  expect(
    await render(
      '{{ for name of names }}{{ for kv of name | entries }}{{= kv | first }}{{= kv | last }}{{ endfor }}{{ endfor }}',
      {
        names: [
          { x: 1, y: 3 },
          { y: 2, x: 4 },
        ],
      },
    ),
  ).toMatchInlineSnapshot(
    `"x1y3y2x4"`,
  )
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
  ).toMatchInlineSnapshot(
    `
    "<html>
      <head>
      <title>JianJia</title>
      </head>
      <body>
      <h1>Hello, JianJia!</h1>
      </body>
    </html>
    "
  `,
  )
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
  ).toMatchInlineSnapshot(
    `
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
  `,
  )
})

it('include / not found', async () => {
  try {
    await render(
      '{{ include "fallback" }}',
      {},
      {
        loader: path => loader(`test/${path}`),
      },
    )
  }
  catch (error: any) {
    expect(
      error,
    ).toMatchInlineSnapshot(
      `[Error: file not found: test/partials/fallback.jianjia]`,
    )

    expect(
      error.details,
    ).toMatchInlineSnapshot(
      `undefined`,
    )
  }
})

it('include / optional', async () => {
  expect(
    await render(
      '{{ include "fallback"? }}',
      {},
      {
        loader: path => loader(`test/${path}`),
      },
    ),
  ).toMatchInlineSnapshot(
    `""`,
  )
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
  ).toMatchInlineSnapshot(
    `"CUSTOM"`,
  )
})
