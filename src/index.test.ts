/* eslint-disable style/no-tabs */
import type { Config, ObjectType } from '.'
import { expect, it } from 'vitest'
import { render as _render, renderFile as _renderFile } from '.'
import { loader } from './loaders/file-loader'

function render(template: string, data: ObjectType = {}, options?: Config) {
  return _render(template, data, options)
}

function renderFile(filepath: string, data: ObjectType = {}, options?: Config) {
  return _renderFile(filepath, data, options)
}

it('render', async () => {
  expect(
    await render('{{= name }}', { name: 'foo' }),
  ).toMatchInlineSnapshot(
    `"foo"`,
  )
})

it('renderFile', async () => {
  expect(
    await renderFile('test.jianjia', { name: 'foo' }, {
      loader: path => loader(`test/${path}`),
    }),
  ).toMatchInlineSnapshot(
    `"foo"`,
  )
})

it('renderFile w/ cache', async () => {
  expect(
    await renderFile('test.jianjia', { name: 'foo' }, {
      loader: path => loader(`test/${path}`),
      cache: true,
    }),
  ).toMatchInlineSnapshot(
    `"foo"`,
  )
  expect(
    await renderFile('test.jianjia', { name: 'bar' }, {
      loader: path => loader(`test/${path}`),
      cache: true,
    }),
  ).toMatchInlineSnapshot(
    `"bar"`,
  )
})

it('invalid', async () => {
  try {
    await render('{{ for name of names }}{{ endif }}')
    expect(true).toBe(false)
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
    expect(true).toBe(false)
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

it('autoEscape', async () => {
  expect(
    await render(
      `"
{{= x }}
<foo>\t</foo>`,
      { x: '<foo>\t</foo>' },
    ),
  ).toMatchInlineSnapshot(
    `
    ""
    &lt;foo&gt;	&lt;/foo&gt;
    <foo>	</foo>"
  `,
  )
})

it('autoEscape disabled', async () => {
  expect(
    await render(
      `"
{{= x }}
<foo>\t</foo>`,
      { x: '<foo>\t</foo>' },
      {
        autoEscape: false,
      },
    ),
  ).toMatchInlineSnapshot(
    `
    ""
    <foo>	</foo>
    <foo>	</foo>"
  `,
  )
})

it('expression', async () => {
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
    await render('{{ for name of names }}{{= name }}{{ endfor }}', {
      names: ['foo', 'bar'],
    }),
  ).toMatchInlineSnapshot(
    `"foobar"`,
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

it('if - else - elif', async () => {
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
  expect(
    await render('{{ if name eq "foo" }}1{{ elif name eq "bar" }}2{{ else }}3{{ endif }}', {
      name: 'bar',
    }),
  ).toMatchInlineSnapshot(
    `"2"`,
  )
})

it('for - if', async () => {
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

it('for - destructing', async () => {
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
  expect(
    await render(
      '{{ for (y, x) of names }}{{=x}}{{=y}}{{ endfor }}',
      {
        names: [
          { x: 1, y: 3 },
          { y: 2, x: 4 },
        ],
      },
    ),
  ).toMatchInlineSnapshot(
    `"1342"`,
  )
})

it('set', async () => {
  expect(
    await render('{{= name }}{{ set name = "bar" }}{{= name }}', {
      name: 'foo',
    }),
  ).toMatchInlineSnapshot(
    `"foobar"`,
  )
})

it('macro - call', async () => {
  expect(
    await render(
      `{{ macro foo = (name = "foo") }}{{= name }}{{caller}}{{ endmacro }}{{ call foo() }}1{{ endcall }}{{ call foo("bar") }}{{ endcall }}`,
      {},
    ),
  ).toMatchInlineSnapshot(
    `"foo1bar"`,
  )
})

it('block', async () => {
  expect(
    await render(
      `{{ block title }}0{{ endblock }}{{ block title }}1{{ endblock }}{{ block title }}{{super}}2{{ endblock }}{{ block title }}3{{super}}{{ endblock }}`,
      {},
    ),
  ).toMatchInlineSnapshot(
    `"312"`,
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
    expect(true).toBe(false)
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
      compilers: {
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
