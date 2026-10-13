import { expect, it } from 'vitest';
import { render, renderFile } from '../test/__helper';
import type { Compiler } from './compiler';
import { Renderer } from './renderer';
import { Traversal } from './syntax-nodes';
import type { Loc } from './types';

it('error', async () => {
  try {
    await render('{{ for name of names }}{{ endif }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(`[CompileError: Unexpected "endif"]`);
    expect(error.details).toMatchInlineSnapshot(
      `
      "Unexpected "endif"

      1│ {{ for name of names }}{{ endif }}
       │                        ^         ^


      Suggestions:
        1. An unexpected token was found in the template.
           Fix: Check your template syntax and ensure all markers are properly formatted."
    `,
    );
  }

  try {
    await render('{{= a.b.c }}');
    expect(true).toBe(false);
  } catch (error: any) {
    expect(error).toMatchInlineSnapshot(
      `[RenderError: Cannot read properties of undefined (reading 'b')]`,
    );
    expect(error.details).toMatchInlineSnapshot(`
      "Cannot read properties of undefined (reading 'b')

      1│ {{= a.b.c }}
       │     ^
      "
    `);
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

      1│ {{ include "not-found" }}
       │ ^                       ^
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
  ).toMatchInlineSnapshot(`"foobar"`);
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

it('for - else', async () => {
  expect(
    await render('{{ for name of names }}y{{ else }}n{{ endfor }}', {
      names: [],
    }),
  ).toMatchInlineSnapshot(`"n"`);
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
      `{{ macro foo(name="foo") }}{{= name }}{{caller}}{{ endmacro }}{{ call foo() }}1{{ endcall }}{{ call foo("bar") }}{{ endcall }}`,
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
      <head><title>title</title></head>
      <body><h1>body</h1></body>
    </html>
    "
  `,
  );
});

it('null', async () => {
  expect(await render('{{= null }}')).toMatchInlineSnapshot(`""`);
});

it('custom directive', async () => {
  class CustomNode extends Traversal {
    readonly type = 'CUSTOM';

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
              *custom(token) {
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

it('terminates on directives missing their expression', async () => {
  const errors: string[] = [];
  const renderer = new Renderer({
    debug: (error) => errors.push(error.message),
  });

  for (const template of [
    '{{ if }}a',
    '{{ if }}a{{ endif }}',
    '{{ for }}a{{ endfor }}',
    '{{ if x }}a{{ elif }}b{{ endif }}',
    '{{ if x }}a{{ else 1 }}b{{ endif }}',
    '{{ for x of y }}a{{ else 1 }}b{{ endfor }}',
    '{{ break 1 }}{{ continue }}',
  ]) {
    await renderer.render(template, {});
  }

  expect(errors).toContain('"if" requires expression');
  expect(errors).toContain('"for" requires expression');
}, 2000);

it('deep escape still escapes html', async () => {
  const renderer = new Renderer({ security: { deepEscape: true } });

  expect(
    await renderer.render('{{= a }}{{= b }}', {
      a: '<script>',
      b: ['<b>', { c: '<i>' }],
    }),
  ).toBe('&lt;script&gt;&lt;b&gt;&lt;i&gt;');
});

it('cache never serves another template', async () => {
  const renderer = new Renderer();

  // "Aa" and "BB" collide under a 31-based string hash
  expect(await renderer.render('Aa', {})).toBe('Aa');
  expect(await renderer.render('BB', {})).toBe('BB');
  expect(renderer.getCacheStats()).toMatchObject({ hits: 0, size: 2 });

  expect(await renderer.render('BB', {})).toBe('BB');
  expect(renderer.getCacheStats()).toMatchObject({ hits: 1, size: 2 });
});

it('null and undefined render as empty', async () => {
  const renderer = new Renderer();

  expect(
    await renderer.render('[{{= a }}{{= b }}{{= c.d }}{{= 0 }}{{= false }}]', {
      a: null,
      c: {},
    }),
  ).toBe('[0false]');
  expect(
    await new Renderer({ autoEscape: false }).render('[{{= a }}{{= b }}]', {
      a: null,
    }),
  ).toBe('[]');
});

it('for treats null and undefined as empty and accepts any iterable', async () => {
  const renderer = new Renderer();
  const template =
    '{{ for i of items }}{{= i }}{{ if loop.last }}.{{ endif }}{{ else }}none{{ endfor }}';

  expect(await renderer.render(template, {})).toBe('none');
  expect(await renderer.render(template, { items: null })).toBe('none');
  expect(await renderer.render(template, { items: new Set([1, 2]) })).toBe(
    '12.',
  );
});

it('keeps line endings and special characters of text intact', async () => {
  const text = ['a\r\nb\rc\td\u2028e"f\\g$', '{h}`i'].join('');

  expect(await new Renderer().render(`${text}{{= x }}`, { x: 1 })).toBe(
    `${text}1`,
  );
});

it('expressions cannot reach object internals', async () => {
  const errors: string[] = [];
  const renderer = new Renderer({
    debug: (error) => errors.push(error.message),
  });
  const data = { x: {}, list: [{}] };

  for (const template of [
    '{{= x.constructor }}',
    '{{= constructor }}',
    '{{= x.__proto__ }}',
    '{{= x.toString.constructor("return 1")() }}',
    '{{= x | constructor }}',
    '{{ set __proto__ = x }}',
    '{{ for constructor of list }}{{ endfor }}',
    '{{ macro prototype }}{{ endmacro }}',
  ]) {
    errors.length = 0;
    await renderer.render(template, data);

    expect(errors.join()).toMatch(/is not allowed in expressions/);
  }

  // dynamic keys handed to filters are covered as well
  expect(
    await new Renderer().render(
      '[{{= x | get("constructor") }}{{= x | pick("constructor") | values }}{{= list | map("constructor") }}]',
      data,
    ),
  ).toBe('[]');

  // names that merely live on Object.prototype are ordinary identifiers
  expect(
    await new Renderer().render('{{= toString }}{{= x.valueOf }}', {
      toString: 'a',
      x: { valueOf: 'b' },
    }),
  ).toBe('ab');
});

it('sandbox restricts configured globals but not render data', async () => {
  const renderer = new Renderer({
    globals: { site: 'janja', secret: 'hidden' },
    security: { sandbox: true, allowedGlobals: ['site'] },
  });

  expect(
    await renderer.render('{{= name }}@{{= site }}[{{= secret }}]', {
      name: 'World',
    }),
  ).toBe('World@janja[]');
});

it('cache picks up changes to included templates', async () => {
  const files: Record<string, string> = { a: 'A1{{ include "b" }}', b: 'B1' };
  const loader = async (path: string) => {
    if (!(path in files)) {
      throw new Error('not found');
    }

    return files[path];
  };
  const template = '{{ include "a" }}';
  const renderer = new Renderer({ loader });

  expect(await renderer.render(template, {})).toBe('A1B1');
  expect(await renderer.render(template, {})).toBe('A1B1');
  expect(renderer.getCacheStats()).toMatchObject({ hits: 1 });

  // nested include changed
  files.b = 'B2';
  expect(await renderer.render(template, {})).toBe('A1B2');

  files.a = 'A2';
  expect(await renderer.render(template, {})).toBe('A2');

  // revalidation can be turned off for immutable templates
  const frozen = new Renderer({ loader, cache: { revalidate: false } });

  files.a = 'A3';
  expect(await frozen.render(template, {})).toBe('A3');
  files.a = 'A4';
  expect(await frozen.render(template, {})).toBe('A3');
});

it('cache is enabled unless explicitly disabled', async () => {
  expect(
    new Renderer({ cache: { maxSize: 5 } }).getCacheStats(),
  ).not.toBeNull();
  expect(
    new Renderer({ cache: { enabled: false } }).getCacheStats(),
  ).toBeNull();
});

it('reports the source location of errors on cache hits', async () => {
  const errors: any[] = [];
  const renderer = new Renderer({ debug: (error) => errors.push(error) });

  await renderer.render('ab{{= a.b.c }}', {});
  await renderer.render('ab{{= a.b.c }}', {});

  expect(errors).toHaveLength(2);
  expect(errors[1].details).toBe(errors[0].details);
  expect(errors[1].details).toContain('1│ ab{{= a.b.c }}');
});

it('arithmetic', async () => {
  const renderer = new Renderer();

  expect(
    await renderer.render(
      '{{= a - b }},{{= a -1 }},{{= a-1 }},{{= -1 }},{{= a + -1 }},{{= a | add(-1) }},{{= 5 - 2 - 1 }},{{= a - b * 2 }}',
      { a: 5, b: 2 },
    ),
  ).toBe('3,4,4,-1,4,4,2,1');
});

it('rejects expressions with two operands in a row', async () => {
  const renderer = new Renderer();

  for (const template of [
    '{{= a b }}',
    '{{ if a b }}x{{ endif }}',
    '{{= a "b" }}',
    '{{= a 1 }}',
    '{{= 1 (a) }}',
  ]) {
    await expect(renderer.render(template, { a: 1 })).rejects.toThrow(
      /^Unexpected "/,
    );
  }
});

it('lenient mode reports problems and renders the rest of the template', async () => {
  const lenient = async (template: string) => {
    const errors: string[] = [];
    const output = await new Renderer({
      debug: (error) => errors.push(error.message),
    }).render(template, { a: 1, items: [1, 2] });

    return [output, ...errors];
  };

  expect(await lenient('a{{ nope }}b')).toEqual([
    'a<!--Unknown "nope"-->b',
    'Unknown "nope"',
  ]);
  expect(await lenient('a{{ endif }}b')).toEqual([
    'a<!--Unexpected "endif"-->b',
    'Unexpected "endif"',
  ]);
  expect(await lenient('[{{= (a }}]{{= a }}')).toEqual([
    '[]1',
    'Expected "RP" after "LP"',
    'Invalid "output" directive',
  ]);
  expect(await lenient('[{{ if a | }}x{{ endif }}]{{= a }}')).toEqual([
    '[]1',
    'Expected "ID" after "PIPE"',
    'Invalid "if" directive',
  ]);
  expect(await lenient('[{{ for x }}y{{ endfor }}]{{= a }}')).toEqual([
    '[]1',
    '"for" expects "item of items"',
  ]);
  expect(
    await lenient('{{ for i of items }}{{= (i }}{{= i }}{{ endfor }}'),
  ).toEqual(['12', 'Expected "RP" after "LP"', 'Invalid "output" directive']);
});

it('template variables may use any name', async () => {
  const renderer = new Renderer();

  // these used to collide with variables of the generated code
  expect(
    await renderer.render(
      '{{ for s of list }}{{= s }}{{ endfor }}|{{ for (c, e) of pairs }}{{= c }}{{= e }}{{ endfor }}|{{ for (f=9) of pairs }}{{= f }}{{ endfor }}',
      { list: [1, 2], pairs: [{ c: 'a', e: 'b' }] },
    ),
  ).toBe('12|ab|9');
  expect(
    await renderer.render(
      '{{ macro m(s, c="d") }}[{{= s }}{{= c }}]{{ endmacro }}{{ call m(1) }}{{ endcall }}{{ call m(2, 3) }}{{ endcall }}',
      {},
    ),
  ).toBe('[1d][23]');
});

it('loop scopes do not leak between iterations', async () => {
  const renderer = new Renderer();

  expect(
    await renderer.render(
      '{{ for i of list }}[{{= seen }}]{{ set seen = i }}{{ endfor }}({{= seen }})',
      { list: [1, 2, 3] },
    ),
  ).toBe('[][][]()');
  expect(
    await renderer.render(
      '{{ for i of list }}{{ for j of list }}{{= i }}{{= j }}{{= loop.last }},{{ endfor }}{{= loop.index }};{{ endfor }}',
      { list: [1, 2] },
    ),
  ).toBe('11false,12true,0;21false,22true,1;');
});

it('renders that start together share one compilation', async () => {
  let loads = 0;

  const renderer = new Renderer({
    loader: async () => {
      loads++;
      await new Promise((resolve) => setTimeout(resolve, 5));

      return 'P{{= x }}';
    },
  });
  const renderAll = () =>
    Promise.all(
      [1, 2, 3, 4].map((x) => renderer.render('{{ include "p" }}', { x })),
    );

  expect(await renderAll()).toEqual(['P1', 'P2', 'P3', 'P4']);
  expect(loads).toBe(1);

  // The same goes for checking a cached template for changed includes
  expect(await renderAll()).toEqual(['P1', 'P2', 'P3', 'P4']);
  expect(loads).toBe(2);
});

it('a failed compilation is not shared with later renders', async () => {
  let fail = true;

  const renderer = new Renderer({
    loader: async () => {
      if (fail) {
        throw new Error('offline');
      }

      return 'P';
    },
  });

  await expect(renderer.render('{{ include "p" }}', {})).rejects.toThrow(
    'Failed to load template from "p"',
  );

  fail = false;

  expect(await renderer.render('{{ include "p" }}', {})).toBe('P');
});

it('a template that includes itself without end fails instead of hanging', async () => {
  const renderer = new Renderer({ loader: async () => 'x{{ include "a" }}' });

  await expect(renderer.render('{{ include "a" }}', {})).rejects.toThrow(
    'Includes of "a" are nested too deeply',
  );
});
