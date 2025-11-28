import { expect, it } from 'vitest';
import { render, renderFile } from '../test/__helper';
import type { Compiler } from './compiler';
import { Traversal } from './syntax-nodes';
import type { Loc } from './types';

it('error', async () => {
  try {
    await render('{{ for name of names }}{{ endif }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: Unexpected "endif" directive]`,
    );
    expect(error.details).toMatchInlineSnapshot(
      `
      "Unexpected "endif" directive

      1｜ {{ for name of names }}{{ endif }}
       ｜                        ^         ^
      "
    `,
    );
  }

  try {
    await render('{{ for name of names }}{{ endfor }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: c.names is not iterable]`,
    );
    expect(error.details).toMatchInlineSnapshot(
      `
      "c.names is not iterable

      1｜ {{ for name of names }}{{ endfor }}
       ｜             ^^
      "
    `,
    );
  }

  try {
    await render('{{ include "not-found" }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[CompileError: Failed to load template from "not-found"]`,
    );
    expect(error.details).toMatchInlineSnapshot(
      `
      "Failed to load template from "not-found"

      1｜ {{ include "not-found" }}
       ｜ ^                       ^
      "
    `,
    );
  }
});

it('render', async () => {
  expect(await render('{{= name }}', { name: 'foo' })).toMatchInlineSnapshot(
    `"foo"`,
  );
});

it('renderFile', async () => {
  expect(await renderFile('test', { name: 'foo' })).toMatchInlineSnapshot(
    `"foo"`,
  );
});

it('escape tag', async () => {
  expect(await render('{{= "{\\{= escape }\\}" }}')).toMatchInlineSnapshot(
    `"{{= escape }}"`,
  );
  expect(await render('{{= "\\{\\{= escape \\}\\}" }}')).toMatchInlineSnapshot(
    `"{{= escape }}"`,
  );
});

it('auto escape', async () => {
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
  );
});

it('no auto escape', async () => {
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
  );
});

it('expression', async () => {
  expect(await render('{{= name }}', { name: 'foo' })).toMatchInlineSnapshot(
    `"foo"`,
  );
  expect(
    await render('{{= name }} and {{= name }}', { name: 'foo' }),
  ).toMatchInlineSnapshot(`"foo and foo"`);
  expect(await render('{{= "*" }}')).toMatchInlineSnapshot(`"*"`);
});

it('for loop', async () => {
  expect(
    await render('{{ for name of names }}{{= name }}{{ endfor }}', {
      names: ['foo', 'bar'],
    }),
  ).toMatchInlineSnapshot(`"foobar"`);
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
    `
    "
      foo

      bar
    "
  `,
  );
});

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
  );
});

it('if - else - elif', async () => {
  expect(
    await render('{{ if name }}{{= name }}{{ else }}{{= "*" }}{{ endif }}', {
      name: 'foo',
    }),
  ).toMatchInlineSnapshot(`"foo"`);
  expect(
    await render('{{ if name }}{{= name }}{{ else }}{{= "*" }}{{ endif }}'),
  ).toMatchInlineSnapshot(`"*"`);
  expect(
    await render(
      '{{ if name eq "foo" }}1{{ elif name eq "bar" }}2{{ else }}3{{ endif }}',
      {
        name: 'bar',
      },
    ),
  ).toMatchInlineSnapshot(`"2"`);
});

it('for - if', async () => {
  expect(
    await render(
      '{{ for name of names }}{{ if name }}{{= name }}{{ else }}{{= "*" }}{{ endif }}{{ endfor }}',
      {
        names: ['foo', '', 'bar'],
      },
    ),
  ).toMatchInlineSnapshot(`"foo*bar"`);
});

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
  ).toMatchInlineSnapshot(`"x1y3y2x4"`);
  expect(
    await render('{{ for (y, x) of names }}{{=x}}{{=y}}{{ endfor }}', {
      names: [
        { x: 1, y: 3 },
        { y: 2, x: 4 },
      ],
    }),
  ).toMatchInlineSnapshot(`"1342"`);
});

it('set', async () => {
  expect(
    await render('{{= name }}{{ set name = "bar" }}{{= name }}', {
      name: 'foo',
    }),
  ).toMatchInlineSnapshot(`"foobar"`);
});

it('macro - call', async () => {
  expect(
    await render(
      `{{ macro foo = (name = "foo") }}{{= name }}{{caller}}{{ endmacro }}{{ call foo() }}1{{ endcall }}{{ call foo("bar") }}{{ endcall }}`,
    ),
  ).toMatchInlineSnapshot(`"foo1bar"`);
});

it('block', async () => {
  expect(
    await render(
      `{{ block title }}0{{ endblock }}{{ block title }}1{{ endblock }}{{ block title }}{{super}}2{{ endblock }}{{ block title }}3{{super}}{{ endblock }}`,
    ),
  ).toMatchInlineSnapshot(`"312"`);
});

it('include', async () => {
  expect(await render('{{ include "default" }}')).toMatchInlineSnapshot(
    `
    "<html>
      <head>
        {%- block head -%}
          <title>title</title>
        {%- endblock -%}
        {%-include "head"-%}
      </head>
      <body>
        {%- block body -%}
          <h1>body</h1>
        {%- endblock -%}
        {%-include "body"-%}
      </body>
    </html>
    "
  `,
  );
});

it('null', async () => {
  expect(await render('{{= null }}')).toMatchInlineSnapshot(`"null"`);
});

it('custom directive', async () => {
  class CustomNode extends Traversal {
    readonly type: string = 'CUSTOM';

    constructor(public readonly loc: Loc) {
      super();
    }
  }

  expect(
    await render(
      '{{ custom }}',
      {},
      {
        plugins: [
          {
            parsers: {
              async *custom(token) {
                yield 'NEXT';
                yield new CustomNode(token.loc);
              },
            },
            compilers: {
              CUSTOM: async (node: CustomNode, compiler: Compiler) => {
                compiler.pushStr(node.loc, '<CUSTOM/>');
              },
            },
          },
        ],
      },
    ),
  ).toMatchInlineSnapshot(`"<CUSTOM/>"`);
});
